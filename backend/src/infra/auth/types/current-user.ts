import { UserRole } from '@/domain/users/enterprise/entities/user';

export interface CurrentUser {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}
