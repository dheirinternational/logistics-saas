import crypto from "crypto"

export function verifyMonnifySignature(rawBody: string, signature: string){
    const hash = crypto.createHmac("sha512", process.env.MONNIFY_SECRET_KEY as string)
                .update(rawBody)
                .digest("hex")
    return hash === signature
}