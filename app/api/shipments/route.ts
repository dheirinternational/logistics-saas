import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { generateTrackingNumber } from "@/lib/generators/generateTrackingNumber";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        if (session.role !== "admin") {
            return NextResponse.json({
                success: false,
                message: "Forbidden"
            }, { status: 403 });
        }

        const body = await req.json();

        const {
            customer_code,
            origin_warehouse_id,
            destination_warehouse_id,
            channel,
            shipment_request_id,
            shipment_note,
            user_id,
            payment_time,
            package_ids,
            total_weight,
            price
        } = body;

        const totalPrice = price;
        const tracking_number = generateTrackingNumber();

        // 🔐 Start transaction
        await client.query("BEGIN");

        const shipmentRes = await client.query(`
            INSERT INTO shipments
            (tracking_number, customer_code, origin_warehouse_id, destination_warehouse_id, channel, total_cost, shipment_note, user_id, payment_time, package_ids, total_weight)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *
        `, [
            tracking_number,
            customer_code,
            origin_warehouse_id,
            destination_warehouse_id,
            channel,
            totalPrice,
            shipment_note,
            user_id,
            payment_time,
            package_ids,
            total_weight
        ]);

        await client.query(`
            UPDATE shipment_requests
            SET status = 'accepted'
            WHERE id = $1
        `, [shipment_request_id]);

        await client.query(`
            UPDATE packages
            SET status = 'assigned_to_shipment'
            WHERE id = ANY($1)
        `, [package_ids]);

        await client.query(`
            INSERT INTO payments (user_id, customer_code, shipment_tracking_number, amount, status, created_at, transaction_ref)
            VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        `, [user_id, customer_code, tracking_number, totalPrice, 'pending', tracking_number]);

        // 📧 Get user email BEFORE commit (still inside transaction)
        const userRes = await client.query(
            `SELECT email FROM users WHERE id = $1`,
            [user_id]
        );

        const userEmail = userRes.rows[0]?.email;

        // ✅ Commit if everything works
        await client.query("COMMIT");

        // 📧 Send email AFTER commit
        if (userEmail) {
            resend.emails.send({
                from: "Logistics <no-reply@dheirinternational.com>", // change after domain verification
                to: [userEmail],
                subject: "Shipment Created Successfully 🚚",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>🎉 Shipment Created Successfully</h2>
                        <p>Hello,</p>
                        <p>Your shipment has been created and is now being processed.</p>

                        <p><strong>Tracking Number:</strong> ${tracking_number}</p>
                        <p><strong>Total Cost:</strong> ₦${totalPrice}</p>

                        <p>You can use your tracking number to monitor delivery progress.</p>

                        <br/>
                        <p>Thanks for choosing us 🚀</p>
                    </div>
                `
            }).catch(err => {
                console.error("Email failed:", err);
            });
        }

        return NextResponse.json({
            success: true,
            data: shipmentRes.rows[0]
        });

    } catch (err) {
        await client.query("ROLLBACK");

        console.error("Error Creating Shipment", err);

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 });

    } finally {
        client.release();
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
            SELECT * FROM shipments
        `)

        return NextResponse.json({
            success: true,
            data: res.rows
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