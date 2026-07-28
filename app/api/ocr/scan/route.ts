import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { message: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { message: "No receipt file uploaded" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")
    const mimeType = file.type || "image/jpeg"

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    })

    const prompt = `Analyze this receipt image. Extract the following details and return them in a JSON object matching this schema exactly:
{
  "customerName": string or null (the name of the buyer/customer),
  "cost": number or null (the total purchase price, grand total, or total cost as a number. Remove currency symbols like ₦, $, etc.),
  "shippingId": string or null (any tracking reference, shipment number, or order reference starting with DH-SHIP or similar prefix, or other reference number)
}

Do not include any formatting other than valid JSON.`

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
      prompt,
    ])

    const responseText = result.response.text()
    const data = JSON.parse(responseText.trim())

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error("OCR Scan Error:", error)
    return NextResponse.json(
      { message: error?.message || "Failed to process receipt" },
      { status: 500 }
    )
  }
}
