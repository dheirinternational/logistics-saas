// export async function PUT(request: Request){
//     {

import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";

//     }
// }


export async function GET(req: NextRequest, {params} : {params: Promise<{id: string}>}){
    try{
        const session = await getSession()
        const {id} = await params
        
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        // Quering using params 

        const resp = await pool.query(`
            SELECT * FROM incoming_packages
            WHERE id = $1
        `, [Number(id)])

        return NextResponse.json({
            success: true,
            data: resp.rows
        })

    }
    catch(err){
        console.error("Error Fetching Customer related incoming Shipments", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        })
    }
}