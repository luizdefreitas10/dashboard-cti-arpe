import { Atividade } from '@/domain/atividades/enterprise/entities/atividade'

export class AtividadePresenter {
  static toHTTP(atividade: Atividade) {
    return {
      id: atividade.id.toString(),
      categoria: atividade.categoria,
      nome: atividade.nome,
      diaSemana: atividade.diaSemana,
      data: atividade.data,
      horario: atividade.horario,
      responsavel: atividade.responsavel,
      solicitante: atividade.solicitante,
      setor: atividade.setor,
      prioridade: atividade.prioridade,
      estado: atividade.estado,
      observacao: atividade.observacao,
    }
  }
}
