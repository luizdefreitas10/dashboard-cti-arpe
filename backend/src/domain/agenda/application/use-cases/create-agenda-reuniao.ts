import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { AgendaReuniao } from '../../enterprise/entities/agenda-reuniao';
import { AgendaReunioesRepository } from '../repositories/agenda-reunioes-repository';

interface CreateAgendaReuniaoInput {
  tema: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  local: string;
  descricaoPauta?: string;
}

type CreateAgendaReuniaoOutput = Either<null, { reuniao: AgendaReuniao }>;

@Injectable()
export class CreateAgendaReuniaoUseCase {
  constructor(private agendaReunioesRepository: AgendaReunioesRepository) {}

  async execute(
    input: CreateAgendaReuniaoInput,
  ): Promise<CreateAgendaReuniaoOutput> {
    const reuniao = AgendaReuniao.create({
      tema: input.tema.trim(),
      data: input.data,
      horaInicio: input.horaInicio,
      horaFim: input.horaFim,
      local: input.local.trim(),
      descricaoPauta: input.descricaoPauta?.trim() || null,
    });

    const created = await this.agendaReunioesRepository.create(reuniao);

    return right({ reuniao: created });
  }
}
