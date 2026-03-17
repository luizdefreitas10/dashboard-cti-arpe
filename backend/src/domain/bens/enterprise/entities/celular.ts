import { Entity, UniqueEntityID } from '@/core/entities/entity'

export interface CelularProps {
  modelo: string
  setor: string
  imei: string
}

export class Celular extends Entity<CelularProps> {
  get modelo() { return this.props.modelo }
  get setor() { return this.props.setor }
  get imei() { return this.props.imei }

  static create(props: CelularProps, id?: UniqueEntityID) {
    return new Celular(props, id)
  }
}
