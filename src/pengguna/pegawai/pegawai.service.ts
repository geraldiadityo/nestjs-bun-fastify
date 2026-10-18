import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { PegawaiRepository } from "./pegawai.repository";
import { PrismaService } from "../../common/prisma.service";
import { Pegawai, Prisma } from "@prisma/client";
import { PegawaiCreateDTO, PegawaiResponse } from "./pegawai.model";
import { QueryStandart } from "../../utils/web.model";


@Injectable()
export class PegawaiService {
    private readonly logger = new Logger('PegawaiService');
    constructor(
        private readonly repo: PegawaiRepository,
        private prisma: PrismaService
    ) {}

    private toPegawaiResponse(data: Pegawai): PegawaiResponse {
        return {
            id: data.id,
            nik: data.nik,
            nama: data.nama
        }
    }

    private async getByNik(
        nik: string,
        tx?: Prisma.TransactionClient
    ): Promise<PegawaiResponse | null> {
        this.logger.debug(`get pegawai by nik: ${nik}`);
        const data = await this.repo.findByNik(nik, tx);
        if (!data){
            this.logger.warn(`pegawai with nik: ${nik} is not found`)
            return null
        }

        return this.toPegawaiResponse(data)
    }

    async pegawaiMustExist(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<PegawaiResponse> {
        this.logger.debug(`get pegawai with id: ${id}`)
        const data = await this.repo.findById(id, tx);
        if (!data){
            this.logger.warn(`pegawai with id: ${id} is not found`)
            throw new BadRequestException('Pegawai is does not exists')
        }

        return this.toPegawaiResponse(data)
    }

    async getAll(
        query: QueryStandart
    ): Promise<{
        data: PegawaiResponse[],
        meta: any
    }> {
        this.logger.debug('get list pegawai with query');
        const { page, pageSize, keyword } = query;
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        
        const where: Prisma.PegawaiWhereInput = keyword && keyword.trim() !== '' ? {
            OR: [
                { nama: { contains: keyword, mode: 'insensitive' } },
                { nik: { equals: keyword, mode: 'insensitive' } }
            ]
        } : {};

        const [listData, totalItem] = await Promise.all([
            this.repo.findAll({
                where: where,
                take: take,
                skip: skip
            }),
            this.repo.countAll(where)
        ]);

        if (listData.length === 0) {
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totalPage: 0,
                    currentPage: page
                }
            }
        }
        
        const totalPage = Math.ceil(totalItem/pageSize)
        return {
            data: listData.map((item) => this.toPegawaiResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async createPegawai(
        data: PegawaiCreateDTO
    ): Promise<PegawaiResponse> {
        this.logger.log(`starting create new data pegawai ${data.nama}`)
        try {
            const newPegawai = await this.prisma.$transaction(
                async (tx) => {
                    const checkNik = await this.getByNik(data.nik, tx);
                    if (checkNik){
                        this.logger.warn(`nik ${data.nik} has already exists use by other pegawai`)
                        throw new BadRequestException('Pegawai has already exists')
                    }
                    const result = await this.repo.create({ nama: data.nama, nik: data.nik }, tx);
                    return result;
                }
            )
            this.logger.log(`success create new data pegawai ${newPegawai.nama}`)
            return this.toPegawaiResponse(newPegawai);
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err
            }

            const stackTrace = err instanceof Error ? err.stack : String(err)
            this.logger.error(`unexpected error: ${err.message}`, stackTrace);
            throw new InternalServerErrorException('Terjadi kesalahan di server')
        }
    }

    async updatePegawai(
        id: number,
        data: PegawaiCreateDTO
    ): Promise<PegawaiResponse> {
        this.logger.log(`starting update data pegawai with id: ${id}`)
        try {
            const updatedPegawai = await this.prisma.$transaction(
                async (tx) => {
                    const updatedDataSender: Partial<Pegawai> = {}
                    const currentData = await this.pegawaiMustExist(id, tx);
                    if (data.nik !== currentData.nik) {
                        const checkNik = await this.getByNik(data.nik, tx);
                        if (checkNik){
                            this.logger.warn(`nik ${data.nik} has already used by other pegawai`)
                            throw new BadRequestException('Pegawai has already exists')
                        }

                        updatedDataSender.nik = data.nik
                    }

                    if (data.nama.toLowerCase() !== currentData.nama.toLowerCase()) {
                        updatedDataSender.nama = data.nama
                    }

                    if (Object.keys(updatedDataSender).length === 0) {
                        this.logger.warn(`nothing change in updated data pegawai with id: ${currentData.id}`)
                        throw new BadRequestException('nothing change in upgrade data')
                    }

                    const result = await this.repo.update(currentData.id, updatedDataSender, tx);
                    return result
                }
            )
            this.logger.log(`success update data pegawai with id: ${updatedPegawai.id}`)
            return this.toPegawaiResponse(updatedPegawai);
        } catch (err: any) {
            if (err instanceof HttpException) {
                throw err
            }

            const stackTrace = err instanceof Error ? err.stack : String(err)
            this.logger.error(`Unexpected error ${err.message}`, stackTrace);
            throw new InternalServerErrorException('Terjadi kesalah di server')
        }
    }

    async remove(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<PegawaiResponse> {
        this.logger.log(`starting remove pegawai with id: ${id}`)
        const currentData = await this.pegawaiMustExist(id, tx);
        const remData = await this.repo.remove(currentData.id, tx);
        this.logger.log(`success remove data pegawai with id: ${remData.id}`)
        return this.toPegawaiResponse(remData)
    }
}