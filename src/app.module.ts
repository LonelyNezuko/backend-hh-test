import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'database/connect';
import { StorageModule } from './__service/storage/storage.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.' + process.env.NODE_ENV + '.env'
        }),

        TypeOrmModule.forRoot(dataSourceOptions),

        UserModule,
        StorageModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
