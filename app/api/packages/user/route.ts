export const dynamic = "force-dynamic"
export const revalidate = 0

import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET(){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const { user_id } = session

        const res = await pool.query(`
            SELECT * FROM packages
            WHERE user_id = $1
            ORDER BY id DESC
        `, [user_id])

        const packageIds = res.rows.map(r => Number(r.id)).filter(Boolean)
        const imagesMap: Record<number, { id: number; imageUrl: string; image_url: string; mediaType: string; media_type: string }[]> = {}

        if (packageIds.length > 0) {
            const imgRes = await pool.query(
                `SELECT id, package_id, image_url, media_type, media_asset_id
                 FROM package_images
                 WHERE package_id = ANY($1)
                 ORDER BY id ASC`,
                [packageIds]
            )
            for (const r of imgRes.rows) {
                const pid = Number(r.package_id)
                if (!imagesMap[pid]) {
                    imagesMap[pid] = []
                }
                const mType = r.media_type || (/\.(mp4|webm|mov)$/i.test(r.image_url) ? "video" : "photo")
                imagesMap[pid].push({
                    id: Number(r.id),
                    imageUrl: r.image_url,
                    image_url: r.image_url,
                    mediaType: mType,
                    media_type: mType,
                })
            }
        }

        const data = res.rows.map(r => ({
            ...r,
            images: imagesMap[Number(r.id)] ?? []
        }))

        return NextResponse.json(
            {
                success: true,
                data
            },
            {
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                },
            }
        )
    }
    catch(err){
        console.error("Error Fetching User Packages", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}