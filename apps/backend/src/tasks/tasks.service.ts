/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, type QueryResult } from 'pg';
import type { Task } from '../graphql/task.types';
import type { JwtPayload } from '../auth/jwt-payload';
import { canModifyTask, canHardDeleteTask } from '@repo/permissions';

export type UpdateTaskPayload = {
  text?: string;
  isDone?: boolean;
};

type TaskListScope =
  | { kind: 'self' }
  | { kind: 'visible' }
  | { kind: 'role'; role: 'user' | 'manager' }
  | { kind: 'user'; userId: number };

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
    u.email AS owner_email,
    u.deleted_at AS owner_deleted_at,
    u.role AS owner_role
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
      ownerDeleted: row.owner_deleted_at != null,
      ownerRole: String(row.owner_role),
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

    const row = res.rows[0] as Record<string, unknown>;

    return this.mapRow(row);
    // return this.mapRow(res.rows[0]);
  }

  private async resolveScope(
    viewer: JwtPayload,
    ownerId?: number | null,
    ownerRole?: string | null,
  ): Promise<TaskListScope> {
    if (viewer.role === 'user') {
      return { kind: 'self' };
    }

    if (ownerId != null) {
      if (ownerId === viewer.sub) {
        return { kind: 'self' };
      }

      if (viewer.role === 'admin') {
        return { kind: 'user', userId: ownerId };
      }

      const res = await this.client.query<{ role: string }>(
        `SELECT role FROM users WHERE id = $1`,
        [ownerId],
      );

      if (res.rows.length === 0 || res.rows[0].role !== 'user') {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      return { kind: 'user', userId: ownerId };
    }

    if (ownerRole != null) {
      if (ownerRole !== 'user' && ownerRole !== 'manager') {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      if (viewer.role === 'manager' && ownerRole !== 'user') {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      return { kind: 'role', role: ownerRole };
    }

    return { kind: 'visible' };
  }

  private async checkCanModifyTask(
    taskId: number,
    viewer: JwtPayload,
  ): Promise<void> {
    if (viewer.role === 'admin') {
      return;
    }

    const res = await this.client.query(
      // `SELECT user_id FROM tasks WHERE id = $1`,
      `SELECT t.user_id, u.role AS owner_role
       FROM tasks t
       INNER JOIN users u ON u.id = t.user_id
       WHERE t.id = $1`,
      [taskId],
    );

    if (res.rows.length === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    // if (Number(res.rows[0].user_id) !== viewer.sub) {
    //   throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    // }
    if (
      !canModifyTask(
        { id: viewer.sub, role: viewer.role },
        {
          ownerId: Number(res.rows[0].user_id),
          ownerRole: String(res.rows[0].owner_role),
        },
      )
    ) {
      // real exception, isn't used because user mustn't know that the task with this id exists, better return 404
      // throw new HttpException('Insufficient permissions: You are not allowed to modify this task', HttpStatus.FORBIDDEN);
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }

  async findActive(
    viewer: JwtPayload,
    ownerId?: number | null,
    ownerRole?: string | null,
  ): Promise<Task[]> {
    // const filterUserId = this.resolveOwnerFilter(viewer, ownerId);
    const scope = await this.resolveScope(viewer, ownerId, ownerRole);

    if (scope.kind === 'self') {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = false AND t.user_id = $1
        ORDER BY t.id ASC`,
        [viewer.sub],
      );

      return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
    }

    if (scope.kind === 'user') {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = false AND t.user_id = $1
        ORDER BY t.id ASC`,
        [scope.userId],
      );

      return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
    }

    if (scope.kind === 'role') {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = false AND u.role = $1
        ORDER BY t.id ASC`,
        [scope.role],
      );

      return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
    }

    if (viewer.role === 'manager') {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = false
          AND (t.user_id = $1 OR u.role = 'user')
        ORDER BY t.id ASC`,
        [viewer.sub],
      );

      return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
    }

    const res = await this.client.query(
      `${this.taskSelectSql}
      WHERE t.deleted = false
      ORDER BY t.id ASC`,
    );

    return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async findBin(
    viewer: JwtPayload,
    ownerId?: number | null,
    ownerRole?: string | null,
  ): Promise<Task[]> {
    // const filterUserId = this.resolveOwnerFilter(viewer, ownerId);
    const scope = await this.resolveScope(viewer, ownerId, ownerRole);

    if (scope.kind === 'self') {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = true AND t.user_id = $1
        ORDER BY t.id ASC`,
        [viewer.sub],
      );

      return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
    }

    if (scope.kind === 'user') {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = true AND t.user_id = $1
        ORDER BY t.id ASC`,
        [scope.userId],
      );

      return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
    }

    if (scope.kind === 'role') {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = true AND u.role = $1
        ORDER BY t.id ASC`,
        [scope.role],
      );

      return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
    }

    if (viewer.role === 'manager') {
      const res = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.deleted = true
          AND (t.user_id = $1 OR u.role = 'user')
        ORDER BY t.id ASC`,
        [viewer.sub],
      );

      return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
    }

    const res = await this.client.query(
      `${this.taskSelectSql}
      WHERE t.deleted = true
      ORDER BY t.id ASC`,
    );

    return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  // async create(text: string, isDone: boolean): Promise<Task> {
  //   const res = await this.client.query(
  //     'INSERT INTO tasks (text, isDone) VALUES ($1, $2) RETURNING *',
  //     [text, isDone],
  //   );
  //   return this.mapRow(res.rows[0]);
  // }

  async create(
    text: string,
    isDone: boolean,
    viewer: JwtPayload,
    ownerId?: number | null,
  ): Promise<Task> {
    let userId = viewer.sub;
    if (ownerId != null && ownerId !== viewer.sub) {
      const scope = await this.resolveScope(viewer, ownerId, null);

      if (scope.kind !== 'user') {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      userId = scope.userId;
    }

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
    await this.checkCanModifyTask(id, viewer);

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
    await this.checkCanModifyTask(id, viewer);

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
    await this.checkCanModifyTask(id, viewer);

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
  async permanentlyDeleteFromBin(
    id: number,
    viewer: JwtPayload,
  ): Promise<boolean> {
    const res = await this.client.query(
      `SELECT t.user_id, u.role AS owner_role
       FROM tasks t
       INNER JOIN users u ON u.id = t.user_id
       WHERE t.id = $1 AND t.deleted = true`,
      [id],
    );

    if (res.rows.length === 0) {
      throw new HttpException('Task not found in bin', HttpStatus.NOT_FOUND);
    }

    if (
      !canHardDeleteTask(
        { id: viewer.sub, role: viewer.role },
        {
          ownerId: Number(res.rows[0].user_id),
          ownerRole: String(res.rows[0].owner_role),
        },
      )
    ) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    await this.client.query('DELETE FROM tasks WHERE id = $1', [id]);

    return true;
  }

  async moveCompletedToBin(
    viewer: JwtPayload,
    ownerId?: number | null,
    ownerRole?: string | null,
  ): Promise<{ moved: Task[]; tasks: Task[] }> {
    const scope = await this.resolveScope(viewer, ownerId, ownerRole);
    let completedRes: QueryResult<Record<string, unknown>>;

    if (scope.kind === 'self') {
      completedRes = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.isdone = true AND t.deleted = false AND t.user_id = $1
        ORDER BY t.id ASC`,
        [viewer.sub],
      );
    } else if (scope.kind === 'user') {
      completedRes = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.isdone = true AND t.deleted = false AND t.user_id = $1
        ORDER BY t.id ASC`,
        [scope.userId],
      );
    } else if (scope.kind === 'role') {
      completedRes = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.isdone = true AND t.deleted = false AND u.role = $1
        ORDER BY t.id ASC`,
        [scope.role],
      );
    } else if (viewer.role === 'manager') {
      completedRes = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.isdone = true
          AND t.deleted = false
          AND (t.user_id = $1 OR u.role = 'user')
        ORDER BY t.id ASC`,
        [viewer.sub],
      );
    } else {
      completedRes = await this.client.query(
        `${this.taskSelectSql}
        WHERE t.isdone = true AND t.deleted = false
        ORDER BY t.id ASC`,
      );
    }

    if (completedRes.rows.length === 0) {
      throw new HttpException('No completed tasks found', HttpStatus.NOT_FOUND);
    }

    if (scope.kind === 'self') {
      await this.client.query(
        `UPDATE tasks
         SET deleted = true
         WHERE isdone = true AND deleted = false AND user_id = $1`,
        [viewer.sub],
      );
    } else if (scope.kind === 'user') {
      await this.client.query(
        `UPDATE tasks
         SET deleted = true
         WHERE isdone = true AND deleted = false AND user_id = $1`,
        [scope.userId],
      );
    } else if (scope.kind === 'role') {
      await this.client.query(
        `UPDATE tasks t
         SET deleted = true
         FROM users u
         WHERE u.id = t.user_id
           AND t.isdone = true
           AND t.deleted = false
           AND u.role = $1`,
        [scope.role],
      );
    } else if (viewer.role === 'manager') {
      await this.client.query(
        `UPDATE tasks t
         SET deleted = true
         FROM users u
         WHERE u.id = t.user_id
           AND t.isdone = true
           AND t.deleted = false
           AND (t.user_id = $1 OR u.role = 'user')`,
        [viewer.sub],
      );
    } else {
      await this.client.query(
        `UPDATE tasks
         SET deleted = true
         WHERE isdone = true AND deleted = false`,
      );
    }

    const moved = completedRes.rows.map((row: Record<string, unknown>) =>
      this.mapRow(row),
    );
    const tasks = await this.findActive(viewer, ownerId, ownerRole);

    return { moved, tasks };
  }

  async markAll(
    viewer: JwtPayload,
    ownerId?: number | null,
    ownerRole?: string | null,
  ): Promise<Task[]> {
    const scope = await this.resolveScope(viewer, ownerId, ownerRole);

    if (scope.kind === 'self') {
      await this.client.query(
        `UPDATE tasks
         SET isdone = true
         WHERE isdone = false AND deleted = false AND user_id = $1`,
        [viewer.sub],
      );
    } else if (scope.kind === 'user') {
      await this.client.query(
        `UPDATE tasks
         SET isdone = true
         WHERE isdone = false AND deleted = false AND user_id = $1`,
        [scope.userId],
      );
    } else if (scope.kind === 'role') {
      await this.client.query(
        `UPDATE tasks t
         SET isdone = true
         FROM users u
         WHERE u.id = t.user_id
           AND t.deleted = false
           AND t.isdone = false
           AND u.role = $1`,
        [scope.role],
      );
    } else if (viewer.role === 'manager') {
      await this.client.query(
        `UPDATE tasks t
         SET isdone = true
         FROM users u
         WHERE u.id = t.user_id
           AND t.deleted = false
           AND t.isdone = false
           AND (t.user_id = $1 OR u.role = 'user')`,
        [viewer.sub],
      );
    } else {
      await this.client.query(
        `UPDATE tasks
         SET isdone = true
         WHERE isdone = false AND deleted = false`,
      );
    }

    return this.findActive(viewer, ownerId, ownerRole);
  }

  async unmarkAll(
    viewer: JwtPayload,
    ownerId?: number | null,
    ownerRole?: string | null,
  ): Promise<Task[]> {
    const scope = await this.resolveScope(viewer, ownerId, ownerRole);

    if (scope.kind === 'self') {
      await this.client.query(
        `UPDATE tasks
         SET isdone = false
         WHERE isdone = true AND deleted = false AND user_id = $1`,
        [viewer.sub],
      );
    } else if (scope.kind === 'user') {
      await this.client.query(
        `UPDATE tasks
         SET isdone = false
         WHERE isdone = true AND deleted = false AND user_id = $1`,
        [scope.userId],
      );
    } else if (scope.kind === 'role') {
      await this.client.query(
        `UPDATE tasks t
         SET isdone = false
         FROM users u
         WHERE u.id = t.user_id
           AND t.deleted = false
           AND t.isdone = true
           AND u.role = $1`,
        [scope.role],
      );
    } else if (viewer.role === 'manager') {
      await this.client.query(
        `UPDATE tasks t
         SET isdone = false
         FROM users u
         WHERE u.id = t.user_id
           AND t.deleted = false
           AND t.isdone = true
           AND (t.user_id = $1 OR u.role = 'user')`,
        [viewer.sub],
      );
    } else {
      await this.client.query(
        `UPDATE tasks
         SET isdone = false
         WHERE isdone = true AND deleted = false`,
      );
    }

    return this.findActive(viewer, ownerId, ownerRole);
  }
}
