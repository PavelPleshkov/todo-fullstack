import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateTaskInput,
  MoveCompletedResult,
  Task,
  UpdateTaskInput,
} from '../graphql/task.types';
import { TasksService } from './tasks.service';
import type { JwtPayload } from '../auth/jwt-payload';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task], { name: 'activeTasks' })
  activeTasks(): Promise<Task[]> {
    return this.tasksService.findActive();
  }

  @Query(() => [Task], { name: 'binTasks' })
  binTasks(): Promise<Task[]> {
    return this.tasksService.findBin();
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  createTask(
    @Args('input', { type: () => CreateTaskInput }) input: CreateTaskInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<Task> {
    console.log(
      'createTask ',
      input.text,
      ' by',
      user.email,
      user.sub,
      user.role,
    );
    return this.tasksService.create(input.text, input.isDone);
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  updateTask(
    @Args('id', { type: () => Int }) id: number,
    @Args('input', { type: () => UpdateTaskInput }) input: UpdateTaskInput,
  ): Promise<Task> {
    return this.tasksService.update(id, input);
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  moveTaskToBin(@Args('id', { type: () => Int }) id: number): Promise<Task> {
    return this.tasksService.moveToBin(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  permanentlyDeleteTask(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.tasksService.permanentlyDeleteFromBin(id);
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  moveTaskToActive(@Args('id', { type: () => Int }) id: number): Promise<Task> {
    return this.tasksService.moveTaskToActive(id);
  }

  @Mutation(() => MoveCompletedResult)
  @UseGuards(JwtAuthGuard)
  moveCompletedToBin(): Promise<MoveCompletedResult> {
    return this.tasksService.moveCompletedToBin();
  }

  @Mutation(() => [Task])
  @UseGuards(JwtAuthGuard)
  markAllActiveTasks(): Promise<Task[]> {
    return this.tasksService.markAll();
  }

  @Mutation(() => [Task])
  @UseGuards(JwtAuthGuard)
  unmarkAllActiveTasks(): Promise<Task[]> {
    return this.tasksService.unmarkAll();
  }
}
