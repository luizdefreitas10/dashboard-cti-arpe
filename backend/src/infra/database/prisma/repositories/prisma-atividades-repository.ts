import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaAtividadeMapper } from '../mappers/prisma-atividade-mapper'
import {
  AtividadesRepository,
  AtividadeFilters,
  AtividadesPaginadas,
  AtividadesStats,
} from '@/domain/atividades/application/repositories/atividades-repository'
import { Atividade } from '@/domain/atividades/enterprise/entities/atividade'

@Injectable()
export class PrismaAtividadesRepository implements AtividadesRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(filters: AtividadeFilters): Promise<AtividadesPaginadas> {
    const page = filters.page ?? 1
    const size = filters.size ?? 25
    const skip = (page - 1) * size

    const where = this.buildWhere(filters)

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.atividade.findMany({
        where,
        skip,
        take: size,
        orderBy: { data: 'desc' },
      }),
      this.prisma.atividade.count({ where }),
    ])

    return {
      atividades: rows.map(PrismaAtividadeMapper.toDomain),
      total,
    }
  }

  async getStats(filters?: Partial<AtividadeFilters>): Promise<AtividadesStats> {
    type Row = { label: string; total: bigint }
    type MesRow = { mes: string; total: bigint }

    const [total, porCategoria, porSetor, porResponsavel, porPrioridade, porMes] =
      await Promise.all([
        this.prisma.atividade.count(),
        this.prisma.$queryRaw<Row[]>`
          SELECT categoria AS label, COUNT(*) AS total
          FROM atividades
          WHERE categoria IS NOT NULL
          GROUP BY categoria
          ORDER BY total DESC
        `,
        this.prisma.$queryRaw<Row[]>`
          SELECT setor AS label, COUNT(*) AS total
          FROM atividades
          WHERE setor IS NOT NULL
          GROUP BY setor
          ORDER BY total DESC
          LIMIT 15
        `,
        this.prisma.$queryRaw<Row[]>`
          SELECT responsavel AS label, COUNT(*) AS total
          FROM atividades
          WHERE responsavel IS NOT NULL
          GROUP BY responsavel
          ORDER BY total DESC
          LIMIT 10
        `,
        this.prisma.$queryRaw<Row[]>`
          SELECT prioridade AS label, COUNT(*) AS total
          FROM atividades
          WHERE prioridade IS NOT NULL
          GROUP BY prioridade
          ORDER BY total DESC
        `,
        this.prisma.$queryRaw<MesRow[]>`
          SELECT TO_CHAR(data, 'YYYY-MM') AS mes, COUNT(*) AS total
          FROM atividades
          WHERE data IS NOT NULL
          GROUP BY mes
          ORDER BY mes ASC
        `,
      ])

    return {
      total,
      porCategoria: porCategoria.map((r) => ({ categoria: r.label, total: Number(r.total) })),
      porSetor: porSetor.map((r) => ({ setor: r.label, total: Number(r.total) })),
      porResponsavel: porResponsavel.map((r) => ({ responsavel: r.label, total: Number(r.total) })),
      porPrioridade: porPrioridade.map((r) => ({ prioridade: r.label, total: Number(r.total) })),
      porMes: porMes.map((r) => ({ mes: r.mes, total: Number(r.total) })),
    }
  }

  async createMany(atividades: Atividade[]): Promise<void> {
    const data = atividades.map(PrismaAtividadeMapper.toPrisma)
    await this.prisma.atividade.createMany({ data, skipDuplicates: true })
  }

  async deleteAll(): Promise<void> {
    await this.prisma.atividade.deleteMany()
  }

  private buildWhere(filters: Partial<AtividadeFilters>) {
    const where: Record<string, unknown> = {}

    if (filters.dataInicio || filters.dataFim) {
      where.data = {
        ...(filters.dataInicio ? { gte: filters.dataInicio } : {}),
        ...(filters.dataFim ? { lte: filters.dataFim } : {}),
      }
    }
    if (filters.categoria) where.categoria = { contains: filters.categoria, mode: 'insensitive' }
    if (filters.responsavel) where.responsavel = { contains: filters.responsavel, mode: 'insensitive' }
    if (filters.setor) where.setor = { contains: filters.setor, mode: 'insensitive' }
    if (filters.prioridade) where.prioridade = { contains: filters.prioridade, mode: 'insensitive' }
    if (filters.busca) {
      where.OR = [
        { nome: { contains: filters.busca, mode: 'insensitive' } },
        { solicitante: { contains: filters.busca, mode: 'insensitive' } },
        { observacao: { contains: filters.busca, mode: 'insensitive' } },
      ]
    }

    return where
  }
}
