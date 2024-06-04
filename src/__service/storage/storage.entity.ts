import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StorageFileImageDto, StorageFilesAccess, StorageFilesExtendedType, StorageFilesTypes } from "./storage.files.dto";
import { UserEntity } from "src/user/user.entity";

@Entity('---service-storage')
export class Storage {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 64 })
    key: string

    @Column({ length: 64 })
    albumKey: string

    @Column({ default: null, nullable: true })
    albumName: string

    @CreateDateColumn()
    albumCreateAt: Date
    
    @Column()
    type: StorageFilesTypes

    @Column('text')
    path: string

    @Column()
    albumLength: number

    @ManyToOne(() => UserEntity, {
        createForeignKeyConstraints: false
    })
    @JoinColumn()
    owner: UserEntity

    @Column('simple-json')
    images: StorageFileImageDto[]
}