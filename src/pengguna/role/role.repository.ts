import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { Prisma, Role } from "@prisma/client";
import { RoleCreateDTO } from "./role.model";

@Injectable()
export class RoleRepository {
    constructor (
        private prisma: PrismaService
    ) {}

    async findMany(): Promise<Role[]> {
        return await this.prisma.role.findMany();
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
        return await client.role.create({
            data: data
        })
    }

    async update(
        id: number,
        data: Partial<Role>,
        tx?: Prisma.TransactionClient
    ): Promise<Role> {
        const client = tx || this.prisma;
        return await client.role.update({
            where: { id: id},
            data: data
        })
    }

    async remove(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<Role> {
        const client = tx || this.prisma;
        return await client.role.delete({
            where: { id: id }
        })
    }
}