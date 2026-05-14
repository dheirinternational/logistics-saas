import { Pool } from "pg"

declare global{
    var pgPool: Pool | undefined;
}

const connectionString = process.env.NODE_ENV === "production" ? process.env.DATABASE_URL : process.env.TEST_DATABASE_URL

if (!connectionString) {
  throw new Error("Missing DATABASE_URL")
}



export const pool =
    global.pgPool ?? 
    new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        }
    });

global.pgPool = pool
