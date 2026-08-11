import { databaseErrorResponse, pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { generateTrackingNumber } from "@/lib/generators/generateTrackingNumber";
import { linkMediaAssetsToShipment } from "@/lib/media/mediaAssets";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export async function POST(req: NextRequest) {
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

        const formData = await req.formData()
        const mediaAssetIds = formData
            .getAll("media_asset_ids")
            .map((entry) => Number(String(entry)))
            .filter((id) => Number.isFinite(id) && id > 0)

        if (mediaAssetIds.length < 1) {
            return NextResponse.json({
                success: false,
                message: "Select at least one image or video from the media library.",
            }, { status: 400 })
        }

        const totalWeightUnitRaw = String(formData.get("total_weight_unit") ?? "kg").toLowerCase()
        const total_weight_unit = totalWeightUnitRaw === "cbm" ? "cbm" : "kg"

        let originWarehouseId = Number(formData.get("origin_warehouse_id"))
        let destinationWarehouseId = Number(formData.get("destination_warehouse_id"))

        if (!originWarehouseId || !Number.isFinite(originWarehouseId) || originWarehouseId < 8) {
            originWarehouseId = 8 // Default Guangzhou Consolidation Warehouse
        }
        if (!destinationWarehouseId || !Number.isFinite(destinationWarehouseId) || destinationWarehouseId < 8) {
            destinationWarehouseId = String(formData.get("channel")) === "sea" ? 11 : 10 // Default Lagos Sea/Air Warehouse
        }

        const data = {
            customer_code: formData.get("customer_code") as string,
            origin_warehouse_id: originWarehouseId,
            destination_warehouse_id: destinationWarehouseId,
            channel: formData.get("channel"),
            shipment_request_id: Number(formData.get("shipment_request_id")),
            shipment_note: formData.get("shipment_note"),
            user_id: Number(formData.get("user_id")),
            payment_time: formData.get("payment_time"),
            package_ids: formData.get("package_ids"),
            total_weight: Number(formData.get("total_weight")).toFixed(2),
            total_weight_unit,
            total_pieces: Number(formData.get("total_pieces") || 1),
            loading_date: formData.get("loading_date") ? String(formData.get("loading_date")) : null,
            expected_arrival_date: formData.get("expected_arrival_date") ? String(formData.get("expected_arrival_date")) : null,
            price: Number(formData.get("total_price")).toFixed(2),
            admin_reply: formData.get("admin_reply") as string || null,
        }

        const package_ids = data.package_ids?.toString().split(",")

        if (Number(data.price) < 1 || Number(data.total_weight) < 0.01) {
            return NextResponse.json({
                success: false,
                message: "Invalid price or weight input",
            }, { status: 400 })
        }


        const tracking_number = generateTrackingNumber();

        const client = await pool.connect();
        try {
        await client.query("BEGIN");

        const reqCheck = await client.query(
            `SELECT status FROM shipment_requests WHERE id = $1`,
            [data.shipment_request_id]
        );
        if (reqCheck.rows.length === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json({ success: false, message: "Shipment request not found" }, { status: 404 });
        }
        if (reqCheck.rows[0].status !== 'vetted') {
            await client.query("ROLLBACK");
            return NextResponse.json({ success: false, message: "Shipment request must be accepted/vetted first" }, { status: 400 });
        }

        const shipmentRes = await client.query(`
            INSERT INTO shipments
            (tracking_number, customer_code, origin_warehouse_id, destination_warehouse_id, channel, total_cost, shipment_note, user_id, payment_time, package_ids, total_weight, total_weight_unit, total_pieces, loading_date, expected_arrival_date, admin_reply)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING *
        `, [
            tracking_number,
            data.customer_code,
            data.origin_warehouse_id,
            data.destination_warehouse_id,
            data.channel,
            data.price,
            data.shipment_note,
            data.user_id,
            data.payment_time,
            package_ids,
            data.total_weight,
            data.total_weight_unit,
            data.total_pieces,
            data.loading_date,
            data.expected_arrival_date,
            data.admin_reply,
        ]);

        const { id } = shipmentRes.rows[0]
        await linkMediaAssetsToShipment(client, Number(id), mediaAssetIds)



        await client.query(`
            UPDATE shipment_requests
            SET status = 'accepted',
                total_price = $2,
                total_weight = $3,
                total_weight_unit = $4,
                total_pieces = $5,
                loading_date = $6,
                expected_arrival_date = $7,
                admin_reply = $8
            WHERE id = $1
        `, [data.shipment_request_id, data.price, data.total_weight, data.total_weight_unit, data.total_pieces, data.loading_date, data.expected_arrival_date, data.admin_reply]);

        await client.query(`
            UPDATE packages
            SET status = 'assigned_to_shipment'
            WHERE id = ANY($1)
        `, [package_ids]);

        await client.query(`
            INSERT INTO payments (user_id, customer_code, shipment_tracking_number, amount, status, created_at, transaction_ref)
            VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        `, [data.user_id, data.customer_code, tracking_number, data.price, 'pending', tracking_number]);

        // Get user email BEFORE commit (still inside transaction)
        const userRes = await client.query(
            `SELECT email FROM users WHERE id = $1`,
            [data.user_id]
        );

        const userEmail = userRes.rows[0]?.email;

        // Commit if everything works
        await client.query("COMMIT");

        // Send email AFTER commit
        if (userEmail) {
            resend.emails.send({
                from: "Logistics <no-reply@dheirinternational.com>", // change after domain verification
                to: [userEmail],
                subject: "Shipment Created Successfully",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Shipment Created Successfully</h2>
                        <p>Hello,</p>
                        <p>Your shipment has been created and is now being processed.</p>

                        <p><strong>Tracking Number:</strong> ${tracking_number}</p>
                        <p><strong>Total Cost:</strong> ₦${data.price}</p>

                        <p>You can use your tracking number to monitor delivery progress.</p>

                        <br/>
                        <p>Thanks for choosing us.</p>
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
        } catch (txErr) {
            await client.query("ROLLBACK").catch(() => undefined);
            throw txErr;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error("Error Creating Shipment", err);
        const { message, status } = databaseErrorResponse(
            err,
            "Something went wrong"
        );

        return NextResponse.json({
            success: false,
            message
        }, { status });
    }
}


export async function GET(){
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

        const res = await pool.query(`
            SELECT * FROM shipments ORDER BY id DESC
        `)

        const shipmentIds = res.rows.map(r => Number(r.id))
        const imagesMap: Record<number, { image_url: string; media_type?: string }[]> = {}
        
        if (shipmentIds.length > 0) {
            const imagesRes = await pool.query(
                `SELECT shipment_id, image_url, media_type 
                 FROM shipment_images 
                 WHERE shipment_id = ANY($1)`,
                [shipmentIds]
            )
            for (const r of imagesRes.rows) {
                const sid = Number(r.shipment_id)
                if (!imagesMap[sid]) {
                    imagesMap[sid] = []
                }
                imagesMap[sid].push({
                    image_url: r.image_url,
                    media_type: r.media_type || "photo"
                })
            }
        }

        const data = res.rows.map(row => ({
            ...row,
            images: imagesMap[Number(row.id)] ?? []
        }))

        return NextResponse.json({
            success: true,
            data
        })

    }

    catch(err){
        console.error("Error Fetching Shipments", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}