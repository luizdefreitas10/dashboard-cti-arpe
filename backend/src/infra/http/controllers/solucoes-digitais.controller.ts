import { Controller, Get, Header } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Public } from '@/infra/auth/decorators/public'

@Controller('solucoes-digitais')
export class SolucoesDigitaisController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Pragma', 'no-cache')
  async list() {
    const solucoes = await this.prisma.solucaoDigital.findMany({
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
    return { solucoes }
  }
}
