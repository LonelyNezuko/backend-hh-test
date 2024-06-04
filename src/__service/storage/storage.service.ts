import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Storage } from "./storage.entity";
import { FindOptionsWhere, In, Not, Repository } from "typeorm";
import { ModuleRef } from "@nestjs/core";
import { Request, Response } from "express";
import { StorageFileData, StorageFileImageDto, StorageFilesAccess, StorageFilesDto, StorageFilesExtendedType } from "./storage.files.dto";
import { StorageFileManager } from "./storage.filemanager";
import { UserService } from "src/user/user.service";
import { UserEntity } from "src/user/user.entity";
import ResponseSend from "common/ResponseSend";

@Injectable()
export class StorageService {
    constructor(
        @InjectRepository(Storage)
        private readonly storageRepository: Repository<Storage>,
        
        private readonly storageFileManager: StorageFileManager,
    ) {}


    async getFile(
        res: Response,
        req: Request,

        key: string,
        size?: any
    ) {
        if(!key) {
            return ResponseSend.error(res, 400, 'Fields should not be empty (key)')
        }
        if(key.length !== 64) {
            return ResponseSend.error(res, 400, 'Incorrect data [key]')
        }

        if(size) {
            size = parseInt(size)
            if(isNaN(size)) {
                return ResponseSend.error(res, 400, 'Incorrect data [key]')
            }
        }

        const fileBase: Storage = await this.storageRepository.findOne({
            where: {
                key
            },
            relations: {
                owner: true
            }
        })
        if(!fileBase) {
            return ResponseSend.error(res, 404, 'File with key not found')
        }

        const rootPath = __dirname + '../../../../../'
        if(size && fileBase.type !== 'image') {
            return ResponseSend.error(res, 400, 'The file is not an image')
        }

        let path = ''
        let imageType = ''

        if(fileBase.type === 'image') {
            if(!fileBase.images.length) {
                return ResponseSend.error(res, 404, 'The image was not found')
            }

            path = fileBase.path + fileBase.images[0].name
            imageType = fileBase.images[0].type

            fileBase.images.map((image: StorageFileImageDto) => {
                if(image.width === size) {
                    path = fileBase.path + image.name
                    imageType = image.type
                }
            })
        }
        else path = fileBase.path

        if(!path.length
            || !imageType.length) {
            return ResponseSend.error(res, 400, 'The file path was not found')
        }

        res.sendFile(path, { root: rootPath })
    }

    async getFileData(
        key: string,

        res?: Response,
        req?: Request,

        onlyImage?: boolean
    ): Promise<StorageFileData> {
        if(!key) {
            ResponseSend.error(res, 400, 'Fields should not be empty (key)')
            return
        }
        if(key.length !== 64) {
            ResponseSend.error(res, 400, 'Incorrect data [key]')
            return
        }

        const fileBase: Storage = await this.storageRepository.findOne({
            where: {
                key
            },
            relations: {
                owner: true
            }
        })

        if(!fileBase) {
            ResponseSend.error(res, 404, 'File with key not found')
            return
        }
        if(onlyImage
            && fileBase.type !== 'image') {
                ResponseSend.error(res, 404, 'This is not image')
            return
        }

        delete fileBase.images
        delete fileBase.path
        delete fileBase.type

        fileBase.albumLength = await this.storageRepository.count({
            where: {
                albumKey: fileBase.albumKey
            }
        })

        const albumFiles = await this.storageRepository.find({
            where: {
                albumKey: fileBase.albumKey
            },
            relations: {
                owner: true
            }
        })

        albumFiles.map(file => {
            delete file.images
            delete file.path
            delete file.type

            file.albumLength = fileBase.albumLength
        })

        ResponseSend.success(res, { ...fileBase, albumFiles })
        return { ...fileBase, albumFiles }
    }

    async createFile(
        files: Array<Express.Multer.File>,

        res?: Response,
        req?: Request,

        otherParams?: {
            albumKey?: string
        }
    ): Promise<StorageFilesDto[]> {
        if(!files) {
            ResponseSend.error(res, 400, "Fields should not be empty (files)")
            return
        }

        if(!res && !req) {
            throw new Error("[Service.Storage.createFile] The 'request' was not passed from the 'user'")
        }

        let filesList: Array<StorageFilesDto>
        try {
            filesList = await this.storageFileManager.upload(files)
        }
        catch(e) {
            console.error(e)

            ResponseSend.error(res, 500, "Failed to upload files")
            return
        }

        if(!filesList || !filesList.length) {
            ResponseSend.error(res, 500, "Failed to upload files")
            return
        }

        const repository = this.storageRepository
        const output: StorageFilesDto[] = []

        async function load(file: StorageFilesDto) {
            await repository.insert({
                key: file.key,
                albumKey: otherParams && otherParams.albumKey ? otherParams.albumKey : file.albumKey,
                type: file.type,
                path: file.path,
                albumLength: files.length,
                owner: req['user'],
                images: file.images
            })

            let data: StorageFilesDto = {
                type: file.type,
                albumLength: files.length,
                albumKey: file.albumKey,
                key: file.key
            }

            if(file.type === 'image') {
                data.images = []
                file.images.map((image: StorageFileImageDto) => {
                    data.images.push({
                        width: image.width
                    })
                })
            }

            output.push(data)
        }
        await Promise.all(filesList.map(load))

        ResponseSend.success(res, output)
        return output
    }
}