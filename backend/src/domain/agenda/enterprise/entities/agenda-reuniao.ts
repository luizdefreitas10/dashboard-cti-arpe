import { Entity, UniqueEntityID } from '@/core/entities/entity';

export interface AgendaReuniaoProps {
  tema: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  local: string;
  descricaoPauta?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AgendaReuniao extends Entity<AgendaReuniaoProps> {
  get tema() {
    return this.props.tema;
  }
  get data() {
    return this.props.data;
  }
  get horaInicio() {
    return this.props.horaInicio;
  }
  get horaFim() {
    return this.props.horaFim;
  }
  get local() {
    return this.props.local;
  }
  get descricaoPauta() {
    return this.props.descricaoPauta;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: AgendaReuniaoProps, id?: UniqueEntityID) {
    const now = new Date();
    return new AgendaReuniao(
      {
        ...props,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      id,
    );
  }
}
