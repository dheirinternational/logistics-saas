import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Current official models: gemini-flash-latest (primary) with gemini-3.8-flash (fallback)
const PRIMARY_MODEL = "gemini-flash-latest"
const FALLBACK_MODEL = "gemini-3.8-flash"

const PROMPT = `Analyze this package label, waybill, shipping receipt, or package box image.
Carefully read all text (including Chinese, English, French, Turkish, etc.) and translate all extracted descriptive values into standard English.

Extract the following details and return ONLY a valid JSON object matching this schema:
{
  "customerName": string or null (buyer/recipient name translated into English/Latin script, e.g. 张三 -> Zhang San),
  "customerCode": string or null (member/customer code, e.g. matching patterns like Dheir-DHI0056, Ronke-DHI0040, M-DHI0265, DHI0056, KRC2530, or name-DHIxxxx),
  "shippingId": string or null (tracking number, waybill number, express tracking ID, e.g. SF123456, YT123456, 773123456, DH-SHIP..., KRC..., CX...),
  "weight": number or null (gross weight, net weight, or package weight in KG as a float/number. Check labels like 重量, 毛重, 净重, 计费重量, 实重, G.W., N.W., WT, Weight. If in grams e.g. 500g convert to 0.5. If in Chinese 斤 e.g. 4斤 convert to 2.0. If in 公斤/kg e.g. 3.5kg extract 3.5),
  "weightUnit": "kg" or "cbm" (default to "kg"),
  "packageName": string or null (goods/item description translated to concise English, e.g. 品名: 假发 -> Wigs, 衣服 -> Clothing, 女鞋 -> Women Shoes, 电子配件 -> Electronic Accessories, 包包 -> Bags),
  "cost": number or null (total price, grand total, declared value, or shipping cost as a numeric number without currency symbols),
  "warehouseName": string or null (destination/warehouse name, e.g. 广州仓 -> D_HEIR CARGO Guangzhou Warehouse, D_HEIR Sea Cargo Warehouse Lagos)
}

Important Instructions:
1. Translate all foreign language names and item descriptions (e.g. Chinese 品名, 收件人, 仓库) to English.
2. Ensure 'weight' is always a pure number in KG (e.g. 2.45).
3. Return ONLY valid JSON, with NO markdown formatting or extra text.`

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No receipt file uploaded" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")
    const mimeType = file.type || "image/jpeg"

    const genAI = new GoogleGenerativeAI(apiKey)

    let responseText = ""
    let lastError: any = null

    for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 12000) // 12s per candidate

        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        })

        const result = await model.generateContent(
          [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            PROMPT,
          ],
          { signal: controller.signal } as any
        )

        clearTimeout(timeout)

        responseText = result.response.text()
        if (responseText) {
          console.log(`OCR scan successfully used model: ${modelName}`)
          break
        }
      } catch (err: any) {
        lastError = err
        const isTimeout = err?.name === "AbortError"
        console.warn(
          `Gemini OCR model '${modelName}' ${isTimeout ? "timed out" : "failed"}:`,
          err?.message || err
        )
      }
    }

    if (!responseText) {
      throw lastError || new Error("All Gemini OCR models failed")
    }

    // Clean JSON response (strip markdown fences if present)
    let cleanedText = responseText.trim()
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim()
    }

    const data = JSON.parse(cleanedText)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error("OCR Scan Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to process receipt",
      },
      { status: 500 }
    )
  }
}
