import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { AtividadesRepository } from '@/domain/atividades/application/repositories/atividades-repository'
import { BensRepository } from '@/domain/bens/application/repositories/bens-repository'
import { PrismaAtividadesRepository } from './prisma/repositories/prisma-atividades-repository'
import { PrismaBensRepository } from './prisma/repositories/prisma-bens-repository'

@Module({
  providers: [
    PrismaService,
    { provide: AtividadesRepository, useClass: PrismaAtividadesRepository },
    { provide: BensRepository, useClass: PrismaBensRepository },
  ],
  exports: [PrismaService, AtividadesRepository, BensRepository],
})
export class DatabaseModule {}
