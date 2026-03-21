import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
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

  private sqlDateFilter(filters?: Partial<AtividadeFilters>): Prisma.Sql {
    if (!filters?.dataInicio && !filters?.dataFim) {
      return Prisma.empty
    }
    const parts: Prisma.Sql[] = []
    if (filters.dataInicio) {
      parts.push(Prisma.sql`"data" >= ${filters.dataInicio}`)
    }
    if (filters.dataFim) {
      parts.push(Prisma.sql`"data" <= ${filters.dataFim}`)
    }
    return Prisma.sql`AND ${Prisma.join(parts, ' AND ')}`
  }

  async getStats(filters?: Partial<AtividadeFilters>): Promise<AtividadesStats> {
    type Row = { label: string; total: bigint }
    type MesRow = { mes: string; total: bigint }
    type MesPriRow = { mes: string; prioridade: string; total: bigint }
    type DiaMesRow = { mes: string; diaSemana: string; total: bigint }
    type NomeRow = { nome: string; total: bigint }
    type AnoRow = { ano: number; total: bigint }
    type RangeRow = { min: Date | null; max: Date | null }
    type AnoDistRow = { y: number }

    const df = this.sqlDateFilter(filters)

    const [
      totalRows,
      porCategoria,
      porSetor,
      porResponsavel,
      porPrioridade,
      porMes,
      porMesPrioridade,
      porDiaSemanaMes,
      porNomeAtividade,
      porAno,
      rangeRows,
      anosDistintos,
    ] = await Promise.all([
      this.prisma.$queryRaw<[{ c: bigint }]>`
        SELECT COUNT(*)::bigint AS c FROM atividades WHERE 1=1 ${df}
      `,
      this.prisma.$queryRaw<Row[]>`
        SELECT categoria AS label, COUNT(*)::bigint AS total
        FROM atividades
        WHERE categoria IS NOT NULL ${df}
        GROUP BY categoria
        ORDER BY total DESC
      `,
      this.prisma.$queryRaw<Row[]>`
        SELECT setor AS label, COUNT(*)::bigint AS total
        FROM atividades
        WHERE setor IS NOT NULL ${df}
        GROUP BY setor
        ORDER BY total DESC
        LIMIT 15
      `,
      this.prisma.$queryRaw<Row[]>`
        SELECT responsavel AS label, COUNT(*)::bigint AS total
        FROM atividades
        WHERE responsavel IS NOT NULL ${df}
        GROUP BY responsavel
        ORDER BY total DESC
        LIMIT 10
      `,
      this.prisma.$queryRaw<Row[]>`
        SELECT prioridade AS label, COUNT(*)::bigint AS total
        FROM atividades
        WHERE prioridade IS NOT NULL ${df}
        GROUP BY prioridade
        ORDER BY total DESC
      `,
      this.prisma.$queryRaw<MesRow[]>`
        SELECT TO_CHAR("data", 'YYYY-MM') AS mes, COUNT(*)::bigint AS total
        FROM atividades
        WHERE "data" IS NOT NULL ${df}
        GROUP BY mes
        ORDER BY mes ASC
      `,
      this.prisma.$queryRaw<MesPriRow[]>`
        SELECT TO_CHAR("data", 'YYYY-MM') AS mes, prioridade, COUNT(*)::bigint AS total
        FROM atividades
        WHERE "data" IS NOT NULL AND prioridade IS NOT NULL ${df}
        GROUP BY mes, prioridade
        ORDER BY mes ASC, prioridade ASC
      `,
      this.prisma.$queryRaw<DiaMesRow[]>`
        SELECT TO_CHAR("data", 'YYYY-MM') AS mes, TRIM("diaSemana") AS "diaSemana", COUNT(*)::bigint AS total
        FROM atividades
        WHERE "data" IS NOT NULL AND "diaSemana" IS NOT NULL AND TRIM("diaSemana") <> '' ${df}
        GROUP BY mes, TRIM("diaSemana")
        ORDER BY mes ASC, "diaSemana" ASC
      `,
      this.prisma.$queryRaw<NomeRow[]>`
        SELECT nome, COUNT(*)::bigint AS total
        FROM atividades
        WHERE 1=1 ${df}
        GROUP BY nome
        ORDER BY total DESC
        LIMIT 15
      `,
      this.prisma.$queryRaw<AnoRow[]>`
        SELECT EXTRACT(YEAR FROM "data")::int AS ano, COUNT(*)::bigint AS total
        FROM atividades
        WHERE "data" IS NOT NULL ${df}
        GROUP BY EXTRACT(YEAR FROM "data")
        ORDER BY ano ASC
      `,
      this.prisma.$queryRaw<RangeRow[]>`
        SELECT MIN("data") AS min, MAX("data") AS max
        FROM atividades
        WHERE "data" IS NOT NULL
      `,
      this.prisma.$queryRaw<AnoDistRow[]>`
        SELECT DISTINCT EXTRACT(YEAR FROM "data")::int AS y
        FROM atividades
        WHERE "data" IS NOT NULL
        ORDER BY y ASC
      `,
    ])

    const total = Number(totalRows[0]?.c ?? 0n)
    const range = rangeRows[0]

    return {
      total,
      porCategoria: porCategoria.map((r) => ({ categoria: r.label, total: Number(r.total) })),
      porSetor: porSetor.map((r) => ({ setor: r.label, total: Number(r.total) })),
      porResponsavel: porResponsavel.map((r) => ({ responsavel: r.label, total: Number(r.total) })),
      porPrioridade: porPrioridade.map((r) => ({ prioridade: r.label, total: Number(r.total) })),
      porMes: porMes.map((r) => ({ mes: r.mes, total: Number(r.total) })),
      porMesPrioridade: porMesPrioridade.map((r) => ({
        mes: r.mes,
        prioridade: r.prioridade,
        total: Number(r.total),
      })),
      porDiaSemanaMes: porDiaSemanaMes.map((r) => ({
        mes: r.mes,
        diaSemana: r.diaSemana,
        total: Number(r.total),
      })),
      porNomeAtividade: porNomeAtividade.map((r) => ({ nome: r.nome, total: Number(r.total) })),
      porAno: porAno.map((r) => ({ ano: String(r.ano), total: Number(r.total) })),
      dataMinimaAtividade: range?.min ? range.min.toISOString() : null,
      dataMaximaAtividade: range?.max ? range.max.toISOString() : null,
      anosComDados: anosDistintos.map((r) => String(r.y)),
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
