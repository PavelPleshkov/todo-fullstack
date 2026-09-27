import { UseGuards } from '@nestjs/common';
import { Mutation, Query, Resolver, Args, Int } from '@nestjs/graphql';
import { AuthUser } from '../graphql/auth.types';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { CurrentUser } from './current-user.decorator';
import { type JwtPayload } from './jwt-payload';

@Resolver()
export class UsersResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => [AuthUser], { name: 'users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  users(@CurrentUser() user: JwtPayload): Promise<AuthUser[]> {
    return this.authService.findAllUsers({ id: user.sub, role: user.role });
  }

  @Mutation(() => AuthUser, { name: 'deleteUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  deleteUser(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<AuthUser> {
    return this.authService.softDeleteUser(id, user.sub, user.role);
  }

  @Mutation(() => AuthUser, { name: 'restoreUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  restoreUser(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<AuthUser> {
    return this.authService.restoreDeletedUser(id, user.sub, user.role);
  }
}
