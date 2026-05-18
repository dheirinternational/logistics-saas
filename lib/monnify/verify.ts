import { getMonnifyToken } from "./auth";

export async function VerifyTransaction(reference: string){
    const token = await getMonnifyToken()

    const res = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v2/transaction/${reference}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!res.ok) {
        throw new Error("Verification failed")
    }
    
    const data = await res.json()
    return data.responseBody
}