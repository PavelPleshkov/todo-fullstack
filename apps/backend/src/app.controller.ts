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
  // Req,
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

// @Controller('api/tasks')
@Controller('api')
// export class AppController {
// private tasks: Task[] = [
//   {
//     id: 2,
//     text: 'Task 3 from Nest.js',
//     isDone: false,
//     date: new Date().toLocaleString(),
//   },
//   {
//     id: 1,
//     text: 'Task 2 from Nest.js',
//     isDone: true,
//     date: new Date().toLocaleString(),
//   },
//   {
//     id: 0,
//     text: 'Task 1 from Nest.js',
//     isDone: true,
//     date: new Date().toLocaleString(),
//   },
// ];
// private bin: Task[] = [];
export class AppController implements OnModuleInit, OnModuleDestroy {
  private client: Client; // ← Подключение к БД

  // ИНИЦИАЛИЗАЦИЯ PostgreSQL (вместо private tasks = [])
  async onModuleInit() {
    this.client = new Client({
      host: 'localhost', // Хост БД (твой MacBook)
      port: 5432, // Стандартный порт PostgreSQL
      user: 'pavel', // ТВОЙ суперпользователь
      password: '', // Пустой пароль (Homebrew)
      database: 'todo_db', // ТВОЯ база
    });
    await this.client.connect(); // Подключиться к БД
    console.log('✅ PostgreSQL подключен!');
  }

  async onModuleDestroy() {
    await this.client.end(); // Закрыть соединение
  }

  @Get('tasks')
  // getTasks() {
  //   return this.tasks;
  // }
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
  // postTask(@Body() createTaskDto: CreateTaskDto) {
  //   const newTask = {
  //     id: Date.now(),
  //     text: createTaskDto.text,
  //     isDone: createTaskDto.isDone,
  //     date: new Date().toLocaleString(),
  //   };
  //   // this.tasks.push(task);
  //   this.tasks = [newTask, ...this.tasks];
  //   return newTask;
  // }
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
  // updateTask(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateTaskDto: UpdateTaskDto,
  // ) {
  //   const taskIndex = this.tasks.findIndex((t) => t.id === id);

  //   if (taskIndex === -1) return { error: 'Task not found' };
  //   this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updateTaskDto };

  //   return this.tasks[taskIndex];
  // }
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
  // getBin() {
  //   return this.bin;
  // }
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
  // moveToBin(@Param('id', ParseIntPipe) id: number) {
  //   const taskIndex = this.tasks.findIndex((t) => t.id === id);

  //   if (taskIndex === -1) return { error: 'Task not found' };

  //   const movedTask = this.tasks.splice(taskIndex, 1)[0];

  //   this.bin = [movedTask, ...this.bin];

  //   return movedTask;
  // }
  async moveToBin(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    const res = await this.client.query(
      'UPDATE tasks SET deleted=true WHERE id=$1 RETURNING *',
      [id],
    );

    if (res.rows.length === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      // return { error: 'Task not found' };
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
  // deleteTask(@Param('id', ParseIntPipe) id: number) {
  //   const taskIndex = this.bin.findIndex((t) => t.id === id);

  //   if (taskIndex === -1)
  //     return { error: `Task not found in bin, can't delete` };

  //   const deletedTask = this.bin.splice(taskIndex, 1)[0];

  //   return deletedTask;
  // }
  async deleteTask(@Param('id', ParseIntPipe) id: number) {
    const res = await this.client.query(
      'DELETE FROM tasks WHERE id=$1 RETURNING *',
      [id],
    );

    if (res.rows.length === 0) return { error: 'Task not found in bin' };

    return { success: true };
  }

  @Post('completed-to-bin')
  // moveCompletedToBin() {
  //   const completedTasks = this.tasks.filter((t) => t.isDone);
  //   const activeTasks = this.tasks.filter((t) => !t.isDone);

  //   this.tasks = activeTasks;
  //   this.bin = [...completedTasks, ...this.bin];

  //   return completedTasks;
  // }
  async moveCompletedToBin() {
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
  // markAll() {
  //   this.tasks.forEach((t) => !t.isDone && (t.isDone = true));
  //   return this.tasks;
  // }
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
  // unmarkAll() {
  //   this.tasks.forEach((t) => t.isDone && (t.isDone = false));
  //   return this.tasks;
  // }
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
