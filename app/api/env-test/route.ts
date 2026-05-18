// app/api/env-test/route.ts

export async function GET() {
    return Response.json({
        apiKey: process.env.MONNIFY_API_KEY,
        baseUrl: process.env.MONNIFY_BASE_URL
    });
}