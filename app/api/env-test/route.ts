export async function GET() {
  return Response.json({
    hasPaystackSecret: Boolean(process.env.PAYSTACK_SECRET_KEY),
    hasPaystackPublic: Boolean(process.env.PAYSTACK_PUBLIC_KEY),
  })
}
