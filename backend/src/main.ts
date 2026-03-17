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

  const port = process.env.PORT ?? 3333
  await app.listen(port)
  console.log(`🚀 Backend CTI rodando em: http://localhost:${port} (use porta 3334 — 3333 em uso por outro projeto)`)
}

bootstrap()
