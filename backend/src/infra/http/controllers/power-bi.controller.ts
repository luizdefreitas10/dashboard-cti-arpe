import { Controller, Get, Header } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

@Controller('power-bi')
export class PowerBiController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Pragma', 'no-cache')
  async list() {
    const dashboards = await this.prisma.powerBiReport.findMany({
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
    return { dashboards }
  }
}
