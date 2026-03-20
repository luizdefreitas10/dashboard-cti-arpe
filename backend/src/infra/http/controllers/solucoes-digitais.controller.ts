import { Controller, Get, Header } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

@Controller('solucoes-digitais')
export class SolucoesDigitaisController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Pragma', 'no-cache')
  async list() {
    const solucoes = await this.prisma.solucaoDigital.findMany({
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
    return { solucoes }
  }
}
