import { UniqueEntityID } from '@/core/entities/entity';
import { AgendaReuniao } from '@/domain/agenda/enterprise/entities/agenda-reuniao';

interface PrismaAgendaReuniao {
  id: string;
  tema: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  local: string;
  descricaoPauta: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: { name: string } | null;
  updatedBy?: { name: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PrismaAgendaReuniaoMapper {
  static toDomain(raw: PrismaAgendaReuniao): AgendaReuniao {
    return AgendaReuniao.create(
      {
        tema: raw.tema,
        data: raw.data,
        horaInicio: raw.horaInicio,
        horaFim: raw.horaFim,
        local: raw.local,
        descricaoPauta: raw.descricaoPauta,
        createdById: raw.createdById,
        createdByName: raw.createdBy?.name ?? null,
        updatedById: raw.updatedById,
        updatedByName: raw.updatedBy?.name ?? null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(reuniao: AgendaReuniao) {
    return {
      id: reuniao.id.toString(),
      tema: reuniao.tema,
      data: reuniao.data,
      horaInicio: reuniao.horaInicio,
      horaFim: reuniao.horaFim,
      local: reuniao.local,
      descricaoPauta: reuniao.descricaoPauta ?? null,
      createdById: reuniao.createdById ?? null,
      updatedById: reuniao.updatedById ?? null,
      createdAt: reuniao.createdAt ?? new Date(),
    };
  }
}
