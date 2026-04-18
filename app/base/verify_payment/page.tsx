

export default async function VerifyPayment({searchParams}: {searchParams: Promise<{[key: string]: string}>}){

    const { reference } = await searchParams
    // ${process.env.NEXT_PUBLIC_APP_URL}
    await fetch(`https://6e1e-102-89-75-213.ngrok-free.app/api/paystack/verify-payment/${reference}`)

    return(
        <div className="p-body">
            <h1 className="text-sm font-semibold">
                Verifying Payment...
            </h1>
        </div>
    )
}