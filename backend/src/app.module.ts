import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './infra/auth/auth.module'
import { HttpModule } from './infra/http/http.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    HttpModule,
  ],
})
export class AppModule {}
