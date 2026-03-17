import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { AtividadesRepository, AtividadesStats } from '../repositories/atividades-repository'

type GetAtividadesStatsOutput = Either<null, AtividadesStats>

@Injectable()
export class GetAtividadesStatsUseCase {
  constructor(private atividadesRepository: AtividadesRepository) {}

  async execute(): Promise<GetAtividadesStatsOutput> {
    const stats = await this.atividadesRepository.getStats()
    return right(stats)
  }
}
