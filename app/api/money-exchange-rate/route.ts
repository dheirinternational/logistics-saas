import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export const GET = async() => {
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        // if(session.role !== "admin"){
        //     return NextResponse.json({
        //         success: false,
        //         message: "Forbidden"
        //     }, { status: 403 })
        // }

        const moneyRate = await pool.query(`
            SELECT * FROM money_rates    
        `)

        return NextResponse.json({
            success: true,
            message: "Money Rates Fetched",
            data: moneyRate.rows
        })
    }
    catch(err: any){
        console.log("Internal server error", err)
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 })
    }
} 