import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";
import crypto from "crypto"

export async function POST(req: Request){
    try{

        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            })
        }

        const { searchParams } = new URL(req.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ success: false, message: "No token" }, { status: 400 })
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")

        const { rows } = await pool.query(`
            SELECT * FROM users
            WHERE change_email_token = $1 
        `, [hashedToken])

        console.log(hashedToken)
        
        

        console.log(rows)
        const user = rows[0]
        console.log(user)

        if(!user){
            return NextResponse.json({success: false, message: "Invalid token"}, { status: 400 })
        }

        if (new Date() > user.change_email_expires) {
            return NextResponse.json({ success: false, message: "Token expired" }, { status: 400 })
        }


        const { newEmail } = await req.json() 

        await pool.query(`
            UPDATE users
            SET
                email = $1,
                email_verified = FALSE,
                change_email_token = NULL,
                change_email_expires = NULL
            WHERE id = $2
            RETURNING * 
        `, [newEmail, session.user_id])

        return NextResponse.json({
            success: true,
            message: "Email Successfully Changed. Please verify Email in profile"
        })

    } catch (err) {
        console.error("Error sending verification email:", err);
        return NextResponse.json(
        { success: false, message: "Server error" },
        { status: 500 }
        );
    }
    
}