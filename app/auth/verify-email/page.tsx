"use client"

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Page(){
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailPage />
        </Suspense>
    )
}

function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [status, setStatus] = useState("verifying")

    useEffect(() => {
        const token = searchParams.get("token")

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email-final?token=${token}`)
                const data = await res.json()

                if (data.success) {
                    setStatus("success")
                    setTimeout(() => router.push("/"), 2000)
                } else {
                    setStatus("error")
                }
            } catch {
                setStatus("error")
            }
        }

        verify()
    }, [])

    return (
        <div className="p-body">
            {status === "verifying" && <p>Verifying your email...</p>}
            {status === "success" && <p>Email verified 🎉</p>}
            {status === "error" && <p>Invalid or expired link ❌</p>}
        </div>
    )
}