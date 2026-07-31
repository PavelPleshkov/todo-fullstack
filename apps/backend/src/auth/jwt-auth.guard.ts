import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './jwt-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{
      req: {
        headers: { authorization?: string };
        user?: JwtPayload;
      };
    }>().req;

    const header = req?.headers?.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
