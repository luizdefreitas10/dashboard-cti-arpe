import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { z } from 'zod';
import { AuthenticateUserUseCase } from '@/domain/users/application/use-cases/authenticate-user';
import { CreateUserUseCase } from '@/domain/users/application/use-cases/create-user';
import { UsersRepository } from '@/domain/users/application/repositories/users-repository';
import { Public } from '@/infra/auth/decorators/public';
import { CurrentUserDecorator } from '@/infra/auth/decorators/current-user';
import type { CurrentUser } from '@/infra/auth/types/current-user';
import {
  getCookieSameSite,
  getSessionCookieName,
  getSessionDurationMs,
} from '@/infra/auth/auth-config';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { UserPresenter } from '../presenters/user-presenter';

const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
});

const bootstrapSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome'),
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(10, 'A senha deve ter pelo menos 10 caracteres'),
});

type LoginBody = z.infer<typeof loginSchema>;
type BootstrapBody = z.infer<typeof bootstrapSchema>;

@Controller('auth')
export class AuthController {
  constructor(
    private authenticateUserUseCase: AuthenticateUserUseCase,
    private createUserUseCase: CreateUserUseCase,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authenticateUserUseCase.execute(body);

    if (result.isLeft()) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const { user } = result.value;
    const expiresAt = await this.createSession(response, {
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return { user: UserPresenter.toHTTP(user), expiresAt };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    this.clearSession(response);
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUserDecorator() user: CurrentUser) {
    return { user };
  }

  @Public()
  @Get('bootstrap-status')
  async bootstrapStatus() {
    const total = await this.usersRepository.count();
    return { canBootstrap: total === 0 };
  }

  @Public()
  @Post('bootstrap-admin')
  @HttpCode(201)
  async bootstrapAdmin(
    @Body(new ZodValidationPipe(bootstrapSchema)) body: BootstrapBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const total = await this.usersRepository.count();
    if (total > 0) {
      throw new ConflictException('Administrador inicial já foi configurado');
    }

    const result = await this.createUserUseCase.execute({
      ...body,
      role: 'admin',
      active: true,
    });

    if (result.isLeft()) {
      throw new BadRequestException('Não foi possível criar o administrador');
    }

    const { user } = result.value;
    const expiresAt = await this.createSession(response, {
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return { user: UserPresenter.toHTTP(user), expiresAt };
  }

  private async createSession(response: Response, user: CurrentUser) {
    const durationMs = getSessionDurationMs();
    const expiresAt = new Date(Date.now() + durationMs);
    const token = await this.jwtService.signAsync(user, {
      algorithm: 'RS256',
      expiresIn: Math.floor(durationMs / 1000),
    });

    response.cookie(getSessionCookieName(), token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' || getCookieSameSite() === 'none',
      sameSite: getCookieSameSite(),
      expires: expiresAt,
      path: '/',
      domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
    });

    return expiresAt;
  }

  private clearSession(response: Response) {
    response.clearCookie(getSessionCookieName(), {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' || getCookieSameSite() === 'none',
      sameSite: getCookieSameSite(),
      path: '/',
      domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
    });
  }
}
