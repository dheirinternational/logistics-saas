import { HERO_IMAGE } from "@/lib/marketing/hero"
import {
  OG_EYEBROW,
  OG_HEADLINE,
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
  const [cabinetExtrabold, satoshiMedium, satoshiRegular, logoSrc] =
    await Promise.all([
      loadFont(
        "fonts/CabinetGrotesk_Complete/Fonts/WEB/fonts/CabinetGrotesk-Extrabold.ttf"
      ),
      loadFont("fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Medium.ttf"),
      loadFont("fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Regular.ttf"),
      loadLogoDataUri(),
    ])

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fafaf8",
        }}
      >
        <div
          style={{
            width: "52%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 52px",
            background: "#fafaf8",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img
                src={logoSrc}
                alt=""
                width={56}
                height={56}
                style={{ objectFit: "contain" }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontFamily: "Cabinet Grotesk",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#12141a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  DHEIR
                </div>
                <div
                  style={{
                    fontFamily: "Satoshi",
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#8b919e",
                  }}
                >
                  International
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "10px 18px",
                borderRadius: 999,
                background: "#1a5fff",
                color: "#ffffff",
                fontFamily: "Satoshi",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {OG_EYEBROW}
            </div>

            <div
              style={{
                fontFamily: "Cabinet Grotesk",
                fontSize: 58,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#12141a",
                maxWidth: 520,
              }}
            >
              {OG_HEADLINE}
            </div>

            <div
              style={{
                fontFamily: "Satoshi",
                fontSize: 26,
                fontWeight: 500,
                lineHeight: 1.45,
                color: "#4b5563",
                maxWidth: 500,
              }}
            >
              {OG_SUBLINE}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "Satoshi",
              fontSize: 20,
              fontWeight: 500,
              color: "#8b919e",
            }}
          >
            <span>{SITE_NAME}</span>
            <span>{SITE_DOMAIN}</span>
          </div>
        </div>

        <div
          style={{
            width: "48%",
            height: "100%",
            display: "flex",
            position: "relative",
            background: "#eef4ff",
          }}
        >
          <img
            src={HERO_IMAGE.src}
            alt=""
            width={576}
            height={630}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
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
          data: satoshiRegular,
          style: "normal",
          weight: 400,
        },
      ],
    }
  )
}
