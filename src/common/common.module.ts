import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import { APP_FILTER } from "@nestjs/core";
import { ErrorFilter } from "../utils/error.filter";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
    ],
    providers: [
        PrismaService,
        {
            provide: APP_FILTER,
            useClass: ErrorFilter
        },
    ],
    exports: [
        PrismaService
    ]
})
export class CommonModule {}