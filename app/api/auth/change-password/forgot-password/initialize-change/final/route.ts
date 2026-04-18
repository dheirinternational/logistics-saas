import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";
import crypto from "crypto"
import { hashPassword } from "@/lib/db/password";

export async function POST(req: Request){
    try{

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
            WHERE change_password_token = $1 
        `, [hashedToken])

        console.log(hashedToken)
        const user = rows[0]

        if(!user){
            return NextResponse.json({success: false, message: "Invalid token"}, { status: 400 })
        }

        if (new Date() > user.change_password_expires) {
            return NextResponse.json({ success: false, message: "Token expired" }, { status: 400 })
        }

        const { newPassword } = await req.json() 

        if (!newPassword){
            return NextResponse.json({
                success: false,
                message: "Input Password"
            }, {status: 400})
        }
        


        if(newPassword.length < 8){
            return NextResponse.json({
                success: false,
                message: "Password must be at least 8 characters"
            }, {status: 400})
        }

        const {hash, salt} = await hashPassword(newPassword)

        console.log(hash, `\n${user.password}`)

        if(user.password === hash){
            return NextResponse.json({
                success: false,
                message: "Cannot use the same password"
            })
        }
        
        await pool.query(`
            UPDATE users
            SET
                password = $1,
                salt = $2,
                change_password_token = NULL,
                change_password_expires = NULL
            WHERE id = $3
            RETURNING *
        `, [hash, salt])

        return NextResponse.json({
            success: true,
            message: "Password Successfully Changed."
        })

    } catch (err) {
        console.error("Error sending verification email:", err);
        return NextResponse.json(
        { success: false, message: "Server error" },
        { status: 500 }
        );
    }
    
}