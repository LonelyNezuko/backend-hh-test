import { CanActivate, ExecutionContext, Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, Repository } from "typeorm";
import { Request, Response } from 'express';
import { UserService } from "src/user/user.service";
import { ModuleRef } from "@nestjs/core";

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

import { UserEntity } from "src/user/user.entity";
import { UserAuthJWTData } from "src/user/user.dto";

@Injectable()
export class GetUserReq implements CanActivate, OnModuleInit {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private readonly moduleRef: ModuleRef
    ) {}

    private userService: UserService
    async onModuleInit() {
        this.userService = await this.moduleRef.get(UserService, { strict: false })
    }

    async canActivate(context: ExecutionContext): Promise<any> {
        const response: Response = context.switchToHttp().getResponse()
        const request: Request = context.switchToHttp().getRequest()

        let headers = request.headers

        const _this = this
        async function getUserData(id?: number, user?: UserEntity) {
            if(!user) {
                user = await _this.userRepository.findOne({
                    where: {
                        id: id
                    }
                })

                delete user.password
            }

            if(user) request['user'] = user
        }

        const token = headers.authorization
        if(token && token.indexOf('Bearer ') === 0) {
            try {
                const data: UserAuthJWTData = jwt.verify(token.replace('Bearer ', ''), process.env.jwt_accessprivatekey) as any
                if(data && data.id) {
                    const account = await this.userRepository.findOne({
                        where: {
                            id: data.id
                        }
                    })
                    if(!account)return { needToRefresh: true } as any

                    delete account.password
                    await getUserData(null, account)
                }
                else return { needToRefresh: true } as any
            }
            catch(e) {
                return { needToRefresh: true } as any
            }
        }

        if(token && token.indexOf('Refresh ') === 0) {
            try {
                const data: UserAuthJWTData = jwt.verify(token.replace('Refresh ', ''), process.env.jwt_privatekey) as any
                if(data
                    && data.id) {
                    const account = await this.userRepository.findOne({
                        where: {
                            id: data.id
                        }
                    })
                    if(account) {
                        delete account.password

                        try {
                            const newTokens = await this.userService.generateJWTTokens(account.id, account.email, '7d')

                            response.header('jwt-new-tokens-refresh', newTokens.refreshToken)
                            response.header('jwt-new-tokens-access', newTokens.accessToken)

                            await getUserData(null, account)
                        }
                        catch(e) {
                            console.error(e)
                        }
                    }
                }
            }
            catch(e) {}
        }

        return request['user'] || {}
    }
}