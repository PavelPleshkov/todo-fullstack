import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RegisterInput, LoginInput, AuthPayload } from '../graphql/auth.types';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  register(
    @Args('input', { type: () => RegisterInput }) input: RegisterInput,
  ): Promise<AuthPayload> {
    return this.authService.register(input.email, input.password);
  }

  @Mutation(() => AuthPayload)
  login(
    @Args('input', { type: () => LoginInput }) input: LoginInput,
  ): Promise<AuthPayload> {
    return this.authService.login(input.email, input.password);
  }
}
