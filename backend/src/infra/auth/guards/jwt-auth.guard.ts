import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { z } from 'zod';
import { UsersRepository } from '@/domain/users/application/repositories/users-repository';
import { IS_PUBLIC_KEY } from '../decorators/public';
import { getSessionCookieName } from '../auth-config';
import { CurrentUser } from '../types/current-user';

const jwtPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'agent']),
});

type RequestWithUser = Request & { user?: CurrentUser };

function parseCookie(header: string | undefined, name: string) {
  if (!header) return undefined;

  return header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Sessão inválida ou expirada');

    try {
      const payload = jwtPayloadSchema.parse(
        await this.jwtService.verifyAsync(token, { algorithms: ['RS256'] }),
      );

      const user = await this.usersRepository.findById(payload.sub);
      if (!user?.active) {
        throw new UnauthorizedException('Usuário inativo');
      }

      request.user = {
        sub: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
  }

  private extractToken(request: Request) {
    const cookieToken = parseCookie(
      request.headers.cookie,
      getSessionCookieName(),
    );
    if (cookieToken) return decodeURIComponent(cookieToken);

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
