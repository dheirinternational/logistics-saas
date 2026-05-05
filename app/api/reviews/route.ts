import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const { review } = await req.json()

        const nameRes = await pool.query(`
            SELECT first_name, last_name FROM users
            WHERE id = $1
        `, [session.user_id])

        const {first_name, last_name} = nameRes.rows[0]
    
        await pool.query(`
            INSERT INTO reviews (review, name, user_id)
            VALUES ($1, $2, $3)
        `, [review, `${first_name} ${last_name}`, session.user_id])

        return NextResponse.json({
            success: true,
            message: "Review Successfully Uploaded"
        })

    }   
    catch(err){
        console.error("Internal Service Error, could not post review", err)
        return NextResponse.json({
            success: false,
            message: "Internal Service Error, could not post review"
        })
    }
}