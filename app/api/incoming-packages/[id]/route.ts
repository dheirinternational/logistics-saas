// export async function PUT(request: Request){
//     {

import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";

//     }
// }


export async function GET(){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            })
        }

 
        const res = await pool.query(`
            SELECT * FROM incoming_packages
            WHERE user_id = $1    
        `, [session.user_id])

        console.log(res.rows)

        return NextResponse.json({
            success: true,
            data: res.rows
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