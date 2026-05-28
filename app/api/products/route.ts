export const runtime = "nodejs"

import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import {
    getValidProductMediaFiles,
    uploadProductMediaFiles,
} from "@/lib/products/uploadProductMedia"
import { isValidProductWeightUnit } from "@/lib/shop/productWeight"
import { NextRequest, NextResponse } from "next/server"

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
            discount_price: Number(formData.get("discount_price") ?? 0),
            discount_min_qty: formData.get("discount_min_qty")
              ? Number(formData.get("discount_min_qty"))
              : null,
            stock_quantity: Number(formData.get("stock_quantity")),
            weight: Number(formData.get("weight")),
            weight_unit: String(formData.get("weight_unit") ?? "kg"),
            is_featured: formData.get("is_featured") === "true"
        }

        console.log(data.is_featured)

        if(data.price === 0){
            return NextResponse.json({
                success: false,
                message: "Invalid Price Range"
            }, {status: 400})
        }
        if (data.discount_price > 0 && data.discount_price >= data.price) {
            return NextResponse.json(
                { success: false, message: "Discounted price must be less than price" },
                { status: 400 }
            )
        }
        if (data.discount_min_qty !== null && data.discount_min_qty < 2) {
            return NextResponse.json(
                { success: false, message: "Qty for discounted price must be at least 2" },
                { status: 400 }
            )
        }
        if (data.discount_price > 0 && (data.discount_min_qty === null || data.discount_min_qty < 2)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Qty for discounted price is required when a discounted price is set",
                },
                { status: 400 }
            )
        }
        if (!data.category_id || Number.isNaN(data.category_id)) {
            return NextResponse.json(
                { success: false, message: "Select a valid category" },
                { status: 400 }
            )
        }
        if (!isValidProductWeightUnit(data.weight_unit)) {
            return NextResponse.json(
                { success: false, message: "Weight unit must be kg or cbm" },
                { status: 400 }
            )
        }
        if (data.weight <= 0) {
            return NextResponse.json(
                { success: false, message: "Product weight must be greater than 0" },
                { status: 400 }
            )
        }

        const validFiles = getValidProductMediaFiles(files)
        if (validFiles.length < 1) {
            return NextResponse.json(
                { success: false, message: "Select at least 1 media file" },
                { status: 400 }
            )
        }

        if (validFiles.length > 8) {
            return NextResponse.json(
                { success: false, message: "Select up to 8 media files" },
                { status: 400 }
            )
        }
        
        await client.query("BEGIN")

        const { rows } = await client.query(`
            INSERT INTO products (
                name,
                description,
                category_id,
                price,
                discount_price,
                discount_min_qty,
                stock_quantity,
                low_stock_threshold,
                cost_price,
                weight,
                weight_unit,
                is_featured,
                created_at,
                created_by,
                updated_at,
                updated_by,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, $8, $9, $10, NOW(), $11, NOW(), $12, 'active')
            RETURNING *
        `, [
            data.name,
            data.description,
            data.category_id,
            data.price,
            data.discount_price || 0,
            data.discount_min_qty,
            data.stock_quantity,
            data.weight,
            data.weight_unit,
            data.is_featured,
            session.user_id,
            session.user_id
        ])

        const id = Number(rows[0].id)
        const uploadedMedia = await uploadProductMediaFiles(id, validFiles)

        if (uploadedMedia.length > 0) {
            const values: unknown[] = []
            const rowsSql = uploadedMedia.map((m, index) => {
                const base = index * 4
                values.push(id, m.url, index === 0, m.media_type)
                return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
            })
    
            await client.query(`
                INSERT INTO product_images (product_id, image_url, is_primary, media_type)
                VALUES ${rowsSql.join(", ")}
            `, values)
        }            

        await client.query("COMMIT")

        return NextResponse.json({
            message: "Successfully added product to system",
            success: true,
        })
        
    } catch(err){
        try {
            await client.query("ROLLBACK")
        } catch {
            /* no active transaction */
        }
        console.error("Error Adding Product to System", err)

        const message =
            err instanceof Error ? err.message : "Error Adding Product to System"

        return NextResponse.json({
            message,
            success: false
        },{status: 500})
    }
    finally {
        client.release()
    }
}


export async function GET(req: NextRequest){
    try{
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search")

        let query = `SELECT * FROM products`
        let values: any[] = []
        values = []

        if (search) {
            query += ` WHERE name ILIKE $1`
            values.push(`%${search}%`)
        }

        const res = await pool.query(query, values)

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
        const weightUnit = String(data.weight_unit ?? "kg")

        if (!isValidProductWeightUnit(weightUnit)) {
            return NextResponse.json(
                { success: false, message: "Weight unit must be kg or cbm" },
                { status: 400 }
            )
        }

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
                weight_unit = $8,
                is_featured = $9, 
                updated_at = NOW(), 
                updated_by = $10, 
                status = $11, 
                discount_price = $12, 
                cost_price = $13
            WHERE id = $14
            RETURNING *
        `, [
            data.name,
            data.description,
            data.category_id,
            data.price,
            data.stock_quantity,
            data.low_stock_threshold,
            data.weight,
            weightUnit,
            data.is_featured,
            session.user_id,
            data.status,
            data.discount_price,
            data.cost_price,
            data.id,
        ])
        
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