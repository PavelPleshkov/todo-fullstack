import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Client } from 'pg';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser, AuthPayload } from '../graphql/auth.types';
import { canRestoreUser, canSoftDeleteUser } from '@repo/permissions';

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

  private toIsoOrNull(value: unknown): string | null {
    if (value == null) {
      return null;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new Error('Invalid timestamp value');
  }

  private mapRow(row: Record<string, unknown>): AuthUser {
    const createdAt = this.toIsoOrNull(row.created_at);
    const deletedAt = this.toIsoOrNull(row.deleted_at);

    if (createdAt == null) {
      throw new Error('User row is missing created_at');
    }

    return {
      id: Number(row.id),
      email: String(row.email),
      role: String(row.role),
      createdAt,
      deletedAt,
    };
  }
  // check if account is active
  async assertAccountActive(userId: number): Promise<void> {
    const res = await this.client.query(
      `SELECT deleted_at FROM users WHERE id = $1`,
      [userId],
    );

    const row = res.rows[0] as Record<string, unknown> | undefined;

    if (!row || row.deleted_at != null) {
      throw new UnauthorizedException('This account has been deleted');
    }
  }

  async findAllUsers(): Promise<AuthUser[]> {
    const res = await this.client.query(
      `SELECT id, email, role, created_at, deleted_at FROM users ORDER BY id ASC`,
    );

    return res.rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async softDeleteUser(
    targetId: number,
    actorId: number,
    actorRole: string,
  ): Promise<AuthUser> {
    if (targetId === actorId) {
      throw new ForbiddenException('You can not delete your own account');
    }

    const existing = await this.client.query(
      `SELECT id, email, role, created_at, deleted_at FROM users WHERE id = $1`,
      [targetId],
    );

    const current = existing.rows[0] as Record<string, unknown> | undefined;

    if (!current) {
      throw new NotFoundException('User not found');
    }

    if (
      !canSoftDeleteUser(
        { id: actorId, role: actorRole },
        { id: Number(current.id), role: String(current.role) },
      )
    ) {
      throw new ForbiddenException(
        'Insufficient permissions: You are not allowed to delete this account',
      );
    }

    // if (current.role === 'admin') {
    //   throw new ForbiddenException('Admin account can not be deleted');
    // }

    if (current.deleted_at != null) {
      throw new BadRequestException('User is already deleted');
    }

    const updated = await this.client.query(
      `UPDATE users SET deleted_at = NOW() WHERE id = $1 RETURNING id, email, role, created_at, deleted_at`,
      [targetId],
    );

    const row = updated.rows[0] as Record<string, unknown> | undefined;

    if (!row) {
      throw new NotFoundException('User not found');
    }

    return this.mapRow(row);
  }

  async restoreDeletedUser(
    targetId: number,
    actorId: number,
    actorRole: string,
  ): Promise<AuthUser> {
    if (actorRole != 'admin') {
      if (targetId === actorId) {
        throw new ForbiddenException('You can not restore your own account');
      }
    }

    const existing = await this.client.query(
      `SELECT id, email, role, created_at, deleted_at FROM users WHERE id = $1`,
      [targetId],
    );

    const current = existing.rows[0] as Record<string, unknown> | undefined;

    if (!current) {
      throw new NotFoundException('User not found');
    }

    if (
      !canRestoreUser(
        { id: actorId, role: actorRole },
        { id: Number(current.id), role: String(current.role) },
      )
    ) {
      throw new ForbiddenException(
        'Insufficient permissions: You are not allowed to restore this account',
      );
    }

    if (current.deleted_at == null) {
      throw new BadRequestException('User is already restored');
    }

    const updated = await this.client.query(
      `UPDATE users SET deleted_at = null WHERE id = $1 RETURNING id, email, role, created_at, deleted_at`,
      [targetId],
    );

    const row = updated.rows[0] as Record<string, unknown> | undefined;

    if (!row) {
      throw new NotFoundException('User not found');
    }

    return this.mapRow(row);
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
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, email, role, created_at, deleted_at`,
        [normalizedEmail, passwordHash],
      );

      const row = res.rows[0] as Record<string, unknown> | undefined;
      if (!row) {
        throw new Error('Register did not return a user row');
      }

      return this.toAuthPayload(this.mapRow(row));
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
      `SELECT id, email, role, created_at, deleted_at, password_hash FROM users WHERE email = $1`,
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
    // check if account is active
    await this.assertAccountActive(Number(row.id));

    return this.toAuthPayload(this.mapRow(row));
  }
}
