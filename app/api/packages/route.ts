import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";


const supabase = createClient(
    process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SUPABASE_URL! : process.env.NEXT_PUBLIC_SUPABASE_URL_TEST!, 
    process.env.NODE_ENV === "production" ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.SUPABASE_SERVICE_ROLE_KEY_TEST!
)

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest){

    const client = await pool.connect()

    try{
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const { role } = session

        if (role !== "admin"){
            return NextResponse.json({
                success: false, 
                message: "FORBIDDEN!"
            }, {status: 403})
        }

        const formData = await req.formData()
        const fileImages = formData.getAll("images")
        
        console.log(fileImages)
        const data = {
            package_name: formData.get("package_name"),
            incoming_package_id: formData.get("incoming_package_id"),
            // user_id: Number(formData.get("user_id")),
            customer_code: formData.get("customer_code"),
            warehouse_id: Number(formData.get("warehouse_id")),
            weight: Number(formData.get("weight")),
            condition: formData.get("condition"),
            status: "stored",
            received_at: formData.get("received_at"),
            stored_at: formData.get("stored_at"),
            inp_status: formData.get("inp_status"),
            amount: Number(formData.get("amount"))
        }

        if(fileImages.length < 1 ){
            return NextResponse.json({
                success: false,
                message: "No Images Selected"
            }, {status: 400})
        }

        await client.query("BEGIN")

        const userId = await client.query(
            `SELECT user_id FROM customers WHERE code = $1`,
            [data.customer_code]
        );

        if (userId.rows.length === 0){
            return NextResponse.json({
                success: false,
                message: `User with Customer code ${data.customer_code} was not found`
            }, {status: 404})
        }


        const res = await client.query(`
            INSERT INTO packages(
                incoming_package_id, package_name, user_id, customer_code, warehouse_id, weight, condition, status, received_at, stored_at, created_at, amount
            )     
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
            RETURNING id
        `, [data.incoming_package_id, data.package_name, userId.rows[0].user_id, data.customer_code, data.warehouse_id, data.weight, data.condition, data.status, data.received_at, data.stored_at, data.amount])

        await client.query(`
            UPDATE incoming_packages
                SET status = 'stored'
                WHERE incoming_tracking_number = $1
        `, [data.incoming_package_id])


        
        const { id } = res.rows[0]
        const uploadedImages: string[] = []

        for(const file of fileImages){
            if(!(file instanceof File) || file.size === 0) continue

            const filePath = `package${id}-${Date.now()}-${file.name}`
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const { error } = await supabase.storage
                .from("packages")
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false
                })

            if (error) {
                throw new Error(`Supabase upload failed: ${error.message}`)
            }

            const { data: publicUrl } = supabase.storage
                .from("packages")
                .getPublicUrl(filePath)

            uploadedImages.push(publicUrl.publicUrl)

        }

        if (uploadedImages.length > 0) {
            const values: unknown[] = []
            const rowsSql = uploadedImages.map((url, index) => {
                const base = index * 3
                values.push(id, url, index === 0)
                return `($${base + 1}, $${base + 2}, $${base + 3})`
            })
    
            await client.query(`
                INSERT INTO package_images (package_id, image_url, is_primary)
                VALUES ${rowsSql.join(", ")}
            `, values)
        }  
        
        // Get user email
        const userRes = await client.query(
            `SELECT email FROM users WHERE id = $1`,
            [userId.rows[0].user_id]
        );

        const userEmail = userRes.rows[0]?.email;

        await client.query("COMMIT")


        if (userEmail) {
            try {
                await resend.emails.send({
                    from: "Logistics <no-reply@dheirinternational.com>",
                    to: [userEmail],
                    subject: "📦 Your Package Has Been Received!",
                    html: `
                        <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
                            <div style="max-width:600px;margin:auto;background:white;padding:24px;border-radius:10px;">
                                
                                <h2 style="color:#111827;">📦 Package Received</h2>

                                <p>Hello,</p>

                                <p>Your package has arrived and is now safely stored in our warehouse.</p>

                                <div style="background:#f3f4f6;padding:15px;border-radius:8px;">
                                    <p><strong>Package:</strong> ${data.package_name}</p>
                                    <p><strong>Tracking ID:</strong> ${data.incoming_package_id}</p>
                                    <p><strong>Status:</strong> Stored</p>
                                </div>

                                <p style="margin-top:20px;">
                                    You can now proceed with shipping whenever you're ready.
                                </p>

                                <p style="color:#6b7280;font-size:13px;margin-top:30px;">
                                    Need help? Contact support anytime.
                                </p>

                                <p style="font-weight:bold;">
                                    — Your Logistics Team 🚚
                                </p>

                            </div>
                        </div>
                    `
                });
            } catch (err) {
                console.error("Email failed:", err);
            }
        }



        return NextResponse.json({
            success: true,
            message: "Package Successfully Added to system"
        })
        
    }
    catch(err){

        await client.query("ROLLBACK")
        console.error("Internal server error", err)

        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, {status: 500})
    }
    finally {
        client.release()
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

        const res = await pool.query(`
            SELECT * FROM packages    
        `)

        return NextResponse.json({
            success: true,
            data: res.rows
        })

    }
    catch(err){
        console.error("Internal server error", err)
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, {status: 500})

    }
}