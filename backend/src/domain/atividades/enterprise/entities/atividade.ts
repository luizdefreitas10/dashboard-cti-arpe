import { Entity, UniqueEntityID } from '@/core/entities/entity'

export interface AtividadeProps {
  categoria: string
  nome: string
  diaSemana?: string | null
  data?: Date | null
  horario?: string | null
  responsavel?: string | null
  solicitante?: string | null
  setor?: string | null
  prioridade?: string | null
  estado?: string | null
  observacao?: string | null
  createdAt?: Date
}

export class Atividade extends Entity<AtividadeProps> {
  get categoria() { return this.props.categoria }
  get nome() { return this.props.nome }
  get diaSemana() { return this.props.diaSemana }
  get data() { return this.props.data }
  get horario() { return this.props.horario }
  get responsavel() { return this.props.responsavel }
  get solicitante() { return this.props.solicitante }
  get setor() { return this.props.setor }
  get prioridade() { return this.props.prioridade }
  get estado() { return this.props.estado }
  get observacao() { return this.props.observacao }
  get createdAt() { return this.props.createdAt }

  static create(props: AtividadeProps, id?: UniqueEntityID) {
    return new Atividade(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id,
    )
  }
}
