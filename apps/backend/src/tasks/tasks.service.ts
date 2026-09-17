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
import type { Task } from '../graphql/task.types';
import type { JwtPayload } from '../auth/jwt-payload';

export type UpdateTaskPayload = {
  text?: string;
  isDone?: boolean;
};

@Injectable()
export class TasksService implements OnModuleInit, OnModuleDestroy {
  private client!: Client;

  private readonly taskSelectSql = `
  SELECT
    t.id,
    t.text,
    t.isdone,
    t.date,
    t.deleted,
    t.user_id,
    u.email AS owner_email
  FROM tasks t
  INNER JOIN users u ON u.id = t.user_id
`;

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
      userId: Number(row.user_id),
      ownerEmail: String(row.owner_email),
    };
  }

  private async findById(id: number): Promise<Task> {
    const res = await this.client.query(
      `${this.taskSelectSql} WHERE t.id = $1`,
      [id],
    );

    if (res.rows.length === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    return this.mapRow(res.rows[0]);
  }

  private resolveOwnerFilter(
    viewer: JwtPayload,
    ownerId?: number | null,
  ): number | null {
    if (viewer.role !== 'admin') {
      return viewer.sub;
    }

    if (ownerId === undefined || ownerId === null) {
      return null;
    }

    return ownerId;
  }

  private async assertCanModifyTask(
    id: number,
    viewer: JwtPayload,
  ): Promise<void> {
    if (viewer.role === 'admin') {
      return;
    }

    const res = await this.client.query(
      `SELECT user_id FROM tasks WHERE id = $1`,
      [id],
    );

    if (res.rows.length === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    if (Number(res.rows[0].user_id) !== viewer.sub) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }

  async findActive(
    viewer: JwtPayload,
    ownerId?: number | null,
  ): Promise<Task[]> {
    const filterUserId = this.resolveOwnerFilter(viewer, ownerId);

    // Admin all tasks
    if (filterUserId === null) {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = false
        ORDER BY t.id ASC`,
      );

      return res.rows.map((row) => this.mapRow(row));
    }

    // User's tasks for user or admin if pass ownerId
    const res = await this.client.query(
      `${this.taskSelectSql}
      WHERE t.deleted = false AND t.user_id = $1
      ORDER BY t.id ASC`,
      [filterUserId],
    );

    return res.rows.map((row) => this.mapRow(row));
  }

  async findBin(viewer: JwtPayload, ownerId?: number | null): Promise<Task[]> {
    const filterUserId = this.resolveOwnerFilter(viewer, ownerId);

    // Admin all tasks
    if (filterUserId === null) {
      const res = await this.client.query(
        `${this.taskSelectSql}
         WHERE t.deleted = true
         ORDER BY t.id ASC`,
      );

      return res.rows.map((row) => this.mapRow(row));
    }

    // User's tasks for user or admin if pass ownerId
    const res = await this.client.query(
      `${this.taskSelectSql}
       WHERE t.deleted = true AND t.user_id = $1
       ORDER BY t.id ASC`,
      [filterUserId],
    );

    return res.rows.map((row) => this.mapRow(row));
  }

  // async create(text: string, isDone: boolean): Promise<Task> {
  //   const res = await this.client.query(
  //     'INSERT INTO tasks (text, isDone) VALUES ($1, $2) RETURNING *',
  //     [text, isDone],
  //   );
  //   return this.mapRow(res.rows[0]);
  // }

  async create(text: string, isDone: boolean, userId: number): Promise<Task> {
    const insertResult = await this.client.query(
      `INSERT INTO tasks (text, isdone, user_id) VALUES ($1, $2, $3) RETURNING id`,
      [text, isDone, userId],
    );

    const newId = Number(insertResult.rows[0].id);

    return this.findById(newId);
  }

  async update(
    id: number,
    dto: UpdateTaskPayload,
    viewer: JwtPayload,
  ): Promise<Task> {
    await this.assertCanModifyTask(id, viewer);

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

    // const row = res.rows[0];

    // return {
    //   id: Number(row.id),
    //   text: row.text,
    //   isDone: Boolean(row.isdone),
    //   date: new Date(row.date).toLocaleString(),
    // };
    return this.findById(Number(res.rows[0].id));
  }

  async moveToBin(id: number, viewer: JwtPayload): Promise<Task> {
    await this.assertCanModifyTask(id, viewer);

    const res = await this.client.query(
      // 'UPDATE tasks SET deleted=true WHERE id=$1 RETURNING *',
      'UPDATE tasks SET deleted=true WHERE id=$1 RETURNING id',
      [id],
    );

    if (res.rows.length === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    // return this.mapRow(res.rows[0]);
    return this.findById(Number(res.rows[0].id));
  }

  async moveTaskToActive(id: number, viewer: JwtPayload): Promise<Task> {
    await this.assertCanModifyTask(id, viewer);

    const res = await this.client.query(
      // 'UPDATE tasks SET deleted=false WHERE id=$1 RETURNING *',
      'UPDATE tasks SET deleted=false WHERE id=$1 RETURNING id',
      [id],
    );

    if (res.rows.length === 0) {
      throw new HttpException('Task not found in bin', HttpStatus.NOT_FOUND);
    }

    // return this.mapRow(res.rows[0]);
    return this.findById(Number(res.rows[0].id));
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

  async moveCompletedToBin(
    viewer: JwtPayload,
    ownerId?: number | null,
  ): Promise<{ moved: Task[]; tasks: Task[] }> {
    const filterUserId = this.resolveOwnerFilter(viewer, ownerId);

    const completedRes =
      filterUserId === null
        ? await this.client.query(
            // 'SELECT * FROM tasks WHERE isdone=true AND deleted=false ORDER BY id ASC',
            `${this.taskSelectSql}
      WHERE t.isdone = true AND t.deleted = false
      ORDER BY t.id ASC`,
          )
        : await this.client.query(
            `${this.taskSelectSql}
      WHERE t.isdone = true AND t.deleted = false AND t.user_id = $1
      ORDER BY t.id ASC`,
            [filterUserId],
          );

    if (completedRes.rows.length === 0) {
      throw new HttpException('No completed tasks found', HttpStatus.NOT_FOUND);
    }

    // Admin all tasks
    if (filterUserId === null) {
      await this.client.query(
        'UPDATE tasks SET deleted=true WHERE isdone=true AND deleted=false',
      );
    }
    // User's tasks for user or admin if pass ownerId
    else {
      await this.client.query(
        'UPDATE tasks SET deleted=true WHERE isdone=true AND deleted=false AND user_id=$1',
        [filterUserId],
      );
    }

    const moved = completedRes.rows.map((row) => this.mapRow(row));
    const tasks = await this.findActive(viewer, ownerId);

    return { moved, tasks };
  }

  async markAll(viewer: JwtPayload, ownerId?: number | null): Promise<Task[]> {
    const filterUserId = this.resolveOwnerFilter(viewer, ownerId);

    // Admin all tasks
    if (filterUserId === null) {
      await this.client.query(
        'UPDATE tasks SET isdone=true WHERE isdone=false AND deleted=false',
      );
    }
    // User's tasks for user or admin if pass ownerId
    else {
      await this.client.query(
        'UPDATE tasks SET isdone=true WHERE isdone=false AND deleted=false AND user_id=$1',
        [filterUserId],
      );
    }

    return this.findActive(viewer, ownerId);
  }

  async unmarkAll(
    viewer: JwtPayload,
    ownerId?: number | null,
  ): Promise<Task[]> {
    const filterUserId = this.resolveOwnerFilter(viewer, ownerId);

    // Admin all tasks
    if (filterUserId === null) {
      await this.client.query(
        'UPDATE tasks SET isdone=false WHERE deleted=false',
      );
    }
    // User's tasks for user or admin if pass ownerId
    else {
      await this.client.query(
        `UPDATE tasks
         SET isdone = false
         WHERE deleted = false AND user_id = $1`,
        [filterUserId],
      );
    }

    return this.findActive(viewer, ownerId);
  }
}
