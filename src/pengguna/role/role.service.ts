import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { RoleRepository } from "./role.repository";
import { Prisma, Role } from "@prisma/client";
import { RoleCreateDTO, RoleResponse } from "./role.model";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class RoleService {
    private readonly logger = new Logger("RoleService")
    constructor(
        private readonly repo: RoleRepository,
        private prisma: PrismaService,
    ) {}

    private toRoleResponse(data: Role): RoleResponse {
        return {
            id: data.id,
            nama: data.nama
        }
    }

    private async getByNama(
        nama: string,
        tx?: Prisma.TransactionClient
    ): Promise<RoleResponse | null> {
        this.logger.debug(`get role ${nama}`);
        const data = await this.repo.findByName(nama, tx);
        if (!data){
            this.logger.warn(`role ${nama} is not found`)
            return null
        }

        return this.toRoleResponse(data)
    }

    async roleMustExist(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<RoleResponse> {
        this.logger.debug(`get role by id: ${id}`)
        const data = await this.repo.findById(id, tx);
        if (!data){
            this.logger.warn(`role with id: ${id} is not found`)
            throw new NotFoundException('Role is not found')
        }

        return this.toRoleResponse(data)
    }

    async getAll(): Promise<RoleResponse[]> {
        this.logger.debug('get all data role')
        const listData = await this.repo.findMany();

        return listData.map((item) => this.toRoleResponse(item))
    }

    async createRole(
        data: RoleCreateDTO,
    ): Promise<RoleResponse> {
        this.logger.log(`starting create new role ${data.nama.toLowerCase()}`)
        const namaLower = data.nama.toLowerCase();
        try {
            const newRole = await this.prisma.$transaction(
                async (tx) => {
                    const checkName = await this.getByNama(namaLower, tx);
                    if (checkName) {
                        this.logger.warn(`role ${namaLower} is already exists`)
                        throw new BadRequestException('Role is already exists')
                    }

                    const newData = await this.repo.create({nama: namaLower}, tx);
                    return newData
                }
            )
            this.logger.log(`success create new role ${newRole.nama}`)
            return this.toRoleResponse(newRole);
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err
            }

            const stackTrace = err instanceof Error ? err.stack : undefined

            this.logger.error(`Unexpected error ${err.message}`, stackTrace)
            throw new InternalServerErrorException('Terjadi kesalahan di server')
        }
    }

    async updateRole(
        id: number,
        data: RoleCreateDTO,
    ): Promise<RoleResponse> {
        this.logger.log(`starting update role data with ID: ${id}`);
        const namaLower = data.nama.toLowerCase();
        try {
            const updatedRole = await this.prisma.$transaction(
                async (tx) => {
                    const currentData = await this.roleMustExist(id, tx);
                    if (namaLower !== currentData.nama) {
                        const checkNama = await this.getByNama(namaLower, tx);
                        if (checkNama) {
                            this.logger.warn(`role ${checkNama} is already exists`)
                            throw new BadRequestException('Role has already exists')
                        }
                    }

                    const result = await this.repo.update(currentData.id, { nama: namaLower }, tx);
                    return result
                }
            )
            this.logger.log(`success update data role with ID: ${updatedRole.id}`)
            return this.toRoleResponse(updatedRole)
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err
            }

            const stackTrace = err instanceof Error ? err.stack : undefined;
            this.logger.error(`Unexpected error: ${err.message}`, stackTrace)
            throw new InternalServerErrorException('Terjadi kesalahan di server')
        }
    }

    async removeRole(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<RoleResponse> {
        this.logger.log(`starting remove data role with ID: ${id}`)
        const currentData = await this.roleMustExist(id);
        const remData = await this.repo.remove(currentData.id)
        this.logger.log(`success remove data role with ID: ${remData.id}`)
        return this.toRoleResponse(remData)
    }
}