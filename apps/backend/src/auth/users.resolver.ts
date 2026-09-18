import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../graphql/auth.types';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Resolver()
export class UsersResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => [AuthUser], { name: 'users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  users(): Promise<AuthUser[]> {
    return this.authService.findAllUsers();
  }
}
