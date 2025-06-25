import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";

import { envFilePath } from "./src/config-dynamic-module";
import { configValidationUtility } from "./src/setup/config-validation.utility";

config({
  path: envFilePath,
});

const migrationOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_URL,
  port:
    configValidationUtility.convertToNumber(process.env.POSTGRES_PORT!) ||
    undefined,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  synchronize: false,
  ssl: true,
  migrations: ["migrations/*.ts"],
  entities: ["src/**/*.entity.typeorm.ts"],
};

export default new DataSource(migrationOptions);
