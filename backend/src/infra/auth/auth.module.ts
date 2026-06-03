import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { PasswordHasher } from '@/domain/users/application/cryptography/password-hasher';
import { AuthenticateUserUseCase } from '@/domain/users/application/use-cases/authenticate-user';
import { CreateUserUseCase } from '@/domain/users/application/use-cases/create-user';
import { ListUsersUseCase } from '@/domain/users/application/use-cases/list-users';
import { ResetUserPasswordUseCase } from '@/domain/users/application/use-cases/reset-user-password';
import { UpdateUserUseCase } from '@/domain/users/application/use-cases/update-user';
import { AuthController } from '../http/controllers/auth.controller';
import { UsersController } from '../http/controllers/users.controller';
import { resolveJwtKeyPair } from './auth-config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ScryptPasswordHasher } from './scrypt-password-hasher';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => resolveJwtKeyPair(),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthenticateUserUseCase,
    CreateUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    ResetUserPasswordUseCase,
    { provide: PasswordHasher, useClass: ScryptPasswordHasher },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
