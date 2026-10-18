import { Inject, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { KEYV_INSTANCE } from "./keyv.provider";
import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";

export abstract class CacheRepository implements OnModuleInit, OnModuleDestroy {
    @Inject(KEYV_INSTANCE) protected keyv!: Keyv

    protected cache!: Keyv;

    protected abstract getNamespace(): string

    protected readonly logger = new Logger('CacheRepository')

    onModuleInit() {
        const namespace = this.getNamespace();
        const baseStore = this.keyv.store;

        if (baseStore instanceof KeyvRedis) {
            const namespaceStore = new KeyvRedis(baseStore.client, {
                namespace: namespace
            });

            this.cache = new Keyv({store: namespaceStore})
        } else {
            this.cache = new Keyv({ namespace })
        }

        this.cache.on('error', (err) => {
            this.logger.warn(`[Cache error - ${namespace}]: ${err.message}`)
        });
    }

    onModuleDestroy() {
        if (this.cache) {
            this.cache.removeAllListeners();
        }

        if (this.cache.store && typeof this.cache.store.removeAllListeners === 'function') {
            this.cache.store.removeAllListeners();
        }
    }

    protected async getCacheData<T>(key: string): Promise<T | undefined> {
        if (!this.cache) {
            return undefined
        }
        try {
            return await this.cache.get<T>(key);
        } catch (err: any) {
            this.logger.warn(`Gagal membaca cache [${this.getNamespace()}:${key}]: ${err.message}`)
            return undefined;
        }
    }

    protected async setCacheData<T>(
        key: string,
        value: T,
        ttlInMs?: number
    ): Promise<void> {
        if (!this.cache) return
        try {
            await this.cache.set(key, value, ttlInMs);
        } catch (err: any) {
            this.logger.warn(`Gagal menyimpan cache [${this.getNamespace()}:${key}]: ${err.message}`);
        }
    }

    protected async deleteCacheData(
        key: string
    ): Promise<void> {
        if (!this.cache) return;

        try {
            await this.cache.delete(key);
        } catch (err: any) {
            this.logger.warn(`Gagal menghapus cache [${this.getNamespace()}:${key}]: ${err.message}`);
        }
    }

    protected async invalidateNamespace(): Promise<void> {
        if (!this.cache) return;

        try {
            await this.cache.clear();
        } catch (err: any) {
            this.logger.warn(`Gagal invalidasi namespace [${this.getNamespace()}]: ${err.message}`)
        }
    }

    protected getCacheKey(
        args: any,
        prefix?: string
    ): string {
        const raw = typeof args === 'object' && args !== null ? JSON.stringify(args) : String(args ?? '');
        return prefix ? `${prefix}:${raw}` : raw
    }

}