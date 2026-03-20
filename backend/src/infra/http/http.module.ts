import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { AtividadesController } from './controllers/atividades.controller'
import { BensController } from './controllers/bens.controller'
import { UploadController } from './controllers/upload.controller'
import { PowerBiController } from './controllers/power-bi.controller'
import { SolucoesDigitaisController } from './controllers/solucoes-digitais.controller'
import { ListAtividadesUseCase } from '@/domain/atividades/application/use-cases/list-atividades'
import { GetAtividadesStatsUseCase } from '@/domain/atividades/application/use-cases/get-atividades-stats'
import { ListBensUseCase } from '@/domain/bens/application/use-cases/list-bens'
import { GetBensStatsUseCase } from '@/domain/bens/application/use-cases/get-bens-stats'
import { PrismaService } from '../database/prisma/prisma.service'

@Module({
  imports: [DatabaseModule],
  controllers: [
    AtividadesController,
    BensController,
    UploadController,
    PowerBiController,
    SolucoesDigitaisController,
  ],
  providers: [
    ListAtividadesUseCase,
    GetAtividadesStatsUseCase,
    ListBensUseCase,
    GetBensStatsUseCase,
    PrismaService,
  ],
})
export class HttpModule {}
