import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { BensRepository, BemFilters, BensPaginados } from '../repositories/bens-repository'

type ListBensOutput = Either<null, BensPaginados>

@Injectable()
export class ListBensUseCase {
  constructor(private bensRepository: BensRepository) {}

  async execute(filters: BemFilters): Promise<ListBensOutput> {
    const result = await this.bensRepository.findMany({
      page: filters.page ?? 1,
      size: filters.size ?? 25,
      ...filters,
    })
    return right(result)
  }
}
