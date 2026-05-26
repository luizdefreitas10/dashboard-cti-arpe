import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { AgendaReuniao } from '../../enterprise/entities/agenda-reuniao';
import { AgendaReunioesRepository } from '../repositories/agenda-reunioes-repository';

interface UpdateAgendaReuniaoInput {
  id: string;
  tema: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  local: string;
  descricaoPauta?: string;
}

type UpdateAgendaReuniaoOutput = Either<
  'AGENDA_REUNIAO_NOT_FOUND',
  { reuniao: AgendaReuniao }
>;

@Injectable()
export class UpdateAgendaReuniaoUseCase {
  constructor(private agendaReunioesRepository: AgendaReunioesRepository) {}

  async execute(
    input: UpdateAgendaReuniaoInput,
  ): Promise<UpdateAgendaReuniaoOutput> {
    const updated = await this.agendaReunioesRepository.update(input.id, {
      tema: input.tema.trim(),
      data: input.data,
      horaInicio: input.horaInicio,
      horaFim: input.horaFim,
      local: input.local.trim(),
      descricaoPauta: input.descricaoPauta?.trim() || null,
    });

    if (!updated) {
      return left('AGENDA_REUNIAO_NOT_FOUND');
    }

    return right({ reuniao: updated });
  }
}
