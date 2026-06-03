import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { PasswordHasher } from '../cryptography/password-hasher';
import { UsersRepository } from '../repositories/users-repository';
import { User } from '../../enterprise/entities/user';

interface AuthenticateUserInput {
  email: string;
  password: string;
}

type AuthenticateUserOutput = Either<
  'INVALID_CREDENTIALS' | 'USER_INACTIVE',
  { user: User }
>;

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
    const user = await this.usersRepository.findByEmail(input.email);
    if (!user) return left('INVALID_CREDENTIALS');
    if (!user.active) return left('USER_INACTIVE');

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) return left('INVALID_CREDENTIALS');

    await this.usersRepository.touchLastLogin(user.id.toString());

    return right({ user });
  }
}
