import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AgendaReunioesRepository } from '@/domain/agenda/application/repositories/agenda-reunioes-repository';
import { AtividadesRepository } from '@/domain/atividades/application/repositories/atividades-repository';
import { BensRepository } from '@/domain/bens/application/repositories/bens-repository';
import { PrismaAgendaReunioesRepository } from './prisma/repositories/prisma-agenda-reunioes-repository';
import { PrismaAtividadesRepository } from './prisma/repositories/prisma-atividades-repository';
import { PrismaBensRepository } from './prisma/repositories/prisma-bens-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: AgendaReunioesRepository,
      useClass: PrismaAgendaReunioesRepository,
    },
    { provide: AtividadesRepository, useClass: PrismaAtividadesRepository },
    { provide: BensRepository, useClass: PrismaBensRepository },
  ],
  exports: [
    PrismaService,
    AgendaReunioesRepository,
    AtividadesRepository,
    BensRepository,
  ],
})
export class DatabaseModule {}
