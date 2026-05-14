import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request){
    try{
        const session = await getSession()
        
        if (!session) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const body = await request.json()

        console.log(body)

        if(body.declared_quantity < 1){
            return NextResponse.json({
                error: "Item Quantity cannot be less than 1"
            }, {status: 400})
        }

        const userRes = await pool.query(
            `
            SELECT email FROM users
            WHERE id = $1
        `,
            [session.user_id]
        );

        const userEmail = userRes.rows[0]?.email

        const weight = body.declared_item_weight === 0 ? null : body.declared_item_weight
        const customer_note = body?.customer_note?.trim() || null

        const codeRes = await pool.query(`
            SELECT code FROM customers
            WHERE user_id = $1  
        `, [session.user_id])

        const customer_code = codeRes.rows[0].code


        const res = await pool.query(`
            INSERT INTO incoming_packages(user_id, customer_code, incoming_tracking_number, warehouse_id, status, declared_item_name, declared_item_quantity, declared_item_weight, created_at, customer_note)    
            VALUES ($1, $2, $3, $4, 'expected', $5, $6, $7, NOW(), $8)
            RETURNING *
        `, [session.user_id, customer_code, body.incoming_tracking_number, body.warehouse_id, body.declared_item_name, body.declared_item_quantity, weight, customer_note])

        const result = res.rows[0]

        if (userEmail) {
            try {
                await resend.emails.send({
                    from: "Logistics <no-reply@dheirinternational.com>",
                    to: [userEmail],
                    subject: "📦 Incoming Package Registered",
                    html: `
                        <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
                            <div style="max-width:600px;margin:auto;background:white;padding:24px;border-radius:10px;">

                                <h2 style="color:#111827;">
                                    📦 Incoming Package Registered
                                </h2>

                                <p>Hello,</p>

                                <p>
                                    Your incoming package has been successfully registered in our system.
                                </p>

                                <div style="background:#f3f4f6;padding:15px;border-radius:8px;">

                                    <p>
                                        <strong>Item Name:</strong>
                                        ${result.declared_item_name}
                                    </p>

                                    <p>
                                        <strong>Tracking Number:</strong>
                                        ${result.incoming_tracking_number}
                                    </p>

                                    <p>
                                        <strong>Quantity:</strong>
                                        ${result.declared_item_quantity}
                                    </p>

                                    ${
                                        result.declared_item_weight
                                            ? `
                                            <p>
                                                <strong>Weight:</strong>
                                                ${result.declared_item_weight}kg
                                            </p>
                                        `
                                            : ""
                                    }

                                    <p>
                                        <strong>Status:</strong>
                                        Expected
                                    </p>

                                </div>

                                <p style="margin-top:20px;">
                                    We’ll notify you once the package arrives at the warehouse.
                                </p>

                                <p style="color:#6b7280;font-size:13px;margin-top:30px;">
                                    Need help? Contact support anytime.
                                </p>

                                <p style="font-weight:bold;">
                                    — Your Logistics Team 🚚
                                </p>

                            </div>
                        </div>
                    `,
                });
            } catch (emailErr) {
                console.error("EMAIL ERROR", emailErr);
            }
        }




        return NextResponse.json({
            success: true,
            data: result
        }, {status: 200})
    }
    catch(err: any){

        if(err.code === '23505'){
            console.error("Shipment Id already exists", err)
            return NextResponse.json({
                success: false,
                message: "Shipment Id already exists",
            }, { status: 400 })
        }

        console.error("Internal server error", err)
        return NextResponse.json({
            sucess: false,
            message: "Internal server error"
        }, {status: 500})
    }
}




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
            SELECT * FROM incoming_packages   
        `)

        return NextResponse.json({
            success: true,
            data: res.rows
        })
    }
    catch(err){
        console.error("Error getting Incoming Packages", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
} 