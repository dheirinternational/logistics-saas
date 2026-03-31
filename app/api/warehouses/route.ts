import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                error: "Unauthorized"
            }, {status: 401})
        }

        const res = await pool.query(`
            SELECT * FROM warehouses        
        `)

        return NextResponse.json({
            success: true,
            data: res.rows
        }, {status: 200})

    }
    catch(err){
        console.error("ERROR_GETTING_WAREHOUSE_DATA", err)
        return NextResponse.json({
            error: "Something went wrong"
        }, {status: 500})
    }
    
}