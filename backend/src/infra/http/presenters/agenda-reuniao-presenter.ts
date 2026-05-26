import { AgendaReuniao } from '@/domain/agenda/enterprise/entities/agenda-reuniao';

export class AgendaReuniaoPresenter {
  static toHTTP(reuniao: AgendaReuniao) {
    return {
      id: reuniao.id.toString(),
      tema: reuniao.tema,
      data: reuniao.data,
      horaInicio: reuniao.horaInicio,
      horaFim: reuniao.horaFim,
      local: reuniao.local,
      descricaoPauta: reuniao.descricaoPauta ?? null,
      createdAt: reuniao.createdAt,
      updatedAt: reuniao.updatedAt,
    };
  }
}
