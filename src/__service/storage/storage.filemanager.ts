import { Injectable, PipeTransform  } from "@nestjs/common";
import { StorageFileImageDto, StorageFilesDto } from "./storage.files.dto";
const sharp = require('sharp')
const fs = require('fs')
import random from "common/functions/random";

@Injectable()
export class StorageFileManager implements PipeTransform<Express.Multer.File, Promise<any>> {
    constructor() {}

    async upload(files: Array<Express.Multer.File>): Promise<Array<StorageFilesDto>> {
        if(!files.length)return
        if(files.length > 10)return

        let error: boolean = false
        files.map((file: Express.Multer.File) => {
            if([ 'image/gif', 'image/jpeg', 'image/png', 'image/webp' ].indexOf(file.mimetype) === -1)return error = true
            if(file.size >= 31457280)return error = true
        })
        if(error)return

        const outputFiles: Array<StorageFilesDto> = []
        const transform = this.transform

        const albumKey = random.textNumber(64) // генерация ключа альбома
        fs.mkdirSync('storage/files/' + albumKey) // создание папки альбома

        async function load(file: Express.Multer.File) {
            if(file.mimetype.indexOf('image/') !== -1) {
                const key = random.textNumber(64) // генерация ключа файла

                let imagesTrasformed: Array<TransformOutput> = await transform(file) // трансформируем изображение до нужных размеров
                imagesTrasformed = imagesTrasformed.sort((a: any, b: any) => b.width - a.width) // сортируем по размерам

                const path = 'storage/files/' + albumKey + '/' + key + '/' // генерируем путь до файла
                const storageImages: Array<StorageFileImageDto> = []

                imagesTrasformed.map((item: TransformOutput) => {
                    storageImages.push({
                        width: item.width,
                        name: item.width + '.' + item.type,
                        type: item.type,
                        buffer: item.buffer
                    })
                })

                fs.mkdirSync(path) // создание файла
                storageImages.map((item: StorageFileImageDto) => {
                    fs.writeFileSync(path + item.name, item.buffer)
                    delete item.buffer
                }) // создание изображений

                outputFiles.push({
                    key,
                    albumKey,
                    type: 'image',
                    path,
                    images: storageImages
                })
            }
        }

        await Promise.all(files.map(load))
        return outputFiles
    }

    async delete(albumKey: string, fileKey?: string) {
        if(!albumKey) throw new Error("[Service.Storage.FileManager.Delete] The 'albumKey' must be passed")
        if(albumKey.length !== 64) throw new Error("[Service.Storage.FileManager.Delete] Invalid 'albumKey' was passed")
        if(fileKey && fileKey.length !== 64) throw new Error("[Service.Storage.FileManager.Delete] Invalid 'fileKey' was passed")

        let path = 'storage/files/' + albumKey
        if(fileKey) path += '/' + fileKey
        
        function del(resolve, reject) {
            fs.rm(path, { recursive: true }, (err) => {
                if(err) reject(err)
                else resolve("")
            })
        }

        new Promise(del)
            .catch(err => {
                
            })
    }


    async transform(image: Express.Multer.File): Promise<Array<TransformOutput>> {
        const list: Array<TransformOutput> = []
        const type = image.mimetype.replace('image/', '')

        await Promise.all([ 1920, 1600, 1366, 1024, 720, 360, 180, 90, 45 ].map(async function(width: number) {
            const buffer: Buffer = await sharp(image.buffer)
                .resize(width, null, {
                    fit: 'cover'
                })
                .toBuffer()
            list.push({
                buffer,
                width,
                type
            })
        }))
        return list
    }
}


interface TransformOutput {
    buffer: Buffer,
    width: number,
    type: string
}