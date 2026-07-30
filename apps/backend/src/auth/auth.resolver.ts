import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RegisterInput, AuthUser, LoginInput } from '../graphql/auth.types';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthUser)
  register(@Args('input', { type: () => RegisterInput }) input: RegisterInput) {
    return this.authService.register(input.email, input.password);
  }

  @Mutation(() => AuthUser)
  login(@Args('input', { type: () => LoginInput }) input: LoginInput) {
    return this.authService.login(input.email, input.password);
  }
}
