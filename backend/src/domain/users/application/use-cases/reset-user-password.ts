import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { User } from '../../enterprise/entities/user';
import { PasswordHasher } from '../cryptography/password-hasher';
import { UsersRepository } from '../repositories/users-repository';

interface ResetUserPasswordInput {
  id: string;
  password: string;
}

type ResetUserPasswordOutput = Either<'USER_NOT_FOUND', { user: User }>;

@Injectable()
export class ResetUserPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute(
    input: ResetUserPasswordInput,
  ): Promise<ResetUserPasswordOutput> {
    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.usersRepository.updatePassword(
      input.id,
      passwordHash,
    );

    if (!user) return left('USER_NOT_FOUND');

    return right({ user });
  }
}
