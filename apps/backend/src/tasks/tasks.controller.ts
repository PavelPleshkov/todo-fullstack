import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get() findAll() {
    return this.tasksService.findAll();
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }
  @Post() create(@Body() createTaskDto: { title: string }) {
    return this.tasksService.create(createTaskDto);
  }
  @Put(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: any,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
