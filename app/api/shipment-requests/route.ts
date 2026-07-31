import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const body = await req.json()

        const {customer_code, package_ids, channel, wrapping, payment_time, customer_note, packaging, total_weight, total_weight_unit} = body

        const inferredUnit = channel === "sea" ? "cbm" : "kg"
        const unit = (total_weight_unit ?? inferredUnit) as string
        if (!["kg", "cbm"].includes(unit)) {
            return NextResponse.json({ success: false, message: "Invalid weight unit" }, { status: 400 })
        }

        const {user_id} = session

        const res = await pool.query(`
            INSERT INTO shipment_requests (
                user_id,
                customer_code,
                package_ids,
                channel,
                payment_time,
                customer_note,
                packaging,
                total_weight,
                total_weight_unit
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
            RETURNING *     
        `, [user_id, customer_code, package_ids, channel, payment_time, customer_note, packaging, total_weight ?? null, unit])

        await pool.query(`
            UPDATE packages
                SET status = 'requested_for'
                WHERE id = ANY($1)  
        `, [package_ids])


        const userRes = await pool.query(
            `
            SELECT email
            FROM users
            WHERE id = $1
        `,
            [user_id]
        );

        const userEmail = userRes.rows[0]?.email;


        if (userEmail) {
            try {
                await resend.emails.send({
                    from: "Logistics <no-reply@dheirinternational.com>",
                    to: [userEmail],
                    subject: "🚚 Shipment Request Submitted",
                    html: `
                        <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
                            <div style="max-width:600px;margin:auto;background:white;padding:24px;border-radius:10px;">

                                <h2 style="color:#111827;">
                                    🚚 Shipment Request Submitted
                                </h2>

                                <p>Hello,</p>

                                <p>
                                    Your shipment request has been successfully submitted.
                                </p>

                                <div style="background:#f3f4f6;padding:15px;border-radius:8px;">

                                    <p>
                                        <strong>Customer Code:</strong>
                                        ${customer_code}
                                    </p>

                                    <p>
                                        <strong>Packages Selected:</strong>
                                        ${package_ids.length}
                                    </p>

                                    <p>
                                        <strong>Shipping Channel:</strong>
                                        ${channel}
                                    </p>

                                    <p>
                                        <strong>Payment Time:</strong>
                                        ${payment_time}
                                    </p>

                                    ${
                                        wrapping
                                            ? `
                                            <p>
                                                <strong>Wrapping:</strong>
                                                Yes
                                            </p>
                                        `
                                            : ""
                                    }

                                </div>

                                <p style="margin-top:20px;">
                                    Our team will begin processing your shipment shortly.
                                </p>

                                <p style="color:#6b7280;font-size:13px;margin-top:30px;">
                                    Need help? Contact support anytime.
                                </p>

                                <p style="font-weight:bold;">
                                    - Your Logistics Team 🚚
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
            message: res.rows[0]    
        })
    }
    catch(err){
        console.error("Error Creating Shipment Requests", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}


export async function GET(){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        if(session.role !== "admin"){
            return NextResponse.json({
                success: false,
                messgae: "Forbidden"
            }, {status: 403})
        }

        const res = await pool.query(`
            SELECT * FROM shipment_requests ORDER BY id DESC
        `)

        return NextResponse.json({
            success: true,
            data: res.rows
        })

    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, {status: 500})
    }
}