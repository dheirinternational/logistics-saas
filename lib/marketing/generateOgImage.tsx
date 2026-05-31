import {
  OG_EYEBROW,
  OG_SUBLINE,
  SITE_DOMAIN,
  SITE_NAME,
} from "@/lib/marketing/siteMetadata"
import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import path from "node:path"

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

export const OG_IMAGE_CONTENT_TYPE = "image/png"

const BRAND_BLUE = "#1a5fff"
const INK = "#12141a"
const MUTED = "#6b7280"

async function loadFont(relativePath: string) {
  const filePath = path.join(process.cwd(), "public", relativePath)
  return readFile(filePath)
}

async function loadLogoDataUri() {
  const logoPath = path.join(process.cwd(), "public", "Dheir colored.png")
  const logo = await readFile(logoPath)
  return `data:image/png;base64,${logo.toString("base64")}`
}

export async function generateOgImage() {
  const [cabinetExtrabold, satoshiMedium, satoshiBold, logoSrc] = await Promise.all([
    loadFont(
      "fonts/CabinetGrotesk_Complete/Fonts/WEB/fonts/CabinetGrotesk-Extrabold.ttf"
    ),
    loadFont("fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Medium.ttf"),
    loadFont("fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Bold.ttf"),
    loadLogoDataUri(),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        {/* Solid corner accents — no gradients */}
        <div
          style={{
            position: "absolute",
            bottom: -110,
            left: -110,
            width: 300,
            height: 300,
            borderRadius: 150,
            background: BRAND_BLUE,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -70,
            width: 340,
            height: 340,
            borderRadius: 170,
            background: BRAND_BLUE,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: "48px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 36,
            }}
          >
            <img
              src={logoSrc}
              alt=""
              width={80}
              height={80}
              style={{ objectFit: "contain" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: "Cabinet Grotesk",
                  fontSize: 36,
                  fontWeight: 800,
                  color: INK,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                DHEIR
              </div>
              <div
                style={{
                  fontFamily: "Satoshi",
                  fontSize: 22,
                  fontWeight: 500,
                  color: MUTED,
                  marginTop: 4,
                }}
              >
                International
              </div>
            </div>
          </div>

          <div
            style={{
              width: 2,
              height: 28,
              background: "#d1d5db",
              marginBottom: 28,
            }}
          />

          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: BRAND_BLUE,
              color: "#ffffff",
              fontFamily: "Satoshi",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 32,
            }}
          >
            {OG_EYEBROW}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: 980,
              fontFamily: "Cabinet Grotesk",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              textAlign: "center",
              color: INK,
            }}
          >
            <span>Calm shipping from China </span>
            <span style={{ color: BRAND_BLUE }}>home.</span>
          </div>

          <div
            style={{
              width: 2,
              height: 28,
              background: "#d1d5db",
              marginTop: 32,
              marginBottom: 28,
            }}
          />

          <div
            style={{
              fontFamily: "Satoshi",
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.45,
              color: MUTED,
              textAlign: "center",
              maxWidth: 820,
            }}
          >
            {OG_SUBLINE}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 40,
              fontFamily: "Satoshi",
              fontSize: 22,
              fontWeight: 700,
              color: INK,
            }}
          >
            <span>{SITE_NAME}</span>
            <span style={{ color: "#d1d5db" }}>·</span>
            <span style={{ color: BRAND_BLUE }}>{SITE_DOMAIN}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        {
          name: "Cabinet Grotesk",
          data: cabinetExtrabold,
          style: "normal",
          weight: 800,
        },
        {
          name: "Satoshi",
          data: satoshiMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Satoshi",
          data: satoshiBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  )
}
