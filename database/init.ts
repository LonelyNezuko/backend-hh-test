import { DataSource, IsNull, Not } from "typeorm";

export default async function DatabaseInit(dataSource: DataSource) {
    console.log('[database] Init Successfully')
}