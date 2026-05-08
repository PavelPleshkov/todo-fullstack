import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateTaskInput,
  MoveCompletedResult,
  Task,
  UpdateTaskInput,
} from './graphql/task.types';
import { TasksService } from './tasks.service';

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
  createTask(
    @Args('input', { type: () => CreateTaskInput }) input: CreateTaskInput,
  ): Promise<Task> {
    return this.tasksService.create(input.text, input.isDone);
  }

  @Mutation(() => Task)
  updateTask(
    @Args('id', { type: () => Int }) id: number,
    @Args('input', { type: () => UpdateTaskInput }) input: UpdateTaskInput,
  ): Promise<Task> {
    return this.tasksService.update(id, input);
  }

  @Mutation(() => Task)
  moveTaskToBin(@Args('id', { type: () => Int }) id: number): Promise<Task> {
    return this.tasksService.moveToBin(id);
  }

  @Mutation(() => Boolean)
  permanentlyDeleteTask(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.tasksService.permanentlyDeleteFromBin(id);
  }

  @Mutation(() => MoveCompletedResult)
  moveCompletedToBin(): Promise<MoveCompletedResult> {
    return this.tasksService.moveCompletedToBin();
  }

  @Mutation(() => [Task])
  markAllActiveTasks(): Promise<Task[]> {
    return this.tasksService.markAll();
  }

  @Mutation(() => [Task])
  unmarkAllActiveTasks(): Promise<Task[]> {
    return this.tasksService.unmarkAll();
  }
}
