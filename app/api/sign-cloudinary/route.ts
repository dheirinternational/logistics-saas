import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(req: NextResponse){

    const { public_id, folder } = await req.json()

    if (!public_id || !folder) {
        NextResponse.json({
            message: "Error uploading Images",
            success: false
        }, {status: 400})
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = cloudinary.utils.api_sign_request(
        {timestamp, folder: `${folder}`, public_id: `${public_id}`},
        process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    })
}

// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyohkwf5z
// CLOUDINARY_API_KEY=467281814715742
// CLOUDINARY_API_SECRET=WO9yoLCfFG0u_2NPaRAQNXt7eG0