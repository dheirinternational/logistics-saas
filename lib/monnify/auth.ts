export async function getMonnifyToken() {

    console.log(process.env.MONNIFY_API_KEY)
    console.log(process.env.MONNIFY_SECRET_KEY)
    console.log(process.env.MONNIFY_BASE_URL)
    


    const credentials = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString("base64")
    
    
    const res = await fetch(`https://sandbox.monnify.com/api/v1/auth/login`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`
        }
    })

    console.log(res)

    if (!res.ok) {
        const errorText = await res.text();

        console.log("🔥 MONNIFY RAW ERROR:");
        console.log(errorText);
        console.log("STATUS:", res.status);

        throw new Error("Failed to authenticate with Monnify");
    }

    const data = await res.json()
    

    return data.responseBody.accessToken;
}