import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/db/password";
import { pool } from "@/lib/db/db";

export async function POST(req: NextRequest){
    try{
        
        const {token, password} = await req.json()
        const tokenRes = await pool.query(`
            SELECT * FROM password_resets
            WHERE token = $1 and expires_at > NOW()
        `, [token])

        if (tokenRes.rowCount === 0){
            return Response.json({
                message: "Invalid or Expired token"
            }, {status: 400})
        } 

        const reset = tokenRes.rows[0]
        const hashed = await hashPassword(password)

        await pool.query(`
            UPDATE users SET password = $1
            WHERE id = $2  
        `, [hashed, reset.user_id])


        await pool.query(`
            DELETE FROM password_resets
            WHERE user_id = $1
        `, [reset.user_id])

        return Response.json({message: "Password updated successfully", success: true})

    }
    catch(err){
        console.error("Internal Server Error",err)
        return NextResponse.json({
            message: "Internal Server Error",
            success: false
        })
    }
}