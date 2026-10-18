import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { RoleService } from "./role.service";
import { RoleCreateDTO, RoleResponse } from "./role.model";
import { ApiResponse } from "../../utils/web.model";

@Controller('/api/pengguna/role')
export class RoleController {
    constructor(
        private service: RoleService
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() request: RoleCreateDTO
    ): Promise<ApiResponse<RoleResponse>> {
        const result = await this.service.createRole(request);

        return {
            data: result,
            message: `Success add role ${result.nama}`
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(): Promise<ApiResponse<RoleResponse[]>> {
        const result = await this.service.getAll();

        return {
            data: result,
            message: 'success'
        }
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    async getById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<RoleResponse>> {
        const result = await this.service.roleMustExist(id);

        return {
            data: result,
            message: 'success'
        }
    }

    @Put('/:id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() request: RoleCreateDTO
    ): Promise<ApiResponse<RoleResponse>> {
        const result = await this.service.updateRole(id, request);

        return {
            data: result,
            message: 'success update data role'
        }
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.OK)
    async remove(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.removeRole(id);

        return {
            data: true,
            message: `success remove data role ${result.nama}`
        }
    }
}