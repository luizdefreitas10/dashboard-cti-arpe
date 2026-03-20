import { Controller, Get, Header } from '@nestjs/common'

/**
 * Endpoint leve para keep-alive (ex.: UptimeRobot a cada 10 min) e health checks.
 * Não consulta o banco — responde assim que o processo Node está de pé.
 */
@Controller('health')
export class HealthController {
  @Get()
  @Header('Cache-Control', 'no-store')
  ping() {
    return {
      status: 'ok',
      service: 'dashboard-cti-api',
      ts: new Date().toISOString(),
    }
  }
}
