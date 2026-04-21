import { Controller, Get, Header, Query } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

@Controller('contratos')
export class ContratosController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Pragma', 'no-cache')
  async list(
    @Query('prestador') prestador?: string,
    @Query('servico') servico?: string,
    @Query('ano') anoRaw?: string,
    @Query('status') status?: string,
  ) {
    const ano = anoRaw ? Number(anoRaw) : undefined

    const servicoWhere = {
      ...(prestador ? { prestador } : {}),
      ...(servico ? { nomeServico: { contains: servico, mode: 'insensitive' as const } } : {}),
    }

    const [servicos, anoRows] = await Promise.all([
      this.prisma.contratoServico.findMany({
        where: servicoWhere,
        include: {
          pagamentos: {
            where: {
              ...(Number.isFinite(ano) ? { ano } : {}),
              ...(status ? { status } : {}),
            },
            orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
          },
        },
        orderBy: [{ prestador: 'asc' }, { nomeServico: 'asc' }],
      }),
      this.prisma.contratoPagamentoMensal.findMany({
        where: { servico: servicoWhere },
        select: { ano: true },
        distinct: ['ano'],
        orderBy: { ano: 'desc' },
      }),
    ])

    const anosDisponiveis = anoRows.map((r) => r.ano)

    return { servicos, anosDisponiveis }
  }

  @Get('resumo')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Pragma', 'no-cache')
  async resumo(
    @Query('ano') anoRaw?: string,
    @Query('prestador') prestador?: string,
    @Query('servico') servico?: string,
    @Query('status') status?: string,
  ) {
    const ano = anoRaw ? Number(anoRaw) : undefined

    const servicos = await this.prisma.contratoServico.findMany({
      where: {
        ...(prestador ? { prestador } : {}),
        ...(servico ? { nomeServico: { contains: servico, mode: 'insensitive' as const } } : {}),
      },
      include: {
        pagamentos: {
          where: {
            ...(Number.isFinite(ano) ? { ano } : {}),
            ...(status ? { status } : {}),
          },
        },
      },
    })

    const byStatus = {
      PAGO: 0,
      A_VENCER: 0,
      VENCIDO: 0,
      SEM_STATUS: 0,
    }
    const byPrestador: Record<
      string,
      { servicos: number; competencias: number; PAGO: number; A_VENCER: number; VENCIDO: number; SEM_STATUS: number }
    > = {}

    for (const s of servicos) {
      if (!byPrestador[s.prestador]) {
        byPrestador[s.prestador] = {
          servicos: 0,
          competencias: 0,
          PAGO: 0,
          A_VENCER: 0,
          VENCIDO: 0,
          SEM_STATUS: 0,
        }
      }
      byPrestador[s.prestador].servicos += 1
      byPrestador[s.prestador].competencias += s.pagamentos.length
      for (const p of s.pagamentos) {
        const statusKey = ['PAGO', 'A_VENCER', 'VENCIDO'].includes(p.status) ? p.status : 'SEM_STATUS'
        byStatus[statusKey as keyof typeof byStatus] += 1
        byPrestador[s.prestador][statusKey as keyof (typeof byPrestador)[string]] += 1
      }
    }

    return {
      totalServicos: servicos.length,
      totalCompetencias: servicos.reduce((acc, s) => acc + s.pagamentos.length, 0),
      byStatus,
      byPrestador,
    }
  }
}
