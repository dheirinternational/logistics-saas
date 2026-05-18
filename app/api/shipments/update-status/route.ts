import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function PUT(req: NextRequest){
    try{
        const session = await getSession()
        if(!session){
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

        const {status, id} = await req.json()

        if (!status || !id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields",
                },
                { status: 400 }
            );
        }


        await pool.query(`
            UPDATE shipments
                SET status = $1
                WHERE id = $2
        `, [status, Number(id)])


         // Get shipment + customer info
        const shipmentResult = await pool.query(
            `
            SELECT 
                shipments.id,
                shipments.status,
                shipments.tracking_number,
                users.email
            FROM shipments
            JOIN users 
                ON shipments.user_id = users.id
            WHERE shipments.id = $1
        `,
            [Number(id)]
        );

        const shipment = shipmentResult.rows[0];

        if (shipment?.email) {
            await resend.emails.send({
                from: "DheirLogistics <no-reply@dheirinternational.com>",
                to: shipment.email,
                subject: `Shipment Status Updated`,
                html: `
                    <div style="font-family: sans-serif;">
                        <h2>Shipment Update</h2>

                        <p>Hello ${shipment.full_name || "Customer"},</p>

                        <p>
                            Your shipment status has been updated to:
                        </p>

                        <strong style="font-size: 18px;">
                            ${shipment.status}
                        </strong>

                        <p>
                            Shipment ID: #${shipment.tracking_number}
                        </p>

                        <p>
                            Thank you for choosing us.
                        </p>
                    </div>
                `,
            });
        }

        return NextResponse.json({
            success: false,
            message: `Shipment status successfully updated`
        })
    }
    catch(err){
        console.error("Internal Server Error, could not update shipment status", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, could not update shipment status" 
        }, {status: 500})
    }
}