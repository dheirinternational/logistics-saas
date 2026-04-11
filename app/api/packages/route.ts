import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
            user_id: Number(formData.get("user_id")),
            customer_code: formData.get("customer_code"),
            warehouse_id: Number(formData.get("warehouse_id")),
            weight: Number(formData.get("weight")),
            condition: formData.get("condition"),
            status: "stored",
            received_at: formData.get("received_at"),
            stored_at: formData.get("stored_at"),
            inp_status: formData.get("inp_status"),
        }

        console.log(data)
        // const {incoming_package_id, package_name, user_id, customer_code, warehouse_id, weight, condition, status, received_at, stored_at, inp_status, images} = body

        if(data.inp_status === "stored"){
            return NextResponse.json({
                success: false,
                message: "Record already exists in database"
            }, {status: 409})
        }

        if(fileImages.length < 4 || fileImages.length > 4){
            return NextResponse.json({
                success: false,
                message: "Must Select only four images"
            }, {status: 400})
        }

        await client.query("BEGIN")

        const res = await client.query(`
            INSERT INTO packages(
                incoming_package_id, package_name, user_id, customer_code, warehouse_id, weight, condition, status, received_at, stored_at, created_at 
            )     
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            RETURNING id
        `, [data.incoming_package_id, data.package_name, data.user_id, data.customer_code, data.warehouse_id, data.weight, data.condition, data.status, data.received_at, data.stored_at ])

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
                .from("products")
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

        await client.query("COMMIT")

        return NextResponse.json({
            success: true,
            message: "Package Successfully Added to system"
        })
        
    }
    catch(err){

        await client.query("ROLLBACK")
        console.error("Error Adding Package to database", err)

        return NextResponse.json({
            success: false,
            message: "Error adding Package to database"
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
        console.error("Error fetching Packages", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})

    }
}