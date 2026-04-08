import { Pool } from "pg"

declare global{
    var pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL

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

if(process.env.NODE_ENV !== "production") {
    global.pgPool = pool
}