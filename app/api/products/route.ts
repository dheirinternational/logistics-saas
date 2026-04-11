export const runtime = "nodejs"

import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request){

    const client = await pool.connect()

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
                message: "Forbidden"
            }, {status: 403})
        }

        const formData = await req.formData()
        const files = formData.getAll("images") as File[]

        const data = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            category_id: Number(formData.get("category_id")),
            price: Number(formData.get("price")),
            cost_price: Number(formData.get("cost_price")),
            stock_quantity: Number(formData.get("stock_quantity")),
            low_stock_threshold: Number(formData.get("low_stock_threshold")),
            weight: Number(formData.get("weight")),
            is_featured: formData.get("is_featured") === "true"
        }

        if(data.price === 0){
            return NextResponse.json({
                success: false,
                message: "Invalid Price Range"
            }, {status: 400})
        }
        
        await client.query("BEGIN")

        const { rows } = await client.query(`
            INSERT INTO products ( name, description, category_id, price, stock_quantity, low_stock_threshold, weight, is_featured, created_at, created_by, updated_at, updated_by, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, NOW(), $10, 'active')
            RETURNING *
        `, [data.name, data.description, data.category_id, data.price, data.stock_quantity, data.low_stock_threshold, data.weight, data.is_featured, session.user_id, session.user_id ])

        const id = rows[0].id
        const uploadedImages: string[] = []


        for (const file of files) {
            if(!(file instanceof File) || file.size === 0) continue

            const filePath = `product${id}-${Date.now()}-${file.name}`


            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const { error} = await supabase.storage
                .from("products")
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false
                })

            if (error){
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
                INSERT INTO product_images (product_id, image_url, is_primary)
                VALUES ${rowsSql.join(", ")}
            `, values)
        }            

        await client.query("COMMIT")

        return NextResponse.json({
            message: "Successfully added product to system",
            success: true,
        })
        
    } catch(err){
        await client.query("ROLLBACK")
        console.error("Error Adding Product to System", err)

        return NextResponse.json({
            message: "Error Adding Product to System",
            success: false
        },{status: 500})
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
            SELECT * FROM products    
        `)

        return NextResponse.json({
            message: "Products succesfully fetched from database",
            data: res.rows,
            success: true
        })
    }
    catch(err){
        console.error("Error Fetching Data from Database", err)
        return NextResponse.json({
            message: "Error Fetching Products from Database",
            success: false
        })
    }
}


export async function PUT(req: Request) {
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
                message: "Forbidden"
            }, {status: 403})
        }


        const data = await req.json()

        const { rows } = await pool.query(`
            UPDATE products 
            SET 
                name = $1, 
                description = $2, 
                category_id = $3, 
                price = $4, 
                stock_quantity = $5, 
                low_stock_threshold = $6, 
                weight = $7, 
                is_featured = $8, 
                updated_at = NOW(), 
                updated_by = $9, 
                status = $10, 
                discount_price = $11, 
                cost_price = $12
            WHERE id = $13
            RETURNING *
        `, [data.name, data.description, data.category_id, data.price, data.stock_quantity, data.low_stock_threshold, data.weight, data.is_featured, session.user_id, data.status, data.discount_price, data.cost_price, data.id])
        
        return NextResponse.json({
            message: "Product succesfully Updated",
            data: rows,
            success: true
        })

    }
    catch(err){
        console.error("Error Fetching Data from Database", err)
        return NextResponse.json({
            message: "Error Fetching Products from Database",
            success: false
        })
    }
}