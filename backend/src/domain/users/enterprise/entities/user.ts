import { Entity, UniqueEntityID } from '@/core/entities/entity';

export type UserRole = 'admin' | 'agent';

export interface UserProps {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get role() {
    return this.props.role;
  }

  get active() {
    return this.props.active;
  }

  get lastLoginAt() {
    return this.props.lastLoginAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: UserProps, id?: UniqueEntityID) {
    const now = new Date();
    return new User(
      {
        ...props,
        email: props.email.trim().toLowerCase(),
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      id,
    );
  }
}
