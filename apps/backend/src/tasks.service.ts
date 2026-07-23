/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import type { Task } from './graphql/task.types';

export type UpdateTaskPayload = {
  text?: string;
  isDone?: boolean;
};

@Injectable()
export class TasksService implements OnModuleInit, OnModuleDestroy {
  private client!: Client;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('PGHOST', 'localhost');
    const port = parseInt(this.configService.get<string>('PGPORT', '5432'), 10);
    const user = this.configService.get<string>('PGUSER', 'todo_user');
    const password = this.configService.get<string>('PGPASSWORD', '');
    const database = this.configService.get<string>('PGDATABASE', 'todo_db');

    this.client = new Client({
      host,
      port,
      user,
      password,
      database,
    });
    await this.client.connect();
    console.log('✅ PostgreSQL connected!');
  }

  async onModuleDestroy() {
    await this.client.end();
  }

  private mapRow(row: Record<string, unknown>): Task {
    return {
      id: Number(row.id),
      text: String(row.text),
      isDone: row.isdone === true || row.isdone === 't',
      date: new Date(row.date as string).toLocaleString(),
    };
  }

  async findActive(): Promise<Task[]> {
    const res = await this.client.query(
      'SELECT * FROM tasks WHERE deleted=false ORDER BY id ASC',
    );
    return res.rows.map((row) => this.mapRow(row));
  }

  async findBin(): Promise<Task[]> {
    const res = await this.client.query(
      'SELECT * FROM tasks WHERE deleted=true ORDER BY id ASC',
    );
    return res.rows.map((row) => this.mapRow(row));
  }

  async create(text: string, isDone: boolean): Promise<Task> {
    const res = await this.client.query(
      'INSERT INTO tasks (text, isDone) VALUES ($1, $2) RETURNING *',
      [text, isDone],
    );
    return this.mapRow(res.rows[0]);
  }

  async update(id: number, dto: UpdateTaskPayload): Promise<Task> {
    const updates: string[] = [];
    const values: unknown[] = [id];

    if (dto.text !== undefined) {
      updates.push(`text = $${values.length + 1}`);
      values.push(dto.text);
    }
    if (dto.isDone !== undefined) {
      updates.push(`isdone = $${values.length + 1}`);
      values.push(dto.isDone);
    }

    if (updates.length === 0) {
      throw new HttpException(
        'No fields to update (send text and/or isDone)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const query = `
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $1 AND deleted = false
      RETURNING *
    `;
    const res = await this.client.query(query, values);

    if (res.rows.length === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    const row = res.rows[0];
    return {
      id: Number(row.id),
      text: row.text,
      isDone: Boolean(row.isdone),
      date: new Date(row.date).toLocaleString(),
    };
  }

  async moveToBin(id: number): Promise<Task> {
    const res = await this.client.query(
      'UPDATE tasks SET deleted=true WHERE id=$1 RETURNING *',
      [id],
    );
    if (res.rows.length === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return this.mapRow(res.rows[0]);
  }

  async moveTaskToActive(id: number): Promise<Task> {
    const res = await this.client.query(
      'UPDATE tasks SET deleted=false WHERE id=$1 RETURNING *',
      [id],
    );
    if (res.rows.length === 0) {
      throw new HttpException('Task not found in bin', HttpStatus.NOT_FOUND);
    }
    return this.mapRow(res.rows[0]);
  }

  async permanentlyDeleteFromBin(id: number): Promise<boolean> {
    const res = await this.client.query(
      'DELETE FROM tasks WHERE id=$1 RETURNING *',
      [id],
    );
    if (res.rows.length === 0) {
      throw new HttpException('Task not found in bin', HttpStatus.NOT_FOUND);
    }
    return true;
  }

  async moveCompletedToBin(): Promise<{ moved: Task[]; tasks: Task[] }> {
    const completedRes = await this.client.query(
      'SELECT * FROM tasks WHERE isdone=true AND deleted=false ORDER BY id ASC',
    );
    if (completedRes.rows.length === 0) {
      throw new HttpException('No completed tasks found', HttpStatus.NOT_FOUND);
    }

    await this.client.query(
      'UPDATE tasks SET deleted=true WHERE isdone=true AND deleted=false',
    );

    const moved = completedRes.rows.map((row) => this.mapRow(row));

    const tasksRes = await this.client.query(
      'SELECT * FROM tasks WHERE deleted=false ORDER BY id ASC',
    );
    const tasks = tasksRes.rows.map((row) => this.mapRow(row));

    return { moved, tasks };
  }

  async markAll(): Promise<Task[]> {
    await this.client.query(
      'UPDATE tasks SET isdone=true WHERE isdone=false AND deleted=false',
    );
    const res = await this.client.query(
      'SELECT * FROM tasks WHERE deleted=false ORDER BY id ASC',
    );
    return res.rows.map((row) => this.mapRow(row));
  }

  async unmarkAll(): Promise<Task[]> {
    await this.client.query(
      'UPDATE tasks SET isdone=false WHERE deleted=false',
    );
    const res = await this.client.query(
      'SELECT * FROM tasks WHERE deleted=false ORDER BY id ASC',
    );
    return res.rows.map((row) => this.mapRow(row));
  }
}
