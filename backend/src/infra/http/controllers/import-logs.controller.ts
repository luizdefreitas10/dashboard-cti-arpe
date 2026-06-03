import { Controller, Get, Header } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Public } from '@/infra/auth/decorators/public'

@Controller('import-logs')
export class ImportLogsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
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
