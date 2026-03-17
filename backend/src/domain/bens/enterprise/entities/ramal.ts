import { Entity, UniqueEntityID } from '@/core/entities/entity'

export interface RamalProps {
  setor: string
  digital: number
  analogico: number
  total: number
  descricao?: string | null
}

export class Ramal extends Entity<RamalProps> {
  get setor() { return this.props.setor }
  get digital() { return this.props.digital }
  get analogico() { return this.props.analogico }
  get total() { return this.props.total }
  get descricao() { return this.props.descricao }

  static create(props: RamalProps, id?: UniqueEntityID) {
    return new Ramal(props, id)
  }
}
