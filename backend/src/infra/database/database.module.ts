import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AgendaReunioesRepository } from '@/domain/agenda/application/repositories/agenda-reunioes-repository';
import { AtividadesRepository } from '@/domain/atividades/application/repositories/atividades-repository';
import { BensRepository } from '@/domain/bens/application/repositories/bens-repository';
import { UsersRepository } from '@/domain/users/application/repositories/users-repository';
import { PrismaAgendaReunioesRepository } from './prisma/repositories/prisma-agenda-reunioes-repository';
import { PrismaAtividadesRepository } from './prisma/repositories/prisma-atividades-repository';
import { PrismaBensRepository } from './prisma/repositories/prisma-bens-repository';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: AgendaReunioesRepository,
      useClass: PrismaAgendaReunioesRepository,
    },
    { provide: AtividadesRepository, useClass: PrismaAtividadesRepository },
    { provide: BensRepository, useClass: PrismaBensRepository },
    { provide: UsersRepository, useClass: PrismaUsersRepository },
  ],
  exports: [
    PrismaService,
    AgendaReunioesRepository,
    AtividadesRepository,
    BensRepository,
    UsersRepository,
  ],
})
export class DatabaseModule {}
