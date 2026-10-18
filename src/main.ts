import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLogger } from './common/winston.logger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const customeLogger = new WinstonLogger();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: customeLogger
    }
  );

  const configService = app.get(ConfigService);
  app.enableShutdownHooks();
  const port = configService.get('PORT', '8000')
  await app.listen(Number(port), '0.0.0.0');
  customeLogger.log(`Backend service running on port ${configService.get('PORT', '8000')}`, 'Bootstrap')
  
  const shutdownSignals = ['SIGINT', 'SIGTERM'];
  for (const signal of shutdownSignals) {
    process.once(signal, async () => {
      customeLogger.log(`Sinya ${signal} diterima, memulai graceful shutdown...`, 'Bootstrap');

      const forceExitTimer = setTimeout(() => {
        customeLogger.warn('Proses shutdown terlalu lama, memaksa keluar (force exit)...', 'Bootstrap');
        process.exit(1);
      }, 5000);

      try {
        await app.close();
        customeLogger.log('Aplikasi dan koneksi berhasil di tutup dengan aman', 'Bootstrap');
      } catch (err: unknown) {
        if (err instanceof Error) {
          customeLogger.error(`Gagal melakukan shutdown: ${err.message}`, err.stack, 'Bootstrap')
        } else {
          customeLogger.error('Gagal melakukan shutdown karena error tak terduga', String(err), 'Bootstrap')
        }
      } finally {
        clearTimeout(forceExitTimer);

        setTimeout(() => process.exit(0), 100)
      }
    })
  }
}
void bootstrap();
