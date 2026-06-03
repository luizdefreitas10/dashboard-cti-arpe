import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { CreateUserUseCase } from '@/domain/users/application/use-cases/create-user';
import { ListUsersUseCase } from '@/domain/users/application/use-cases/list-users';
import { ResetUserPasswordUseCase } from '@/domain/users/application/use-cases/reset-user-password';
import { UpdateUserUseCase } from '@/domain/users/application/use-cases/update-user';
import { Roles } from '@/infra/auth/decorators/roles';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { UserPresenter } from '../presenters/user-presenter';

const roleSchema = z.enum(['admin', 'agent']);

const paramsSchema = z.object({
  id: z.string().min(1),
});

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome'),
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(10, 'A senha deve ter pelo menos 10 caracteres'),
  role: roleSchema.default('agent'),
  active: z.boolean().default(true),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome'),
  email: z.string().trim().email('Informe um e-mail válido'),
  role: roleSchema,
  active: z.boolean(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(10, 'A senha deve ter pelo menos 10 caracteres'),
});

type RouteParams = z.infer<typeof paramsSchema>;
type CreateUserBody = z.infer<typeof createUserSchema>;
type UpdateUserBody = z.infer<typeof updateUserSchema>;
type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;

@Controller('users')
@Roles('admin')
export class UsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private listUsersUseCase: ListUsersUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private resetUserPasswordUseCase: ResetUserPasswordUseCase,
  ) {}

  @Get()
  async list() {
    const result = await this.listUsersUseCase.execute();
    if (result.isLeft()) return { users: [] };
    return {
      users: result.value.users.map((user) => UserPresenter.toHTTP(user)),
    };
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserSchema)) body: CreateUserBody,
  ) {
    const result = await this.createUserUseCase.execute(body);

    if (result.isLeft()) {
      throw new ConflictException('Já existe usuário com este e-mail');
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }

  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(paramsSchema)) params: RouteParams,
    @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserBody,
  ) {
    const result = await this.updateUserUseCase.execute({
      id: params.id,
      ...body,
    });

    if (result.isLeft()) {
      if (result.value === 'USER_NOT_FOUND') {
        throw new NotFoundException('Usuário não encontrado');
      }
      if (result.value === 'USER_ALREADY_EXISTS') {
        throw new ConflictException('Já existe usuário com este e-mail');
      }
      throw new BadRequestException(
        'Mantenha pelo menos um administrador ativo no sistema',
      );
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }

  @Patch(':id/password')
  async resetPassword(
    @Param(new ZodValidationPipe(paramsSchema)) params: RouteParams,
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordBody,
  ) {
    const result = await this.resetUserPasswordUseCase.execute({
      id: params.id,
      password: body.password,
    });

    if (result.isLeft()) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
