import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Client } from 'pg';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser, AuthPayload } from '../graphql/auth.types';

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private client!: Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const host = this.configService.get<string>('PGHOST', 'localhost');
    const port = parseInt(this.configService.get<string>('PGPORT', '5432'), 10);
    const user = this.configService.get<string>('PGUSER', 'todo_user');
    const password = this.configService.get<string>('PGPASSWORD', '');
    const database = this.configService.get<string>('PGDATABASE', 'todo_db');

    this.client = new Client({
      host,
      port,
      user,
      password,
      database,
    });
    await this.client.connect();
    console.log('✅ PostgreSQL connected (AuthService)');
  }

  async onModuleDestroy() {
    await this.client.end();
  }

  private mapRow(row: Record<string, unknown>): AuthUser {
    return {
      id: Number(row.id),
      email: String(row.email),
      role: String(row.role),
    };
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private validateCredentials(email: string, password: string): void {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }
    if (!password || password.length < 4) {
      throw new BadRequestException('Password must be at least 4 characters');
    }
  }

  private signToken(user: AuthUser): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private toAuthPayload(user: AuthUser): AuthPayload {
    return {
      accessToken: this.signToken(user),
      user,
    };
  }

  async register(email: string, password: string): Promise<AuthPayload> {
    const normalizedEmail = this.normalizeEmail(email);
    this.validateCredentials(normalizedEmail, password);

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const res = await this.client.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, email, role`,
        [normalizedEmail, passwordHash],
      );

      return this.toAuthPayload(this.mapRow(res.rows[0]));
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Email already registered');
      }

      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const normalizedEmail = this.normalizeEmail(email);
    this.validateCredentials(normalizedEmail, password);

    const res = await this.client.query(
      `SELECT id, email, role, password_hash FROM users WHERE email = $1`,
      [normalizedEmail],
    );

    const row = res.rows[0] as Record<string, unknown> | undefined;

    if (!row) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      String(row.password_hash),
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.toAuthPayload(this.mapRow(row));
  }
}
