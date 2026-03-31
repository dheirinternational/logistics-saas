import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: {params: Promise<{id: string}>}){
    try{
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const {id} = await params

        const res = await pool.query(`
            SELECT * FROM warehouses
            WHERE id = $1             
        `, [id])

        if (res.rows.length === 0) {
            return NextResponse.json(
                { error: "Warehouse not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: res.rows[0],
            },
            { status: 200 }
        );   


    }
    
    catch (err) {
        console.error(err);

        return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
        );
    }
}