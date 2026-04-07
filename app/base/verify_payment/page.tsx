

export default async function VerifyPayment({searchParams}: {searchParams: Promise<{[key: string]: string}>}){

    const { reference } = await searchParams
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify-payment/${reference}`)

    
    if (response.ok) {
        const result = await response.json()

    }

    return(
        <div className="p-body">
            <h1 className="text-sm font-semibold">
                Verifying Payment...
            </h1>
        </div>
    )
}