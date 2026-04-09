import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Task {
  @Field(() => Int)
  id: number;

  @Field()
  text: string;

  @Field()
  isDone: boolean;

  @Field()
  date: string;
}

@InputType()
export class CreateTaskInput {
  @Field()
  text: string;

  @Field()
  isDone: boolean;
}

@InputType()
export class UpdateTaskInput {
  @Field({ nullable: true })
  text?: string;

  @Field({ nullable: true })
  isDone?: boolean;
}

@ObjectType()
export class MoveCompletedResult {
  @Field(() => [Task])
  moved: Task[];

  @Field(() => [Task])
  tasks: Task[];
}
