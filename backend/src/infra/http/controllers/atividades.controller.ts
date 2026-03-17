import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { ListAtividadesUseCase } from '@/domain/atividades/application/use-cases/list-atividades'
import { GetAtividadesStatsUseCase } from '@/domain/atividades/application/use-cases/get-atividades-stats'
import { AtividadePresenter } from '../presenters/atividade-presenter'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(25),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  categoria: z.string().optional(),
  responsavel: z.string().optional(),
  setor: z.string().optional(),
  prioridade: z.string().optional(),
  busca: z.string().optional(),
})

type QueryParams = z.infer<typeof querySchema>

@Controller('atividades')
export class AtividadesController {
  constructor(
    private listAtividadesUseCase: ListAtividadesUseCase,
    private getAtividadesStatsUseCase: GetAtividadesStatsUseCase,
  ) {}

  @Get()
  async list(@Query(new ZodValidationPipe(querySchema)) query: QueryParams) {
    const result = await this.listAtividadesUseCase.execute(query)
    if (result.isLeft()) return { atividades: [], total: 0 }

    const { atividades, total } = result.value
    return {
      atividades: atividades.map(AtividadePresenter.toHTTP),
      total,
      page: query.page,
      size: query.size,
      totalPages: Math.ceil(total / query.size),
    }
  }

  @Get('stats')
  async stats() {
    const result = await this.getAtividadesStatsUseCase.execute()
    if (result.isLeft()) return {}
    return result.value
  }
}
