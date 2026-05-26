import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AgendaController } from './controllers/agenda.controller';
import { AtividadesController } from './controllers/atividades.controller';
import { BensController } from './controllers/bens.controller';
import { UploadController } from './controllers/upload.controller';
import { PowerBiController } from './controllers/power-bi.controller';
import { SolucoesDigitaisController } from './controllers/solucoes-digitais.controller';
import { ImportLogsController } from './controllers/import-logs.controller';
import { HealthController } from './controllers/health.controller';
import { ContratosController } from './controllers/contratos.controller';
import { CreateAgendaReuniaoUseCase } from '@/domain/agenda/application/use-cases/create-agenda-reuniao';
import { DeleteAgendaReuniaoUseCase } from '@/domain/agenda/application/use-cases/delete-agenda-reuniao';
import { ListAgendaReunioesUseCase } from '@/domain/agenda/application/use-cases/list-agenda-reunioes';
import { UpdateAgendaReuniaoUseCase } from '@/domain/agenda/application/use-cases/update-agenda-reuniao';
import { ListAtividadesUseCase } from '@/domain/atividades/application/use-cases/list-atividades';
import { GetAtividadesStatsUseCase } from '@/domain/atividades/application/use-cases/get-atividades-stats';
import { ListBensUseCase } from '@/domain/bens/application/use-cases/list-bens';
import { GetBensStatsUseCase } from '@/domain/bens/application/use-cases/get-bens-stats';
import { PrismaService } from '../database/prisma/prisma.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    HealthController,
    AgendaController,
    AtividadesController,
    BensController,
    UploadController,
    PowerBiController,
    SolucoesDigitaisController,
    ContratosController,
    ImportLogsController,
  ],
  providers: [
    CreateAgendaReuniaoUseCase,
    DeleteAgendaReuniaoUseCase,
    ListAgendaReunioesUseCase,
    UpdateAgendaReuniaoUseCase,
    ListAtividadesUseCase,
    GetAtividadesStatsUseCase,
    ListBensUseCase,
    GetBensStatsUseCase,
    PrismaService,
  ],
})
export class HttpModule {}
