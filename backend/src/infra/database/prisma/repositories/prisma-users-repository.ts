import { Injectable } from '@nestjs/common';
import {
  CreateUserData,
  UpdateUserData,
  UsersRepository,
} from '@/domain/users/application/repositories/users-repository';
import { User } from '@/domain/users/enterprise/entities/user';
import { PrismaUserMapper } from '../mappers/prisma-user-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        active: data.active ?? true,
      },
    });

    return PrismaUserMapper.toDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findMany(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });

    return users.map((user) => PrismaUserMapper.toDomain(user));
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async countActiveAdmins(exceptId?: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        role: 'admin',
        active: true,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) return null;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    });

    return PrismaUserMapper.toDomain(updated);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User | null> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) return null;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return PrismaUserMapper.toDomain(updated);
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
