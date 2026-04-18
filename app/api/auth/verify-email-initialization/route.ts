import { randomBytes } from "crypto";
import crypto from "crypto"
import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/mails/sendVerificationEmail";


export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate rawa token
    const token = randomBytes(32).toString("hex");
    
    // 2. Hash token (this goes in DB)
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    // Expiry
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    const { rows } = await pool.query(
      `
      UPDATE users
      SET email_verification_token = $1,
          email_verification_expires = $2
      WHERE id = $3
      RETURNING email
      `,
      [hashedToken, expires, session.user_id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const email = rows[0].email;

    // send email here

    await sendVerificationEmail(email, token)

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (err) {
    console.error("Error sending verification email:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}