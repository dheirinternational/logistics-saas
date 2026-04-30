import { NextResponse } from "next/server";
import { getSession } from "@/lib/db/session";

export async function GET(){
    try{
        const session = await getSession();

        if(!session) {
            return NextResponse.json({
                user: null
            }, {status: 401})
        }

        return NextResponse.json({
            user: {
                id: session.user_id,
                email: session.email,
                role: session.role
            }
        })
    }
    catch(err){
        console.error("Internal Server Error, Unable to log in")
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Unable to log in"
        })
    }
}