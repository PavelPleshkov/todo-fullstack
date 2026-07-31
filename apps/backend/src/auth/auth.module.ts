import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [AuthService, AuthResolver, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
