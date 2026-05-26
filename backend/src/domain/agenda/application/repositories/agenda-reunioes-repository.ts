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

export abstract class AgendaReunioesRepository {
  abstract findMany(
    filters: AgendaReuniaoFilters,
  ): Promise<AgendaReunioesPaginadas>;
  abstract create(reuniao: AgendaReuniao): Promise<AgendaReuniao>;
}
