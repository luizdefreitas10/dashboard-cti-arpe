import { Entity, UniqueEntityID } from '@/core/entities/entity'

export interface SoftwareProps {
  nome: string
  versao?: string | null
  finalidade?: string | null
}

export class Software extends Entity<SoftwareProps> {
  get nome() { return this.props.nome }
  get versao() { return this.props.versao }
  get finalidade() { return this.props.finalidade }

  static create(props: SoftwareProps, id?: UniqueEntityID) {
    return new Software(props, id)
  }
}
