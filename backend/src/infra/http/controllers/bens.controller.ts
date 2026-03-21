import { Controller, Get, Query, Param } from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { ListBensUseCase } from '@/domain/bens/application/use-cases/list-bens'
import { GetBensStatsUseCase } from '@/domain/bens/application/use-cases/get-bens-stats'
import { BemPresenter } from '../presenters/bem-presenter'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(25),
  tipoHardware: z.string().optional(),
  setor: z.string().optional(),
  modelo: z.string().optional(),
  sistemaOperacional: z.string().optional(),
  busca: z.string().optional(),
  criticidade: z.string().optional(),
  comCriticidade: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
})

type QueryParams = z.infer<typeof querySchema>

@Controller('bens')
export class BensController {
  constructor(
    private listBensUseCase: ListBensUseCase,
    private getBensStatsUseCase: GetBensStatsUseCase,
    private prisma: PrismaService,
  ) {}

  @Get()
  async list(@Query(new ZodValidationPipe(querySchema)) query: QueryParams) {
    const result = await this.listBensUseCase.execute(query)
    if (result.isLeft()) return { bens: [], total: 0 }

    const { bens, total } = result.value
    return {
      bens: bens.map(BemPresenter.toHTTP),
      total,
      page: query.page,
      size: query.size,
      totalPages: Math.ceil(total / query.size),
    }
  }

  @Get('stats')
  async stats() {
    const result = await this.getBensStatsUseCase.execute()
    if (result.isLeft()) return {}
    return result.value
  }

  @Get('softwares')
  async softwares() {
    const softwares = await this.prisma.software.findMany({ orderBy: { nome: 'asc' } })
    return { softwares, total: softwares.length }
  }

  @Get('ramais')
  async ramais() {
    const ramais = await this.prisma.ramal.findMany({ orderBy: { setor: 'asc' } })
    return { ramais, total: ramais.length }
  }

  @Get('celulares')
  async celulares() {
    const celulares = await this.prisma.celular.findMany({ orderBy: { setor: 'asc' } })
    return { celulares, total: celulares.length }
  }

  @Get(':tombamento/historico')
  async historico(@Param('tombamento') tombamento: string) {
    if (!tombamento?.trim()) return { historico: [] }
    const historico = await this.prisma.bemHistorico.findMany({
      where: { tombamento: tombamento.trim() },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return { historico }
  }
}
