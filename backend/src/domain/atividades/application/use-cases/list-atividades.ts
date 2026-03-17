import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'
import { AtividadesRepository, AtividadeFilters, AtividadesPaginadas } from '../repositories/atividades-repository'

type ListAtividadesOutput = Either<null, AtividadesPaginadas>

@Injectable()
export class ListAtividadesUseCase {
  constructor(private atividadesRepository: AtividadesRepository) {}

  async execute(filters: AtividadeFilters): Promise<ListAtividadesOutput> {
    const result = await this.atividadesRepository.findMany({
      page: filters.page ?? 1,
      size: filters.size ?? 25,
      ...filters,
    })
    return right(result)
  }
}
