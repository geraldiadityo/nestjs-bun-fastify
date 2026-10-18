import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { PegawaiService } from "./pegawai.service";
import { PegawaiCreateDTO, PegawaiResponse } from "./pegawai.model";
import { ApiResponse, QueryStandart } from "../../utils/web.model";

@Controller('/api/pengguna/pegawai')
export class PegawaiController {
    constructor(
        private service: PegawaiService
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() request: PegawaiCreateDTO
    ): Promise<ApiResponse<PegawaiResponse>> {
        const result = await this.service.createPegawai(request);

        return {
            data: result,
            message: `success create pegawai ${result.nama}`
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async getAll(
        @Query() query: QueryStandart
    ): Promise<ApiResponse<PegawaiResponse[]>> {
        const { data, meta } = await this.service.getAll(query);

        return {
            data: data,
            message: 'success',
            totalItem: meta.totalItem,
            totalPage: meta.totalPage,
            currentPage: meta.currentPage
        }
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<PegawaiResponse>> {
        const result = await this.service.pegawaiMustExist(id);

        return {
            data: result,
            message: 'success'
        }
    }

    @Put('/:id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: PegawaiCreateDTO
    ): Promise<ApiResponse<PegawaiResponse>> {
        const result = await this.service.updatePegawai(id, request);

        return {
            data: result,
            message: 'Success updated data pegawai'
        }
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.OK)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.remove(id);

        return {
            data: true,
            message: `Succes remove data pegawai ${result.nama}`
        }
    }
}