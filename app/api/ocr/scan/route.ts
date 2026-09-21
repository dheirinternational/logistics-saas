import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

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

let rotationIndex = 0

// Provider caller functions
async function callOpenAI(apiKey: string, base64Data: string, mimeType: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `OpenAI HTTP ${res.status}`)
    }

    const json = await res.json()
    return json.choices?.[0]?.message?.content || ""
  } finally {
    clearTimeout(timeout)
  }
}

async function callGroq(apiKey: string, base64Data: string, mimeType: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Groq HTTP ${res.status}`)
    }

    const json = await res.json()
    return json.choices?.[0]?.message?.content || ""
  } finally {
    clearTimeout(timeout)
  }
}

async function callGemini(apiKey: string, modelName: string, base64Data: string, mimeType: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
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

    return result.response.text() || ""
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(req: Request) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    const groqKey = process.env.GROQ_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    // Assemble the active provider pool based on configured keys
    const pool: { name: string; run: (b64: string, mime: string) => Promise<string> }[] = []

    if (openaiKey) {
      pool.push({
        name: "OpenAI (gpt-4o-mini)",
        run: (b64, mime) => callOpenAI(openaiKey, b64, mime),
      })
    }

    if (groqKey) {
      pool.push({
        name: "Groq (llama-3.2-vision)",
        run: (b64, mime) => callGroq(groqKey, b64, mime),
      })
    }

    if (geminiKey) {
      pool.push(
        {
          name: "Gemini (gemini-flash-latest)",
          run: (b64, mime) => callGemini(geminiKey, "gemini-flash-latest", b64, mime),
        },
        {
          name: "Gemini (gemini-3.5-flash-lite)",
          run: (b64, mime) => callGemini(geminiKey, "gemini-3.5-flash-lite", b64, mime),
        },
        {
          name: "Gemini (gemini-3.1-flash-lite)",
          run: (b64, mime) => callGemini(geminiKey, "gemini-3.1-flash-lite", b64, mime),
        }
      )
    }

    if (pool.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No OCR API keys configured. Please add OPENAI_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY to .env",
        },
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

    // Rotate starting provider on each scan to distribute rate-limit quotas
    const startIndex = rotationIndex % pool.length
    rotationIndex++

    const orderedPool = [
      ...pool.slice(startIndex),
      ...pool.slice(0, startIndex),
    ]

    let responseText = ""
    let lastError: any = null

    for (const provider of orderedPool) {
      try {
        responseText = await provider.run(base64Data, mimeType)
        if (responseText) {
          console.log(`OCR scan successfully processed via: ${provider.name}`)
          break
        }
      } catch (err: any) {
        lastError = err
        console.warn(`OCR provider '${provider.name}' failed or hit rate limit:`, err?.message || err)
      }
    }

    if (!responseText) {
      throw lastError || new Error("All configured OCR providers failed")
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
