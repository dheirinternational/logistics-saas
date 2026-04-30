import { NextResponse } from "next/server";
import { pool } from "@/lib/db/db";
import { hashPassword } from "@/lib/db/password";
import { createSession } from "@/lib/db/session";

const PASSWORD_LENGTH = 7

export async function POST(request: Request){
    try{
        const body = await request.json()

        const email = String(body.email || "").trim().toLowerCase()
        const password = String(body.password || "").trim();
        const isEmailVerified = body.email_verified === "true" ? true : false

        if(!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Email and password are required"
            }, {status: 400})
        }

        if(password.length < PASSWORD_LENGTH) {
            return NextResponse.json({
                success: false,
                message: `Password must be at least ${PASSWORD_LENGTH} characters long`
            }, {status: 400})
        }

        console.log(isEmailVerified)
        
        if (!isEmailVerified){
            return NextResponse.json({
                success: false,
                message: `Verify Email`                
            }, {status: 400})
        }

        const existingUser = await pool.query(`
            SELECT id FROM users 
            WHERE email = $1 
            LIMIT 1 
        `, [email])

        if (existingUser.rowCount && existingUser.rowCount > 0){
            return NextResponse.json({
                success: false,
                message: "Email Already Exists"
            }, {status: 409})
        }

        const {hash, salt} = await hashPassword(password)

        const result = await pool.query(`
            INSERT INTO users (email, password, salt, first_name, last_name, phone, created_at, role, email_verified)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, TRUE)
            RETURNING id, email
        `, [email, hash, salt, body.first_name, body.last_name, body.phone, body.role])

        const user = result.rows[0]

        if (body.role === "customer"){
            await pool.query(`
            INSERT INTO customers (user_id, code)
            VALUES ($1, $2)
            `, [user.id, `${body.first_name}-DHI${String(user.id).padStart(4, "0")}`])
        }

        await createSession(user.id, body.role)

        return NextResponse.json({
            success: true,
            message: "Successfully Created Account",
            data: {
                user : {
                    id: user.id,
                    email,
                }
            }
        }, {status: 201})


        return NextResponse.json({
            success: true,
            message: "Worked",
            data: ""
        })

    }
    catch(error){
        console.error("Internal Server Error, Could Not Create User Account", error)
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, {status: 500})
    }
}