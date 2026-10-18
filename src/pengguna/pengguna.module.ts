import { Module } from "@nestjs/common";
import { RoleRepository } from "./role/role.repository";
import { RoleService } from "./role/role.service";
import { RoleController } from "./role/role.controller";

@Module({
    providers: [
        // role
        RoleRepository,
        RoleService
    ],
    controllers: [
        RoleController
    ],
    exports: [
        RoleService
    ]
})
export class PenggunaModule {}