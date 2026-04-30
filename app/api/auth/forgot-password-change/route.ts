import { pool } from "@/lib/db/db"
import { hashPassword } from "@/lib/db/password"
import { NextResponse } from "next/server"



export async function POST(req){
    try{
        const { searchParams } = new URL(req.url)

        const email = searchParams.get("email")
        const token = searchParams.get("token")

        if (!token || !email){
            return NextResponse.json({
                success: false,
                message: "Unauthorized",
            }, {status: 401})
        }

        const decodedEmail = email ? decodeURIComponent(email) : null

        const tokenObject = await pool.query(`
            SELECT * FROM password_reset_tokens
            WHERE email = $1
        `, [decodedEmail])

        if (tokenObject.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        const { token: storedToken, expires_at } = tokenObject.rows[0]

        if (token !== storedToken){
            return NextResponse.json({
                success: false,
                message: "Invalid Token"
            })
        }

        if (new Date() > new Date(expires_at)){

            await pool.query(`
                DELETE FROM password_reset_tokens
                WHERE email = $1
            `, [decodedEmail])

            return NextResponse.json({
                success: false,
                message: "Expired Token"
            })
        }

        const { password } = await req.json()
        const editedPassword = String(password || "").trim()

        if (!editedPassword){
            return NextResponse.json({
                success: false,
                message: "Input Password"
            })
        }

        if (editedPassword.length < 7){
            return NextResponse.json({
                success: false,
                message: "Password Cannot be less than 7 characters"
            })
        }

        const { hash, salt } = await hashPassword(editedPassword)

        await pool.query(`
            UPDATE users
            SET
                password = $1,
                salt = $2
            WHERE email = $3
        `, [hash, salt, decodedEmail])

        await pool.query(`
            DELETE FROM password_reset_tokens
            WHERE email = $1
        `, [decodedEmail])


        return NextResponse.json({
            success: true,
            message: "Password successfully changed"
        }) 


    }
    catch(err){
        console.error("Internal Server Error, Cannot Change Password", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server error, Cannot change password"
        })
    }

}