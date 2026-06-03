import { User, UserRole } from '../../enterprise/entities/user';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
}

export abstract class UsersRepository {
  abstract create(data: CreateUserData): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findMany(): Promise<User[]>;
  abstract count(): Promise<number>;
  abstract countActiveAdmins(exceptId?: string): Promise<number>;
  abstract update(id: string, data: UpdateUserData): Promise<User | null>;
  abstract updatePassword(
    id: string,
    passwordHash: string,
  ): Promise<User | null>;
  abstract touchLastLogin(id: string): Promise<void>;
}
