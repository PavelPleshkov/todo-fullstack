import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field()
  role!: string;

  @Field()
  createdAt!: string;

  @Field(() => String, { nullable: true })
  deletedAt?: string | null;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  @Field(() => AuthUser)
  user!: AuthUser;
}

@InputType()
export class RegisterInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
