import { Controller, Get, Param, Req, Res, Post, UseGuards, Body, HttpStatus, Query } from "@nestjs/common";
import { Delete, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common/decorators";
import { ParseFilePipe, ParseFilePipeBuilder } from "@nestjs/common/pipes";
import { StorageService } from "./storage.service";
import { Request, Response } from "express";
import { AuthGuard } from "common/guards/authGuard";
import { FilesInterceptor } from "@nestjs/platform-express";
import { MulterModule } from "@nestjs/platform-express/multer";
import { StorageFileManager } from "./storage.filemanager";
import { StorageFilesAccess, StorageFilesDto, StorageFilesExtendedType } from "./storage.files.dto";

@Controller('service/storage')
export class StorageController {
    constructor(
        private readonly storageService: StorageService,
        private readonly storageFileManager: StorageFileManager
    ) {}

    // get
    @Get(':key')
    getStorage(
        @Param('key') key: string,

        @Res() res: Response,
        @Req() req: Request,

        @Query('size') size?: any,
    ) {
        return this.storageService.getFile(res, req, key, size)
    }
}