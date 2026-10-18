import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { PenggunaModule } from './pengguna/pengguna.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

@Module({
  imports: [
    CommonModule,
    PenggunaModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
