import { ConfigModule } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import DatabaseInit from "./init";

const NODEENV: string = process.env.NODE_ENV
ConfigModule.forRoot({
    envFilePath: !NODEENV ? '.env' : `.${NODEENV}.env`
})

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.db_mysql_host,
    port: parseInt(process.env.db_mysql_port),
    username: process.env.db_mysql_username,
    password: process.env.db_mysql_password,
    database: process.env.db_mysql_database,
    synchronize: (NODEENV && NODEENV === 'development') ? true : false,
    bigNumberStrings: true,
    logging: false,
    entities: ['**/*.entity{ .ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}']
}

const optionsForDataSource = { ...dataSourceOptions }
delete optionsForDataSource.synchronize

const dataSource = new DataSource(optionsForDataSource)
dataSource.initialize()
    .then(() => {
        DatabaseInit(dataSource)
    })
    .catch(e => {})

export default dataSource