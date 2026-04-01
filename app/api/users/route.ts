import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";
import { PUT } from "./my-data/route";


export async function GET(){
    try{
        const session = await getSession()
        
        if (!session) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        if(session.role !== "admin"){
            return NextResponse.json({
                success: false,
                message: "Forbidden"
            }, {status: 403})
        }

        const res = await pool.query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.created_at, c.code 
            FROM users u
            JOIN customers c ON u.id = c.user_id     
        `)
        
        return NextResponse.json({
            success: true,
            data: res.rows
        })
    }
    catch(err){
        console.error("Error fetching User Data", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        })
    }
}


// export async function PUT(request: Request){
//     try{
//         const session = await getSession()

//          if (!session) {
//             return NextResponse.json({
//                 success: false,
//                 message: "Unauthorized"
//             }, {status: 401})
//         }

//         if(session.role !== "admin"){
//             return NextResponse.json({
//                 success: false,
//                 message: "Forbidden"
//             }, {status: 403})
//         }

//         const res = await pool.query(`
            
//         `)

//     }
// }