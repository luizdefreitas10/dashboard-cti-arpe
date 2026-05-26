import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import {
  AgendaReuniaoFilters,
  AgendaReunioesPaginadas,
  AgendaReunioesRepository,
} from '../repositories/agenda-reunioes-repository';

type ListAgendaReunioesOutput = Either<null, AgendaReunioesPaginadas>;

@Injectable()
export class ListAgendaReunioesUseCase {
  constructor(private agendaReunioesRepository: AgendaReunioesRepository) {}

  async execute(
    filters: AgendaReuniaoFilters,
  ): Promise<ListAgendaReunioesOutput> {
    const result = await this.agendaReunioesRepository.findMany({
      page: filters.page ?? 1,
      size: filters.size ?? 25,
      ...filters,
    });

    return right(result);
  }
}
