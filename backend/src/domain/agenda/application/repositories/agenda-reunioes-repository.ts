import { AgendaReuniao } from '../../enterprise/entities/agenda-reuniao';

export interface AgendaReuniaoFilters {
  page?: number;
  size?: number;
  dataInicio?: Date;
  dataFim?: Date;
  local?: string;
  busca?: string;
  ordem?: 'asc' | 'desc';
}

export interface AgendaReunioesPaginadas {
  reunioes: AgendaReuniao[];
  total: number;
}

export interface AgendaReuniaoUpdateData {
  tema: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  local: string;
  descricaoPauta?: string | null;
}

export abstract class AgendaReunioesRepository {
  abstract findMany(
    filters: AgendaReuniaoFilters,
  ): Promise<AgendaReunioesPaginadas>;
  abstract create(reuniao: AgendaReuniao): Promise<AgendaReuniao>;
  abstract update(
    id: string,
    data: AgendaReuniaoUpdateData,
  ): Promise<AgendaReuniao | null>;
  abstract delete(id: string): Promise<boolean>;
}
