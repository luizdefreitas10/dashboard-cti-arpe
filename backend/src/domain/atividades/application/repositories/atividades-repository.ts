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

export interface AtividadesStats {
  total: number
  porCategoria: AtividadesPorCategoria[]
  porSetor: AtividadesPorSetor[]
  porResponsavel: AtividadesPorResponsavel[]
  porPrioridade: AtividadesPorPrioridade[]
  porMes: AtividadesPorMes[]
}

export abstract class AtividadesRepository {
  abstract findMany(filters: AtividadeFilters): Promise<AtividadesPaginadas>
  abstract getStats(filters?: Partial<AtividadeFilters>): Promise<AtividadesStats>
  abstract createMany(atividades: Atividade[]): Promise<void>
  abstract deleteAll(): Promise<void>
}
