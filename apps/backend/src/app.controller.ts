/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Client } from 'pg';

class CreateTaskDto {
  text: string;
  isDone: boolean;
}

class UpdateTaskDto {
  text: string;
  isDone: boolean;
}

interface Task {
  id: number;
  text: string;
  isDone: boolean;
  date: string;
}

@Controller('api')
export class AppController implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  async onModuleInit() {
    this.client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'pavel',
      password: '',
      database: 'todo_db',
    });
    await this.client.connect();
    console.log('✅ PostgreSQL подключен!');
  }

  async onModuleDestroy() {
    await this.client.end();
  }

  @Get('tasks')
  async getTasks(): Promise<Task[]> {
    const res = await this.client.query(
      'SELECT * FROM tasks WHERE deleted=false ORDER BY id ASC',
    );

    return res.rows.map((row) => ({
      id: Number(row.id),
      text: row.text,
      isDone: row.isdone === true || row.isdone === 't',
      date: new Date(row.date).toLocaleString(),
    }));
  }

  @Post('tasks')
  async postTasks(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    const res = await this.client.query(
      'INSERT INTO tasks (text, isDone) VALUES ($1, $2) RETURNING *',
      [createTaskDto.text, createTaskDto.isDone],
    );
    const newTask = res.rows[0];

    return {
      id: Number(newTask.id),
      text: newTask.text,
      isDone: newTask.isdone === true || newTask.isdone === 't',
      date: new Date(newTask.date).toLocaleString(),
    };
  }

  @Put('tasks/:id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const updates: string[] = [];
    const values: any[] = [id];

    if (updateTaskDto.text !== undefined) {
      updates.push('text = $' + (values.length + 1));
      values.push(updateTaskDto.text);
    }

    if (updateTaskDto.isDone !== undefined) {
      updates.push('isdone = $' + (values.length + 1));
      values.push(updateTaskDto.isDone);
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

    const updatedTask = res.rows[0];

    return {
      id: Number(updatedTask.id),
      text: updatedTask.text,
      isDone: Boolean(updatedTask.isdone),
      date: new Date(updatedTask.date).toLocaleString(),
    };
  }

  @Get('bin')
  async getBin(): Promise<Task[]> {
    const res = await this.client.query(
      // 'SELECT * FROM tasks WHERE deleted=true ORDER BY id ASC',
      'SELECT * FROM tasks WHERE deleted=true',
    );

    return res.rows.map((row) => ({
      id: Number(row.id),
      text: row.text,
      isDone: row.isdone === true || row.isdone === 't',
      date: new Date(row.date).toLocaleString(),
    }));
  }

  @Post('bin/:id')
  async moveToBin(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    const res = await this.client.query(
      'UPDATE tasks SET deleted=true WHERE id=$1 RETURNING *',
      [id],
    );

    if (res.rows.length === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    const movedTask = res.rows[0];

    return {
      id: Number(movedTask.id),
      text: movedTask.text,
      isDone: movedTask.isdone === true || movedTask.isdone === 't',
      date: new Date(movedTask.date).toLocaleString(),
    };
  }

  @Delete('bin/:id')
  async deleteTask(@Param('id', ParseIntPipe) id: number) {
    const res = await this.client.query(
      'DELETE FROM tasks WHERE id=$1 RETURNING *',
      [id],
    );

    if (res.rows.length === 0) return { error: 'Task not found in bin' };

    return { success: true };
  }

  @Post('completed-to-bin')
  async moveCompletedToBin(): Promise<{ moved: Task[]; tasks: Task[] }> {
    const completedRes = await this.client.query(
      'SELECT * FROM tasks WHERE isdone=true AND deleted=false',
    );

    if (completedRes.rows.length === 0) {
      throw new HttpException('No completed tasks found', HttpStatus.NOT_FOUND);
    }

    await this.client.query(
      'UPDATE tasks SET deleted=true WHERE isdone=true AND deleted=false',
    );

    const moved = completedRes.rows.map((row) => ({
      id: Number(row.id),
      text: row.text,
      isDone: row.isdone === true || row.isdone === 't',
      date: new Date(row.date).toLocaleString(),
    }));

    const tasksRes = await this.client.query(
      // 'SELECT * FROM tasks WHERE deleted=false ORDER BY id ASC',
      'SELECT * FROM tasks WHERE deleted=false',
    );
    const tasks = tasksRes.rows.map((row) => ({
      id: Number(row.id),
      text: row.text,
      isDone: row.isdone === true || row.isdone === 't',
      date: new Date(row.date).toLocaleString(),
    }));

    return { moved, tasks };
  }

  @Post('tasks/mark-all')
  async markAll(): Promise<Task[]> {
    await this.client.query(
      'UPDATE tasks SET isdone=true WHERE isdone=false AND deleted=false',
    );

    const res = await this.client.query(
      // 'SELECT * FROM tasks WHERE deleted=false ORDER BY id ASC',
      'SELECT * FROM tasks WHERE deleted=false',
    );
    return res.rows.map((row) => ({
      id: Number(row.id),
      text: row.text,
      isDone: row.isdone === true || row.isdone === 't',
      date: new Date(row.date).toLocaleString(),
    }));
  }

  @Post('tasks/unmark-all')
  async unmarkAll(): Promise<Task[]> {
    await this.client.query(
      'UPDATE tasks SET isdone=false WHERE deleted=false',
    );

    const res = await this.client.query(
      // 'SELECT * FROM tasks WHERE deleted=false ORDER BY id ASC',
      'SELECT * FROM tasks WHERE deleted=false',
    );
    return res.rows.map((row) => ({
      id: Number(row.id),
      text: row.text,
      isDone: row.isdone === true || row.isdone === 't',
      date: new Date(row.date).toLocaleString(),
    }));
  }
}
