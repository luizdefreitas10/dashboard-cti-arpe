import { Controller, Get, Header } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

@Controller('import-logs')
export class ImportLogsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Pragma', 'no-cache')
  async list() {
    const logs = await this.prisma.dataImportLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 80,
    })
    return { logs }
  }
}
