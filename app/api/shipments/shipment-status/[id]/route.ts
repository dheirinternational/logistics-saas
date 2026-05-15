import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params;

        // ✅ Update shipment status
        const updateRes = await pool.query(`
            UPDATE shipments
            SET status = $1
            WHERE id = $2
            RETURNING *
        `, [body.status, id]);

        if (updateRes.rows.length < 1) {
            return NextResponse.json({
                success: false,
                message: "Shipment not found"
            }, { status: 404 });
        }

        const shipment = updateRes.rows[0];

        // ✅ Get user email
        const userRes = await pool.query(`
            SELECT email
            FROM users
            WHERE id = $1
        `, [shipment.user_id]);

        const userEmail = userRes.rows[0]?.email;

        // ✅ Send email
        if (userEmail) {
            resend.emails.send({
                from: "Logistics <no-reply@dheirinternational.com>",
                to: [userEmail],
                subject: `Shipment Status Updated: ${body.status}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>📦 Shipment Status Updated</h2>

                        <p>Hello,</p>

                        <p>
                            Your shipment status has been updated successfully.
                        </p>

                        <p>
                            <strong>Tracking Number:</strong>
                            ${shipment.tracking_number}
                        </p>

                        <p>
                            <strong>New Status:</strong>
                            ${body.status}
                        </p>

                        <br />

                        <p>
                            Thank you for choosing our logistics service 🚚
                        </p>
                    </div>
                `
            }).catch(err => {
                console.error("Email failed:", err);
            });
        }

        return NextResponse.json({
            success: true,
            message: "Status successfully updated"
        }, { status: 200 });

    } catch (err) {

        console.error("Internal server error", err);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}