import path from "path";
import dotenv from "dotenv";

let ENV_FILENAME = ".env";

export interface Config {
    database: {
        name: string,
        username: string,
        password: string
    },
    nodeEnv: string,
}

function loadConfig(): Config {
    if (process.env.NODE_ENV == "production") ENV_FILENAME = "prod.env";
    else if(process.env.NODE_ENV == "development") ENV_FILENAME = "dev.env";
    else if(process.env.NODE_ENV == "test") ENV_FILENAME = "test.env";
    
    dotenv.config({ path: path.resolve(process.cwd(), ENV_FILENAME) });
    
    return {
        database: {
            name: process.env.DATABASE_NAME,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD
        },
        nodeEnv: process.env.NODE_ENV
    }
}

export const CFG = loadConfig();