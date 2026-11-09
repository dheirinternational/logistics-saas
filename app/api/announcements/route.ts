import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { isAdminOrStaff } from "@/lib/rbac/permissions"
import { NextRequest, NextResponse } from "next/server"


export async function GET(){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const res = await pool.query(`
          SELECT * FROM announcements   
        `)

        return NextResponse.json({
            success: true,
            message: "Announcements successfully retrieved from database",
            data: res.rows
        })
    }
    catch(err){
        console.error("Internal Server Error, Retrieving Announcements", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Retrieving Announcements"
        })
    }
}


export async function POST(req: NextRequest){
    try{

        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        if(!isAdminOrStaff(session)){
            return NextResponse.json({
                success: false,
                message: "Forbidden"
            }, {status: 403})
        }

        const {title, message} = await req.json()

        await pool.query(`
            INSERT INTO announcements (title, message)
            VALUES ($1, $2)
        `, [title, message])

        return NextResponse.json({
            success: true,
            message: "Announcement Successfully Added to Database"
        })

    }
    catch(err){
        console.error("Internal Server Error, Creating Announcements", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Creating Announcements"
        })
    }

}


export async function PUT(req: NextRequest){
    try{

        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        if(!isAdminOrStaff(session)){
            return NextResponse.json({
                success: false,
                message: "Forbidden"
            }, {status: 403})
        }

        const {id, title, message} = await req.json()

        await pool.query(`
          UPDATE announcements 
            SET 
                title = $1,
                message = $2
            WHERE id = $3
        `, [title, message, id])

        return NextResponse.json({
            success: true,
            message: "Successfully edited Announcement data"
        })

    }
    catch(err){
        console.error("Internal Server Error, Creating Announcement", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Creating Announcement"
        })
    }
}




export async function DELETE(req: NextRequest){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        if(!isAdminOrStaff(session)){
            return NextResponse.json({
                success: false,
                message: "Forbidden"
            }, {status: 403})
        }


        const {id} = await req.json()

        await pool.query(`
            DELETE FROM announcements 
            WHERE id = $1
        `, [id])

        return NextResponse.json({
            success: true,
            message: "Successfully Deleted announcement"
        })

    }
    catch(err){
        console.error("Internal Server Error, Deleting Announcement", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Deleting Announcements"
        })
    }
}