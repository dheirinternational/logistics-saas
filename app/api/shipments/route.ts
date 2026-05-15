import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { generateTrackingNumber } from "@/lib/generators/generateTrackingNumber";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";





const supabase = createClient(
    process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SUPABASE_URL! : process.env.NEXT_PUBLIC_SUPABASE_URL_TEST!, 
    process.env.NODE_ENV === "production" ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.SUPABASE_SERVICE_ROLE_KEY_TEST!
)


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

        const formData = await req.formData()
        const fileImages = formData.getAll("images") as File[]


        if(fileImages.length < 1 ){
            return NextResponse.json({
                success: false,
                message: "No Images Selected"
            }, {status: 400})
        }

        const data = {
            customer_code: formData.get("customer_code") as string,
            origin_warehouse_id: Number(formData.get("origin_warehouse_id")),
            destination_warehouse_id: Number(formData.get("destination_warehouse_id")),
            channel: formData.get("channel"),
            shipment_request_id: Number(formData.get("shipment_request_id")),
            shipment_note: formData.get("shipment_note"),
            user_id: Number(formData.get("user_id")),
            payment_time: formData.get("payment_time"),
            package_ids: formData.get("package_ids"),
            total_weight: Number(formData.get("total_weight")).toFixed(2),
            price: Number(formData.get("total_price")).toFixed(2),
            
        }

        const package_ids = data.package_ids?.toString().split(",")

        if(Number(data.price) < 1){
            return NextResponse.json({
                success: false,
                message: "Invalid price input"
            }, { status: 400 })
        }


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
            data.customer_code,
            data.origin_warehouse_id,
            data.destination_warehouse_id,
            data.channel,
            data.price,
            data.shipment_note,
            data.user_id,
            data.payment_time,
            package_ids,
            data.total_weight
        ]);

        const { id } = shipmentRes.rows[0]
        const uploadedImages: string[] = []

        console.log(fileImages)

        for(const file of fileImages){
            if (!file || file.size === 0) continue

            console.log("FILE:", file)
            console.log("NAME:", file.name)
            console.log("SIZE:", file.size)
            console.log("TYPE:", file.type)

            const filePath = `shipment${id}-${Date.now()}-${file.name}`
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const { error } = await supabase.storage
                .from("shipments")
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false
                })

            if (error) {
                throw new Error(`Supabase upload failed: ${error.message}`)
            }

            const { data: publicUrl } = supabase.storage
                .from("shipments")
                .getPublicUrl(filePath)

            uploadedImages.push(publicUrl.publicUrl)

        }

        console.log("worked!")

        console.log(uploadedImages)

        if (uploadedImages.length > 0) {
            const values: unknown[] = []
            const rowsSql = uploadedImages.map((url, index) => {
                const base = index * 3
                values.push(id, url, index === 0)
                return `($${base + 1}, $${base + 2}, $${base + 3})`
            })
    
            await client.query(`
                INSERT INTO shipment_images (shipment_id, image_url, is_primary)
                VALUES ${rowsSql.join(", ")}
            `, values)
        }  



        await client.query(`
            UPDATE shipment_requests
            SET status = 'accepted'
            WHERE id = $1
        `, [data.shipment_request_id]);

        await client.query(`
            UPDATE packages
            SET status = 'assigned_to_shipment'
            WHERE id = ANY($1)
        `, [package_ids]);

        await client.query(`
            INSERT INTO payments (user_id, customer_code, shipment_tracking_number, amount, status, created_at, transaction_ref)
            VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        `, [data.user_id, data.customer_code, tracking_number, data.price, 'pending', tracking_number]);

        // 📧 Get user email BEFORE commit (still inside transaction)
        const userRes = await client.query(
            `SELECT email FROM users WHERE id = $1`,
            [data.user_id]
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
                        <p><strong>Total Cost:</strong> ₦${data.price}</p>

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