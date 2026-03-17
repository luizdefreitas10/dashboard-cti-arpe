import { Atividade } from '@/domain/atividades/enterprise/entities/atividade'
import { UniqueEntityID } from '@/core/entities/entity'

interface PrismaAtividade {
  id: string
  categoria: string
  nome: string
  diaSemana: string | null
  data: Date | null
  horario: string | null
  responsavel: string | null
  solicitante: string | null
  setor: string | null
  prioridade: string | null
  estado: string | null
  observacao: string | null
  createdAt: Date
}

export class PrismaAtividadeMapper {
  static toDomain(raw: PrismaAtividade): Atividade {
    return Atividade.create(
      {
        categoria: raw.categoria,
        nome: raw.nome,
        diaSemana: raw.diaSemana,
        data: raw.data,
        horario: raw.horario,
        responsavel: raw.responsavel,
        solicitante: raw.solicitante,
        setor: raw.setor,
        prioridade: raw.prioridade,
        estado: raw.estado,
        observacao: raw.observacao,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(atividade: Atividade) {
    return {
      id: atividade.id.toString(),
      categoria: atividade.categoria,
      nome: atividade.nome,
      diaSemana: atividade.diaSemana ?? null,
      data: atividade.data ?? null,
      horario: atividade.horario ?? null,
      responsavel: atividade.responsavel ?? null,
      solicitante: atividade.solicitante ?? null,
      setor: atividade.setor ?? null,
      prioridade: atividade.prioridade ?? null,
      estado: atividade.estado ?? null,
      observacao: atividade.observacao ?? null,
      createdAt: atividade.createdAt ?? new Date(),
    }
  }
}
