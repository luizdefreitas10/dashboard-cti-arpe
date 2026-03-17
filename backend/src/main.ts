import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const corsOrigin = process.env.CORS_ORIGIN
  const origins = corsOrigin
    ? corsOrigin.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001']

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })

  const port = Number(process.env.PORT) || 3333
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 Backend CTI rodando em http://0.0.0.0:${port}`)
}

bootstrap().catch((err) => {
  console.error('Falha ao subir a aplicação:', err)
  process.exit(1)
})
