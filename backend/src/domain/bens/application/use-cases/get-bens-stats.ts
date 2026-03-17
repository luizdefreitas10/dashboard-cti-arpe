import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { BensRepository, BensStats } from '../repositories/bens-repository'

type GetBensStatsOutput = Either<null, BensStats>

@Injectable()
export class GetBensStatsUseCase {
  constructor(private bensRepository: BensRepository) {}

  async execute(): Promise<GetBensStatsOutput> {
    const stats = await this.bensRepository.getStats()
    return right(stats)
  }
}
