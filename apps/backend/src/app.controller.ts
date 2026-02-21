import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  // Req,
} from '@nestjs/common';

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
export class AppController {
  private tasks: Task[] = [
    {
      id: 2,
      text: 'Task 3 from Nest.js',
      isDone: false,
      date: new Date().toLocaleString(),
    },
    {
      id: 1,
      text: 'Task 2 from Nest.js',
      isDone: true,
      date: new Date().toLocaleString(),
    },
    {
      id: 0,
      text: 'Task 1 from Nest.js',
      isDone: true,
      date: new Date().toLocaleString(),
    },
  ];
  private bin: Task[] = [];

  // @Get()
  @Get('tasks')
  // getTasks(@Req() request: Request) {
  getTasks() {
    return this.tasks;
  }

  // @Post()
  @Post('tasks')
  postTask(@Body() createTaskDto: CreateTaskDto) {
    const newTask = {
      id: Date.now(),
      text: createTaskDto.text,
      isDone: createTaskDto.isDone,
      date: new Date().toLocaleString(),
    };
    // this.tasks.push(task);
    this.tasks = [newTask, ...this.tasks];
    return newTask;
  }

  @Put('tasks/:id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) return { error: 'Task not found' };
    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updateTaskDto };

    return this.tasks[taskIndex];
  }

  // @Delete('tasks/:id')
  // deleteTask(@Param('id', ParseIntPipe) id: number) {
  //   const taskIndex = this.tasks.findIndex((t) => t.id === id);

  //   if (taskIndex === -1) return { error: `Task not found, can't delete` };

  //   const deletedTask = this.tasks.splice(taskIndex, 1)[0];

  //   return deletedTask;
  // }

  @Get('bin')
  getBin() {
    return this.bin;
  }

  @Post('bin/:id')
  moveToBin(@Param('id', ParseIntPipe) id: number) {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) return { error: 'Task not found' };

    const movedTask = this.tasks.splice(taskIndex, 1)[0];

    this.bin = [movedTask, ...this.bin];

    return movedTask;
  }

  @Delete('bin/:id')
  deleteTask(@Param('id', ParseIntPipe) id: number) {
    const taskIndex = this.bin.findIndex((t) => t.id === id);

    if (taskIndex === -1)
      return { error: `Task not found in bin, can't delete` };

    const deletedTask = this.bin.splice(taskIndex, 1)[0];

    return deletedTask;
  }

  @Post('completed-to-bin')
  moveCompletedToBin() {
    const completedTasks = this.tasks.filter((t) => t.isDone);
    const activeTasks = this.tasks.filter((t) => !t.isDone);

    this.tasks = activeTasks;
    this.bin = [...completedTasks, ...this.bin];

    return completedTasks;
  }

  @Post('tasks/mark-all')
  markAll() {
    this.tasks.forEach((t) => !t.isDone && (t.isDone = true));
    return this.tasks;
  }

  @Post('tasks/unmark-all')
  unmarkAll() {
    this.tasks.forEach((t) => t.isDone && (t.isDone = false));
    return this.tasks;
  }
}
