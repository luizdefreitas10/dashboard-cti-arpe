import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { AgendaReunioesRepository } from '../repositories/agenda-reunioes-repository';

interface DeleteAgendaReuniaoInput {
  id: string;
}

type DeleteAgendaReuniaoOutput = Either<'AGENDA_REUNIAO_NOT_FOUND', null>;

@Injectable()
export class DeleteAgendaReuniaoUseCase {
  constructor(private agendaReunioesRepository: AgendaReunioesRepository) {}

  async execute(
    input: DeleteAgendaReuniaoInput,
  ): Promise<DeleteAgendaReuniaoOutput> {
    const deleted = await this.agendaReunioesRepository.delete(input.id);

    if (!deleted) {
      return left('AGENDA_REUNIAO_NOT_FOUND');
    }

    return right(null);
  }
}
