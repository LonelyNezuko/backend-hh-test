import { IsEmail, IsNotEmpty, IsNumber, IsOptional, Length } from "class-validator";
import { UserGender } from "./user.entity";

export class UserRegisterDTO {
    @IsNotEmpty()
    @Length(4, 32)
    name: string

    @IsEmail()
    email: string

    @IsNotEmpty()
    @Length(6, 64)
    password: string
}

export class UserLoginDTO {
    @IsNotEmpty()
    @Length(6, 64)
    password: string

    @IsNotEmpty()
    @Length(4, 32)
    name: string
}

export class UserEditDTO {
    @IsOptional()
    @Length(4, 32)
    name: string

    @IsOptional()
    @IsEmail()
    email: string

    @IsOptional()
    @IsNumber()
    gender: UserGender
}



export interface UserAuthJWTData {
    id: number,
    email: string,
    expiresDate: string | number
}
export interface UserJWTTokens {
    refreshToken: string,
    accessToken: string
}