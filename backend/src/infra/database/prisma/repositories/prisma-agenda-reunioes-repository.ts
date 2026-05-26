import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AgendaReuniaoFilters,
  AgendaReuniaoUpdateData,
  AgendaReunioesPaginadas,
  AgendaReunioesRepository,
} from '@/domain/agenda/application/repositories/agenda-reunioes-repository';
import { AgendaReuniao } from '@/domain/agenda/enterprise/entities/agenda-reuniao';
import { PrismaAgendaReuniaoMapper } from '../mappers/prisma-agenda-reuniao-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAgendaReunioesRepository implements AgendaReunioesRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(
    filters: AgendaReuniaoFilters,
  ): Promise<AgendaReunioesPaginadas> {
    const page = filters.page ?? 1;
    const size = filters.size ?? 25;
    const skip = (page - 1) * size;
    const where = this.buildWhere(filters);
    const ordem = filters.ordem ?? 'desc';

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.agendaReuniao.findMany({
        where,
        skip,
        take: size,
        orderBy: [{ data: ordem }, { horaInicio: ordem }],
      }),
      this.prisma.agendaReuniao.count({ where }),
    ]);

    return {
      reunioes: rows.map((row) => PrismaAgendaReuniaoMapper.toDomain(row)),
      total,
    };
  }

  async create(reuniao: AgendaReuniao): Promise<AgendaReuniao> {
    const created = await this.prisma.agendaReuniao.create({
      data: PrismaAgendaReuniaoMapper.toPrisma(reuniao),
    });

    return PrismaAgendaReuniaoMapper.toDomain(created);
  }

  async update(
    id: string,
    data: AgendaReuniaoUpdateData,
  ): Promise<AgendaReuniao | null> {
    const existing = await this.prisma.agendaReuniao.findUnique({
      where: { id },
    });

    if (!existing) return null;

    const updated = await this.prisma.agendaReuniao.update({
      where: { id },
      data,
    });

    return PrismaAgendaReuniaoMapper.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.prisma.agendaReuniao.deleteMany({
      where: { id },
    });

    return deleted.count > 0;
  }

  private buildWhere(
    filters: Partial<AgendaReuniaoFilters>,
  ): Prisma.AgendaReuniaoWhereInput {
    const where: Prisma.AgendaReuniaoWhereInput = {};

    if (filters.dataInicio || filters.dataFim) {
      where.data = {
        ...(filters.dataInicio ? { gte: filters.dataInicio } : {}),
        ...(filters.dataFim ? { lte: filters.dataFim } : {}),
      };
    }

    if (filters.local) {
      where.local = { contains: filters.local, mode: 'insensitive' };
    }

    if (filters.busca) {
      where.OR = [
        { tema: { contains: filters.busca, mode: 'insensitive' } },
        { local: { contains: filters.busca, mode: 'insensitive' } },
        { descricaoPauta: { contains: filters.busca, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
