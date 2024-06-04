import { IsNumber } from "class-validator";

export default class PaginationDTO {
    @IsNumber()
    page: number

    @IsNumber()
    take: number
}