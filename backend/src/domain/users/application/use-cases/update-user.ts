import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { User, UserRole } from '../../enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';

interface UpdateUserInput {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

type UpdateUserOutput = Either<
  'USER_NOT_FOUND' | 'USER_ALREADY_EXISTS' | 'LAST_ADMIN_REQUIRED',
  { user: User }
>;

@Injectable()
export class UpdateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const current = await this.usersRepository.findById(input.id);
    if (!current) return left('USER_NOT_FOUND');

    const nextEmail = input.email.trim().toLowerCase();
    if (nextEmail !== current.email) {
      const emailOwner = await this.usersRepository.findByEmail(nextEmail);
      if (emailOwner && emailOwner.id.toString() !== input.id) {
        return left('USER_ALREADY_EXISTS');
      }
    }

    const removesAdminAccess =
      current.role === 'admin' && (!input.active || input.role !== 'admin');

    if (removesAdminAccess) {
      const remainingAdmins = await this.usersRepository.countActiveAdmins(
        input.id,
      );
      if (remainingAdmins === 0) return left('LAST_ADMIN_REQUIRED');
    }

    const user = await this.usersRepository.update(input.id, {
      name: input.name.trim(),
      email: nextEmail,
      role: input.role,
      active: input.active,
    });

    if (!user) return left('USER_NOT_FOUND');

    return right({ user });
  }
}
