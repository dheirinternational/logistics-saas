// import { pool } from "@/lib/db/db";
// import { getSession } from "@/lib/db/session";
// import { NextRequest, NextResponse } from "next/server";


// export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}){
//     try{
//         const session = await getSession()
        
//         if(!session){
//             return NextResponse.json({
//                 success: false,
//                 messgae: "Unauthorized"
//             }, {status: 401})
//         }

//         const res = await pool.query(`
//             SELECT * FROM  
//         `)
//     }
//     catch{
        
//     }
// }