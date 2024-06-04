import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GetUserReq } from './getUserReq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { UserEntity } from 'src/user/user.entity';
import ResponseSend, { HttpStatusCodes } from 'common/ResponseSend';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private readonly moduleRef: ModuleRef
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest()
        const response: Response = context.switchToHttp().getResponse()

        const getUserReq = new GetUserReq(this.userRepository, this.moduleRef)
        
        await getUserReq.onModuleInit()
        const userReqData: UserEntity = await getUserReq.canActivate(context) as any

        if((userReqData as any).needToRefresh) {
            ResponseSend.error(response, HttpStatusCodes.UNAUTHORIZED, "Need to refresh token")
            return false
        }
        if(!userReqData.id) {
            ResponseSend.error(response, HttpStatusCodes.UNAUTHORIZED, "Unauthorized Exception")
            return false
        }

        return true;
    }
}