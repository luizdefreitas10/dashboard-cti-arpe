import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import {
  AtividadesRepository,
  AtividadesStats,
  AtividadeFilters,
} from '../repositories/atividades-repository'

export type GetAtividadesStatsInput = Pick<AtividadeFilters, 'dataInicio' | 'dataFim'>

type GetAtividadesStatsOutput = Either<null, AtividadesStats>

@Injectable()
export class GetAtividadesStatsUseCase {
  constructor(private atividadesRepository: AtividadesRepository) {}

  async execute(input?: GetAtividadesStatsInput): Promise<GetAtividadesStatsOutput> {
    const filters: Partial<AtividadeFilters> = {}
    if (input?.dataInicio) filters.dataInicio = input.dataInicio
    if (input?.dataFim) filters.dataFim = input.dataFim
    const stats = await this.atividadesRepository.getStats(filters)
    return right(stats)
  }
}
