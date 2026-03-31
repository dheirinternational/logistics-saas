import { NextResponse } from "next/server";
import { pool } from "@/lib/db/db";
import { hashPassword } from "@/lib/db/password";
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

        if(password.length < 8) {
            return NextResponse.json({
                error: "Password must be at least 8 characters long"
            }, {status: 400})
        }

        const existingUser = await pool.query(`
            SELECT id FROM users 
            WHERE email = $1 
            LIMIT 1 
        `, [email])

        if (existingUser.rowCount && existingUser.rowCount > 0){
            return NextResponse.json({
                error: "Email Already Exists"
            }, {status: 409})
        }

        const {hash, salt} = await hashPassword(password)

        const result = await pool.query(`
            INSERT INTO users (email, password, salt, first_name, last_name, phone, created_at, role)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
            RETURNING id, email
        `, [email, hash, salt, body.first_name, body.last_name, body.phone, body.role])

        const user = result.rows[0]

        if (body.role === "customer"){
            await pool.query(`
            INSERT INTO customers (user_id, code)
            VALUES ($1, $2)
            `, [user.id, `KRC${String(user.id).padStart(4, "0")}`])
        }

        await createSession(user.id, body.role)

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email,
            }
        }, {status: 201})
    }
    catch(error){
        console.error("REGISTRATION_ERROR", error)
        return NextResponse.json({
            error: "Something went wrong",
        }, {status: 500})
    }
}