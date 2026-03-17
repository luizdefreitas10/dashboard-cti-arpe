import { Entity, UniqueEntityID } from '@/core/entities/entity'

export interface BemProps {
  tombamento: string
  tipoHardware?: string | null
  modelo?: string | null
  usuario?: string | null
  setor?: string | null
  finalidadePrincipal?: string | null
  sistemaOperacional?: string | null
  criticidade?: string | null
}

export class Bem extends Entity<BemProps> {
  get tombamento() { return this.props.tombamento }
  get tipoHardware() { return this.props.tipoHardware }
  get modelo() { return this.props.modelo }
  get usuario() { return this.props.usuario }
  get setor() { return this.props.setor }
  get finalidadePrincipal() { return this.props.finalidadePrincipal }
  get sistemaOperacional() { return this.props.sistemaOperacional }
  get criticidade() { return this.props.criticidade }

  static create(props: BemProps, id?: UniqueEntityID) {
    return new Bem(props, id)
  }
}
