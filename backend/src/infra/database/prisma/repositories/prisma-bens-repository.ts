import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaBemMapper } from '../mappers/prisma-bem-mapper'
import {
  BensRepository,
  BemFilters,
  BensPaginados,
  BensStats,
} from '@/domain/bens/application/repositories/bens-repository'
import { Bem } from '@/domain/bens/enterprise/entities/bem'
import { Software } from '@/domain/bens/enterprise/entities/software'
import { Ramal } from '@/domain/bens/enterprise/entities/ramal'
import { Celular } from '@/domain/bens/enterprise/entities/celular'

@Injectable()
export class PrismaBensRepository implements BensRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(filters: BemFilters): Promise<BensPaginados> {
    const page = filters.page ?? 1
    const size = filters.size ?? 25
    const skip = (page - 1) * size
    const where = this.buildWhere(filters)

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.bem.findMany({ where, skip, take: size, orderBy: { tipoHardware: 'asc' } }),
      this.prisma.bem.count({ where }),
    ])

    return { bens: rows.map(PrismaBemMapper.toDomain), total }
  }

  async getStats(): Promise<BensStats> {
    type Row = { label: string; total: bigint }

    const [totalBens, totalSoftwares, totalRamais, totalCelulares, porTipo, porSetor, porModelo, porSO] =
      await Promise.all([
        this.prisma.bem.count(),
        this.prisma.software.count(),
        this.prisma.ramal.count(),
        this.prisma.celular.count(),
        this.prisma.$queryRaw<Row[]>`
          SELECT "tipoHardware" AS label, COUNT(*) AS total
          FROM bens
          WHERE "tipoHardware" IS NOT NULL
          GROUP BY "tipoHardware"
          ORDER BY total DESC
        `,
        this.prisma.$queryRaw<Row[]>`
          SELECT setor AS label, COUNT(*) AS total
          FROM bens
          WHERE setor IS NOT NULL
          GROUP BY setor
          ORDER BY total DESC
          LIMIT 20
        `,
        this.prisma.$queryRaw<Row[]>`
          SELECT modelo AS label, COUNT(*) AS total
          FROM bens
          WHERE modelo IS NOT NULL AND modelo != '-'
          GROUP BY modelo
          ORDER BY total DESC
          LIMIT 10
        `,
        this.prisma.$queryRaw<Row[]>`
          SELECT "sistemaOperacional" AS label, COUNT(*) AS total
          FROM bens
          WHERE "sistemaOperacional" IS NOT NULL AND "sistemaOperacional" != '-'
          GROUP BY "sistemaOperacional"
          ORDER BY total DESC
        `,
      ])

    return {
      totalBens,
      totalSoftwares,
      totalRamais,
      totalCelulares,
      porTipo: porTipo.map((r) => ({ tipo: r.label, total: Number(r.total) })),
      porSetor: porSetor.map((r) => ({ setor: r.label, total: Number(r.total) })),
      porModelo: porModelo.map((r) => ({ modelo: r.label, total: Number(r.total) })),
      porSO: porSO.map((r) => ({ so: r.label, total: Number(r.total) })),
    }
  }

  async createManyBens(bens: Bem[]): Promise<void> {
    const data = bens.map(PrismaBemMapper.toPrisma)
    await this.prisma.bem.createMany({ data, skipDuplicates: true })
  }

  async createManySoftwares(softwares: Software[]): Promise<void> {
    const data = softwares.map((s) => ({
      id: s.id.toString(),
      nome: s.nome,
      versao: s.versao ?? null,
      finalidade: s.finalidade ?? null,
    }))
    await this.prisma.software.createMany({ data, skipDuplicates: true })
  }

  async createManyRamais(ramais: Ramal[]): Promise<void> {
    const data = ramais.map((r) => ({
      id: r.id.toString(),
      setor: r.setor,
      digital: r.digital,
      analogico: r.analogico,
      total: r.total,
      descricao: r.descricao ?? null,
    }))
    await this.prisma.ramal.createMany({ data, skipDuplicates: true })
  }

  async createManyCelulares(celulares: Celular[]): Promise<void> {
    const data = celulares.map((c) => ({
      id: c.id.toString(),
      modelo: c.modelo,
      setor: c.setor,
      imei: c.imei,
    }))
    await this.prisma.celular.createMany({ data, skipDuplicates: true })
  }

  async deleteAll(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.bem.deleteMany(),
      this.prisma.software.deleteMany(),
      this.prisma.ramal.deleteMany(),
      this.prisma.celular.deleteMany(),
    ])
  }

  private buildWhere(filters: Partial<BemFilters>) {
    const where: Record<string, unknown> = {}
    if (filters.tipoHardware) where.tipoHardware = { contains: filters.tipoHardware, mode: 'insensitive' }
    if (filters.setor) where.setor = { contains: filters.setor, mode: 'insensitive' }
    if (filters.modelo) where.modelo = { contains: filters.modelo, mode: 'insensitive' }
    if (filters.sistemaOperacional) where.sistemaOperacional = { contains: filters.sistemaOperacional, mode: 'insensitive' }
    if (filters.busca) {
      where.OR = [
        { tombamento: { contains: filters.busca, mode: 'insensitive' } },
        { usuario: { contains: filters.busca, mode: 'insensitive' } },
        { modelo: { contains: filters.busca, mode: 'insensitive' } },
      ]
    }
    return where
  }
}
