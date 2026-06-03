import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { PasswordHasher } from '../cryptography/password-hasher';
import { UsersRepository } from '../repositories/users-repository';
import { User, UserRole } from '../../enterprise/entities/user';

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active?: boolean;
}

type CreateUserOutput = Either<'USER_ALREADY_EXISTS', { user: User }>;

@Injectable()
export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) return left('USER_ALREADY_EXISTS');

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.usersRepository.create({
      name: input.name.trim(),
      email,
      passwordHash,
      role: input.role,
      active: input.active ?? true,
    });

    return right({ user });
  }
}
