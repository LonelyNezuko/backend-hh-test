import { Injectable, OnModuleInit, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { UserAuthJWTData, UserEditDTO, UserJWTTokens, UserLoginDTO, UserRegisterDTO } from "./user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity, UserGender } from "./user.entity";
import { Not, Repository } from "typeorm";
import ResponseSend, { HttpStatusCodes } from "common/ResponseSend";
import PaginationDTO from "common/dto/pagination.dto";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { StorageService } from "src/__service/storage/storage.service";
import { ModuleRef } from "@nestjs/core";
import { hostname } from "os";

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

@Injectable()
export class UserService implements OnModuleInit {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private readonly moduleRef: ModuleRef
    ) {}

    private storageService: StorageService
    async onModuleInit() {
        this.storageService = this.moduleRef.get(StorageService, { strict: false })
    }

    // get
    async getProfile(
        response: Response,
        request: Request,

        id: number
    ) {
        const account = await this.userRepository.findOne({
            where: {
                id
            },
            select: [ 'id', 'email', 'createAt', 'gender', 'name', 'photo' ]
        })
        if(!account) {
            return ResponseSend.error(response, HttpStatusCodes.NOT_FOUND, "Account not found")
        }

        ResponseSend.success(response, account)
    }

    async getListProfile(
        response: Response,
        request: Request,

        pagination?: PaginationDTO
    ) {
        if(!pagination) pagination = {} as any

        if(!pagination.take) pagination.take = 10
        if(!pagination.page) pagination.page = 1

        const accounts = await this.userRepository.find({
            select: [ 'id', 'email', 'createAt', 'gender', 'name', 'photo' ],

            take: pagination.take,
            skip: (pagination.page - 1) * pagination.take,

            order: {
                createAt: 'asc'
            }
        })
        if(!accounts.length) {
            return ResponseSend.error(response, HttpStatusCodes.NOT_FOUND, "Accounts not found")
        }

        ResponseSend.success(response, accounts)
    }

    // put
    async editProfile(
        response: Response,
        request: Request,

        data: UserEditDTO
    ) {
        if(!data
            || JSON.stringify(data) === '{}') {
            return ResponseSend.error(response, HttpStatusCodes.BAD_REQUEST, "At least one parameter is required")
        }

        const account = request['user']
        const update: QueryDeepPartialEntity<UserEntity> = {}

        if(data.name) {
            if(data.name === account.name) {
                return ResponseSend.error(response, HttpStatusCodes.CONFLICT, "Such a name has already been assigned")
            }

            const findSimilarAccount = await this.userRepository.count({
                where: {
                    name: data.name,
                    id: Not(account.id)
                }
            })
            if(findSimilarAccount > 0) {
                return ResponseSend.error(response, HttpStatusCodes.CONFLICT, "An account with that name already exists")
            }

            update.name = data.name
        }
        if(data.gender !== undefined) {
            if(data.gender === account.gender) {
                return ResponseSend.error(response, HttpStatusCodes.CONFLICT, "Such a gender has already been assigned")
            }
            if((data.gender as number) !== UserGender.MALE
                && (data.gender as number) !== UserGender.FEMALE) {
                return ResponseSend.error(response, HttpStatusCodes.BAD_REQUEST, "It is impossible to determine the gender")
            }

            update.gender = data.gender
        }
        if(data.email) {
            if(data.email === account.email) {
                return ResponseSend.error(response, HttpStatusCodes.CONFLICT, "Such a email has already been assigned")
            }

            update.email = data.email
        }

        if(JSON.stringify(update) === '{}') {
            return ResponseSend.error(response, HttpStatusCodes.BAD_REQUEST, "At least one parameter is required")
        }

        await this.userRepository.update({ id: account.id }, update)
        ResponseSend.success(response, "Success")
    }

    async editProfilePhoto(
        response: Response,
        request: Request,

        photo: Express.Multer.File
    ) {
        if(!photo) {
            return ResponseSend.error(response, HttpStatusCodes.BAD_REQUEST, "At least one parameter is required")
        }
        if(photo.mimetype !== 'image/png' && photo.mimetype !== 'image/jpeg' && photo.mimetype !== 'image/jpg') {
            return ResponseSend.error(response, HttpStatusCodes.BAD_REQUEST, "It is allowed to upload only img, jpg, jpeg files")
        }
        if(photo.size >= 10 * 1048576) {
            return ResponseSend.error(response, HttpStatusCodes.BAD_REQUEST, "It is allowed to upload files no higher than 10 MB")
        }

        const account = request['user']
        // тут можно еще добавить удаление старой фотографии, но мне лень =)

        const files = await this.storageService.createFile([ photo ], null, request)
        if(!files) {
            return ResponseSend.error(response, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload file")
        }
        const photoLink = request.protocol + '://' + request.headers.host + '/service/storage/' + files[0].key

        await this.userRepository.update({ id: account.id }, {
            photo: photoLink
        })
        ResponseSend.success(response, "Success")
    }

    // post
    async register(
        response: Response,
        request: Request,

        data: UserRegisterDTO
    ) {
        const findSimilarAccount = await this.userRepository.findOne({
            where: {
                name: data.name
            }
        })
        if(findSimilarAccount) {
            return ResponseSend.error(response, HttpStatusCodes.CONFLICT, "An account with the same name and surname already exists")
        }

        const passSalt = await bcrypt.genSalt(12)
        const passHash = await bcrypt.hash(data.password, passSalt)

        const insert = await this.userRepository.insert({
            name: data.name,
            email: data.email,
            password: passHash
        })
        ResponseSend.success(response, insert.raw.insertId)
    }

    async login(
        response: Response,
        request: Request,

        data: UserLoginDTO
    ) {
        const account = await this.userRepository.findOne({
            where: {
                name: data.name
            },
            select: [ 'id', 'password', 'name', 'email' ]
        })

        if(!account) {
            return ResponseSend.error(response, HttpStatusCodes.NOT_FOUND, "Account not found")
        }
        if(!await bcrypt.compare(data.password, account.password)) {
            return ResponseSend.error(response, HttpStatusCodes.NOT_ACCEPTABLE, "Password incorrect")
        }

        const tokens = await this.generateJWTTokens(account.id, account.email, '7d')
        ResponseSend.success(response, tokens)
    }

    // delete




    // functions
    async generateJWTTokens(userID: number, userEmail: string, expiresDate: string | number): Promise<UserJWTTokens> {
        if(!userID || !userEmail || !expiresDate) throw new Error("[User.generateJWTTokens] All arguments were not passed")

        const jwtDataForRefresh: UserAuthJWTData = {
            id: userID,
            email: userEmail,
            expiresDate: expiresDate
        }
        
        const refreshToken = jwt.sign(jwtDataForRefresh, process.env.jwt_privatekey, { algorithm: 'HS256', expiresIn: expiresDate })
        const accessToken = jwt.sign({ id: userID }, process.env.jwt_accessprivatekey, { algorithm: 'HS256', expiresIn: '10m' })

        return { refreshToken, accessToken }
    }
}