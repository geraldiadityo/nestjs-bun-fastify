import { Global, Inject, Logger, MiddlewareConsumer, Module, NestModule, OnApplicationShutdown, OnModuleDestroy } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import { APP_FILTER } from "@nestjs/core";
import { ErrorFilter } from "../utils/error.filter";
import { KEYV_INSTANCE, KeyvProvider } from "./keyv.provider";
import Keyv from "keyv";
import KeyvRedis, { RedisClientType } from "@keyv/redis";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
    ],
    providers: [
        PrismaService,
        KeyvProvider,
        {
            provide: APP_FILTER,
            useClass: ErrorFilter
        },
    ],
    exports: [
        PrismaService,
        KeyvProvider
    ]
})
export class CommonModule implements NestModule, OnApplicationShutdown {
    private isRedisDisconnected = false;

    private readonly logger = new Logger("CommonModule");

    constructor(
        @Inject(KEYV_INSTANCE) private readonly globalKeyv: Keyv
    ) {}

    private async closeRedisConnection(phase: string, signal?: string) {
        if (this.isRedisDisconnected) return;

        this.isRedisDisconnected = true;

        this.logger.log(`[${phase}] Recieved shutdown signals ${signal || 'NORMAL'}. closing redis connection...`);
        
        try {
            const baseStore = this.globalKeyv?.store;
            if (baseStore instanceof KeyvRedis) {
                const redisClient = baseStore.client as RedisClientType;
                if (redisClient && redisClient.isOpen) {
                    await redisClient.quit();
                    this.logger.log('Redis connection closed gracefully')
                }
            } else if (this.globalKeyv) {
                await this.globalKeyv.disconnect();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Error closing redis connection: ${msg}`);
        }
    }

    async onApplicationShutdown(signal?: string) {
        await this.closeRedisConnection('on application shutdown', signal);
    }

    configure(consumer: MiddlewareConsumer) {
        
    }
}