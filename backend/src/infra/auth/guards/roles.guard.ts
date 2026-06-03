import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from '@/domain/users/enterprise/entities/user';
import { IS_PUBLIC_KEY } from '../decorators/public';
import { ROLES_KEY } from '../decorators/roles';
import { CurrentUser } from '../types/current-user';

type RequestWithUser = Request & { user?: CurrentUser };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userRole = request.user?.role;

    if (userRole === 'admin' || (userRole && roles.includes(userRole))) {
      return true;
    }

    throw new ForbiddenException('Usuário sem permissão para esta ação');
  }
}
