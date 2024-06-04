import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserGender {
    NOT_DEFINED = -1,
    MALE = 0,
    FEMALE = 1
}

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 32 })
    name: string

    @Column({ length: 144 })
    email: string

    @Column({ length: 255 })
    password: string

    @Column({ default: UserGender.NOT_DEFINED })
    gender: UserGender

    @Column({ default: null, nullable: true })
    photo: string

    @CreateDateColumn()
    createAt: Date
}