import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { Pegawai, Prisma } from "@prisma/client";
import { CacheRepository } from "../../common/cache.repository";
import { PegawaiCreateDTO } from "./pegawai.model";

type FindManyArgs = Parameters<PrismaService['pegawai']['findMany']>[0];
type FindAllArgs = {
    where?: Prisma.PegawaiWhereInput;
    orderBy?: Prisma.PegawaiOrderByWithRelationInput;
    take?: number;
    skip?: number;
}

@Injectable()
export class PegawaiRepository extends CacheRepository{
    constructor(
        private prisma: PrismaService
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'pegawai'
    }

    async findMany(
        args: FindManyArgs
    ): Promise<Pegawai[]> {
        const cacheKey = this.getHashedCacheKey(args, 'list');
        const cachedData = await this.getCacheData<Pegawai[]>(cacheKey);
        if (cachedData) {
            this.logger.debug(`Fetching data pegawai list from cache: ${cacheKey}`);
            return cachedData;
        }

        this.logger.debug(`Fetching data pegawai list from database: [${cacheKey}]`)
        const dbData = await this.prisma.pegawai.findMany({
            ...args,
        });
        
        let isSearchQuery = false;
        const where = args?.where;

        if(where){
            if (where.OR && Array.isArray(where.OR)) {
                isSearchQuery = true
            }
        }

        const TTL = isSearchQuery ? (1000 * 60 * 3) : (1000 * 60 * 5);
        await this.setCacheData(cacheKey, dbData, TTL);
        return dbData;
    }

    async findAll(
        args: FindAllArgs
    ): Promise<Pegawai[]> {
        return await this.findMany(args);
    }

    async countAll(
        where?: Prisma.PegawaiWhereInput
    ): Promise<number> {
        const cacheKey = this.getHashedCacheKey(where ?? {}, 'count');
        const cacheCount = await this.getCacheData<number>(cacheKey);

        if (cacheCount !== undefined) {
            this.logger.debug(`Fetching pegawai count from cache: [${cacheKey}]`);
            return cacheCount;
        }

        this.logger.debug(`Fetching pegawai count from database: [${cacheKey}]`)

        const dbCount = await this.prisma.pegawai.count({where})
        let isSearchQuery = false;

        if (where?.OR && Array.isArray(where?.OR)) {
            isSearchQuery = true
        }

        const TTL = isSearchQuery ? (1000 * 60 * 3) : (1000 * 60 * 5)
        
        await this.setCacheData(cacheKey, dbCount, TTL);
        
        return dbCount;
    }

    async findById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Pegawai | null> {
        const client = tx || this.prisma;
        return await client.pegawai.findUnique({
            where: { id: id }
        })
    }

    async findByNik(
        nik: string,
        tx?: Prisma.TransactionClient
    ): Promise<Pegawai | null> {
        const client = tx || this.prisma;
        return await client.pegawai.findUnique({
            where: { nik: nik }
        });
    }

    async create(
        data: PegawaiCreateDTO,
        tx?: Prisma.TransactionClient
    ): Promise<Pegawai> {
        const client = tx || this.prisma;
        const result = await client.pegawai.create({
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async update(
        id: number,
        data: Partial<Pegawai>,
        tx?: Prisma.TransactionClient
    ): Promise<Pegawai> {
        const client = tx || this.prisma;
        const result = await client.pegawai.update({
            where: { id: id },
            data: data
        });

        await this.invalidateNamespace();
        return result;
    }

    async remove(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Pegawai> {
        const client = tx || this.prisma;
        const result = await client.pegawai.delete({
            where: { id: id }
        });

        await this.invalidateNamespace();
        return result
    }
}