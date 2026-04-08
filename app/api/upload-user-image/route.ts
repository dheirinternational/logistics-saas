import { supabaseAdmin } from '@/lib/supabase/supabase'
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"
import { pool } from '@/lib/db/db'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: "No valid file uploaded" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type })

    // Fixed path per user — upsert overwrites the existing file
    const filePath = `avatars/${session.user_id}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: file.type,
        upsert: true, // overwrites the existing image
      })

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError)
      return NextResponse.json({ success: false, message: "Error uploading image" }, { status: 500 })
    }

    // Append timestamp to bust CDN cache since the file path stays the same
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const bustUrl = `${publicUrl}?t=${Date.now()}`

    await pool.query(
      `UPDATE users SET profile_img = $1 WHERE id = $2`,
      [bustUrl, session.user_id]
    )

    return NextResponse.json({ success: true, message: "Image uploaded successfully", imageUrl: bustUrl })

  } catch (err) {
    console.error("ERROR UPLOADING IMAGE:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}