import { Module } from "@nestjs/common";
import { RoleRepository } from "./role/role.repository";
import { RoleService } from "./role/role.service";
import { RoleController } from "./role/role.controller";
import { PegawaiRepository } from "./pegawai/pegawai.repository";
import { PegawaiService } from "./pegawai/pegawai.service";
import { PegawaiController } from "./pegawai/pegawai.controller";

@Module({
    providers: [
        // role
        RoleRepository,
        RoleService,

        // pegawai
        PegawaiRepository,
        PegawaiService
    ],
    controllers: [
        RoleController,
        PegawaiController
    ],
    exports: [
        RoleService,
        PegawaiService
    ]
})
export class PenggunaModule {}