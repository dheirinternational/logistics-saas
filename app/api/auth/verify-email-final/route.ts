import crypto from "crypto"
import { pool } from "@/lib/db/db"
import { NextResponse } from "next/server"

export async function GET(req: Request){
    try{
        const { searchParams } = new URL(req.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ success: false, message: "No token" }, { status: 400 })
        }

        // 1. Hash incoming token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")


        // 2. Find user 

        const { rows } = await pool.query(`
            SELECT * FROM users
            WHERE email_verification_token = $1 
        `, [hashedToken])

        
        const user = rows[0]
        console.log(rows)

        if(!user){
            return NextResponse.json({success: false, message: "Invalid token"}, { status: 400 })
        }

        // 3. Check expiry
        if (new Date() > user.email_verification_expires) {
            return NextResponse.json({ success: false, message: "Token expired" }, { status: 400 })
        }

        // 4. Mark verified
        await pool.query(`
            UPDATE users
            SET email_verified = true,
                email_verification_token = NULL,
                email_verification_expires = NULL
            WHERE id = $1
        `, [user.id])

        return NextResponse.json({
            success: true,
            message: "Email verified successfully"
        })

    }
    catch (err) {
        console.error(err)
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
    }
}