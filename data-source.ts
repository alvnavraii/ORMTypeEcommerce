// data-source.ts
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { User } from './src/entity/User';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5433"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "PwdLota5971!",
    database: process.env.DB_NAME || "ecommerce",
    synchronize: true,
    logging: true,
    entities: [User],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    // Configuración adicional para timezone
    extra: {
        timezone: 'Europe/Madrid',
        connectionTimeoutMillis: 30000,
        query_timeout: 30000,
        statement_timeout: 30000,
    },
});
