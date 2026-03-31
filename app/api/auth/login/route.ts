import { NextResponse } from "next/server";
import { pool } from "@/lib/db/db";
import { verifyPassword } from "@/lib/db/password";
import { createSession } from "@/lib/db/session";

export async function POST(request: Request){
    try{
        const body = await request.json()
        
        const email = String(body.email || "").trim().toLowerCase()
        const password = String(body.password || "").trim();

        if(!email || !password) {
            return NextResponse.json({
                error: "Email and password are required"
            }, {status: 400})
        }

        const result = await pool.query(`
            SELECT id, email, password, salt FROM users
            WHERE email = $1
            LIMIT 1
        `, [email])

        const user = result.rows[0]

        if (!user){
            return NextResponse.json({
                error: "Wrong Email"
            }, {status: 401})
        }

        const isPasswordValid = await verifyPassword(password, user.salt, user.password)

        if(!isPasswordValid){
            return NextResponse.json({
                error: "Wrong Password" 
            }, {status: 401})
        }

        await createSession(user.id)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email
            }
        })
    }
    catch(error){
        console.error("LOGIN ERROR", error)

        return NextResponse.json({error: "Something went wrong"}, {status: 500})
    }
}