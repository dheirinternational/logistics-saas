import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"


export async function POST(req: Request){  
    try{

        const session = await getSession()

        if (!session){
            return new Response(JSON.stringify({
                message: "Unauthorized"
            }), {status: 401})
        }  

        if(session.role !== "admin"){
            return new Response(JSON.stringify({
                message: "Forbidden"
            }), {status: 403})
        }
        
        const body = await req.json()

        const res = await pool.query(`
            INSERT INTO payments (user_id, customer_code, shipment_tracking_number, amount, status,  created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [body.user_id, body.customer_code, body.shipment_tracking_number, body.amount, 'pending']) 

        return new Response(JSON.stringify({
            message: "Payment record initialized successfully"
        }), {status: 201})


    }
    catch(err){
        console.error("Error Initializing Payment record", err)
        return new Response(JSON.stringify({
            message: "Error Initializing Payment Record"
        }), {status: 500})
    }   
}