import { Atividade } from '../../enterprise/entities/atividade'

export interface AtividadeFilters {
  page?: number
  size?: number
  dataInicio?: Date
  dataFim?: Date
  categoria?: string
  responsavel?: string
  setor?: string
  prioridade?: string
  busca?: string
}

export interface AtividadesPaginadas {
  atividades: Atividade[]
  total: number
}

export interface AtividadesPorMes {
  mes: string
  total: number
}

export interface AtividadesPorCategoria {
  categoria: string
  total: number
}

export interface AtividadesPorSetor {
  setor: string
  total: number
}

export interface AtividadesPorResponsavel {
  responsavel: string
  total: number
}

export interface AtividadesPorPrioridade {
  prioridade: string
  total: number
}

/** Contagem real por mês e prioridade (não proporcional ao total global) */
export interface AtividadesPorMesPrioridade {
  mes: string
  prioridade: string
  total: number
}

/** Heatmap: dia da semana (texto) × mês — agregado a partir do banco */
export interface AtividadesPorDiaSemanaMes {
  mes: string
  diaSemana: string
  total: number
}

export interface AtividadesPorNomeAtividade {
  nome: string
  total: number
}

export interface AtividadesPorAno {
  ano: string
  total: number
}

export interface AtividadesStats {
  total: number
  porCategoria: AtividadesPorCategoria[]
  porSetor: AtividadesPorSetor[]
  porResponsavel: AtividadesPorResponsavel[]
  porPrioridade: AtividadesPorPrioridade[]
  porMes: AtividadesPorMes[]
  porMesPrioridade: AtividadesPorMesPrioridade[]
  porDiaSemanaMes: AtividadesPorDiaSemanaMes[]
  porNomeAtividade: AtividadesPorNomeAtividade[]
  porAno: AtividadesPorAno[]
  /** Cobertura temporal das atividades com data (sempre dataset completo) */
  dataMinimaAtividade: string | null
  dataMaximaAtividade: string | null
  /** Anos distintos no banco (sempre dataset completo — para filtro de período na UI) */
  anosComDados: string[]
}

export abstract class AtividadesRepository {
  abstract findMany(filters: AtividadeFilters): Promise<AtividadesPaginadas>
  abstract getStats(filters?: Partial<AtividadeFilters>): Promise<AtividadesStats>
  abstract createMany(atividades: Atividade[]): Promise<void>
  abstract deleteAll(): Promise<void>
}
