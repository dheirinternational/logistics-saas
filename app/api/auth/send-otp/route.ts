    import { pool } from "@/lib/db/db";
    import { NextRequest, NextResponse } from "next/server";
    import { Resend } from "resend";

    const TIME_DURATION = 1000 * 60 * 10
    const resend = new Resend(process.env.RESEND_API_KEY)

    export async function POST(req: NextRequest){
        try{

            const { email } = await req.json()

            if (!email) {
                return NextResponse.json({
                    success: false,
                    message: "Email is required"
                }, { status: 400 });
            }

            const otp = Math.floor(100000 + Math.random() * 999999)
            console.log(otp, email)
            
            const expires_at = new Date(Date.now() + TIME_DURATION)

            // Check Time difference for each requests
            const result = await pool.query(`
                SELECT created_at FROM otp WHERE email = $1
            `, [email]);

            if (result.rows.length > 0) {
                const created = new Date(result.rows[0].created_at);
                const diff = Date.now() - created.getTime();

                if (diff < 60 * 1000) {
                    return NextResponse.json({
                        success: false,
                        message: "Please wait before requesting another OTP"
                    }, { status: 429 });
                }
            }


            // UPSERT (Insert or Update if email already exists)
            await pool.query(`
                INSERT INTO otp (email, value, expires_at, created_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (email)
                DO UPDATE SET 
                    value = EXCLUDED.value,
                    expires_at = EXCLUDED.expires_at,
                    created_at = NOW()
            `, [email, otp, expires_at]);


            await resend.emails.send({
                from: "D_Heir Logistics <no-reply@dheirinternational.com>", // default test sender
                to: email,
                subject: "DHEIRLOGISTICS Onboarding",
                html: `
                    <p>Thank you for creating an account with us. You're required to verify your email address with the following:</p>
                    <br/>
                    <br/>
                    <h1>${otp}</h1>
                    <br/>
                    <br/>
                    <p>Best Regards, DHEIRLOGISTICS!</p>

                `,
            });

            return NextResponse.json({
                success: true,
                message: "OTP Successfully sent to email"
            })
        }
        catch(err){
            console.error("Internal Server Error, Could not generate OTP", err)
            return NextResponse.json({
                success: false,
                message: "Internal Server Error, Could not generate OTP"
            })
        }
    }