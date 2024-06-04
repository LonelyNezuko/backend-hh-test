import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import ResponseSend from "common/ResponseSend";
import { UserEditDTO, UserLoginDTO, UserRegisterDTO } from "./user.dto";
import { AuthGuard } from "common/guards/authGuard";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    // get
    @Get('/profile/:id')
    getProfile(
        @Res() response: Response,
        @Req() request: Request,

        @Param('id') id: number
    ) {
        return this.userService.getProfile(response, request, id)
    }

    @Get('/profiles')
    getListProfile(
        @Res() response: Response,
        @Req() request: Request,

        @Query('page') page?: number,
        @Query('take') take?: number
    ) {
        return this.userService.getListProfile(response, request, {
            page,
            take
        })
    }

    // put
    @UseGuards(AuthGuard)
    @Put('/profile')
    editProfile(
        @Res() response: Response,
        @Req() request: Request,

        @Body('data') data: UserEditDTO,
    ) {
        return this.userService.editProfile(response, request, data)
    }

    @UseInterceptors(FileInterceptor('photo'))
    @UseGuards(AuthGuard)
    @Put('/profile/photo')
    editProfilePhoto(
        @Res() response: Response,
        @Req() request: Request,

        @UploadedFile() photo: Express.Multer.File
    ) {
        return this.userService.editProfilePhoto(response, request, photo)
    }

    // post
    @Post('/register')
    register(
        @Res() response: Response,
        @Req() request: Request,

        @Body('data') data: UserRegisterDTO
    ) {
        return this.userService.register(response, request, data)
    }

    @Post('/login')
    login(
        @Res() response: Response,
        @Req() request: Request,

        @Body('data') data: UserLoginDTO
    ) {
        return this.userService.login(response, request, data)
    }

    // delete
}