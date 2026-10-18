import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { Prisma, Role } from "@prisma/client";
import { RoleCreateDTO } from "./role.model";
import { CacheRepository } from "../../common/cache.repository";

@Injectable()
export class RoleRepository extends CacheRepository {
    // private readonly logger = new Logger('RoleRepository');
    constructor (
        private prisma: PrismaService
    ) {
        super();
    }

    protected getNamespace(): string {
        return 'roles';
    }

    async findMany(): Promise<Role[]> {
        const cacheKey = this.getCacheKey('all', 'list');
        const cachedData = await this.getCacheData<Role[]>(cacheKey);
        if (cachedData){
            this.logger.debug('Fetching data role from cache')
            return cachedData;
        }
        this.logger.debug('Fetching data role from database');
        const dbData = await this.prisma.role.findMany();
        await this.setCacheData(cacheKey, dbData);
        return dbData;
    }

    async findById(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Role | null> {
        const client = tx || this.prisma;
        return await client.role.findUnique({
            where: { id: id }
        })
    }

    async findByName(
        nama: string,
        tx?: Prisma.TransactionClient
    ): Promise<Role | null> {
        const client = tx || this.prisma;
        return await client.role.findUnique({
            where: { nama: nama }
        })
    }

    async create(
        data: RoleCreateDTO,
        tx?: Prisma.TransactionClient
    ): Promise<Role> {
        const client = tx || this.prisma;
        const result = await client.role.create({
            data: data
        })

        await this.invalidateNamespace();
        return result;
    }

    async update(
        id: number,
        data: Partial<Role>,
        tx?: Prisma.TransactionClient
    ): Promise<Role> {
        const client = tx || this.prisma;
        const result = await client.role.update({
            where: { id: id},
            data: data
        })

        await this.invalidateNamespace();
        return result
    }

    async remove(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Role> {
        const client = tx || this.prisma;
        const result = await client.role.delete({
            where: { id: id }
        });

        await this.invalidateNamespace();
        return result;
    }
}