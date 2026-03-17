import { Bem } from '../../enterprise/entities/bem'
import { Software } from '../../enterprise/entities/software'
import { Ramal } from '../../enterprise/entities/ramal'
import { Celular } from '../../enterprise/entities/celular'

export interface BemFilters {
  page?: number
  size?: number
  tipoHardware?: string
  setor?: string
  modelo?: string
  sistemaOperacional?: string
  busca?: string
}

export interface BensPaginados {
  bens: Bem[]
  total: number
}

export interface BensPorTipo {
  tipo: string
  total: number
}

export interface BensPorSetor {
  setor: string
  total: number
}

export interface BensPorModelo {
  modelo: string
  total: number
}

export interface BensPorSO {
  so: string
  total: number
}

export interface BensStats {
  totalBens: number
  totalSoftwares: number
  totalRamais: number
  totalCelulares: number
  porTipo: BensPorTipo[]
  porSetor: BensPorSetor[]
  porModelo: BensPorModelo[]
  porSO: BensPorSO[]
}

export abstract class BensRepository {
  abstract findMany(filters: BemFilters): Promise<BensPaginados>
  abstract getStats(): Promise<BensStats>
  abstract createManyBens(bens: Bem[]): Promise<void>
  abstract createManySoftwares(softwares: Software[]): Promise<void>
  abstract createManyRamais(ramais: Ramal[]): Promise<void>
  abstract createManyCelulares(celulares: Celular[]): Promise<void>
  abstract deleteAll(): Promise<void>
}
