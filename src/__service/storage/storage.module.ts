import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Storage } from "./storage.entity";
import { StorageController } from "./storage.controller";
import { StorageService } from "./storage.service";
import { StorageFileManager } from "./storage.filemanager";
import { UserEntity } from "src/user/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ UserEntity, Storage ])
    ],
    controllers: [ StorageController ],
    providers: [ StorageService, StorageFileManager ]
})
export class StorageModule {}