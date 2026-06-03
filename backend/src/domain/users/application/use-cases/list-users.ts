import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { User } from '../../enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';

type ListUsersOutput = Either<null, { users: User[] }>;

@Injectable()
export class ListUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(): Promise<ListUsersOutput> {
    const users = await this.usersRepository.findMany();
    return right({ users });
  }
}
