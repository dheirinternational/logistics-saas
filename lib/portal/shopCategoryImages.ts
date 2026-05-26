import { SHOP_CATEGORIES } from "@/lib/marketing/shopCatalog"

/** Visuals for API categories — aligned with landing shop cards. */
const CATEGORY_IMAGE_BY_KEY: Record<string, { imageSrc: string; imageAlt: string }> =
  {
    fashion: {
      imageSrc: SHOP_CATEGORIES[0].imageSrc,
      imageAlt: SHOP_CATEGORIES[0].imageAlt,
    },
    entertainment: {
      imageSrc: SHOP_CATEGORIES[1].imageSrc,
      imageAlt: SHOP_CATEGORIES[1].imageAlt,
    },
    home: {
      imageSrc: SHOP_CATEGORIES[2].imageSrc,
      imageAlt: SHOP_CATEGORIES[2].imageAlt,
    },
  }

const DEFAULT_CATEGORY_IMAGE = SHOP_CATEGORIES[0]

export function getCategoryDisplayImage(
  categoryName: string,
  description?: string,
): { imageSrc: string; imageAlt: string; description: string } {
  const key = categoryName.toLowerCase().replace(/\s+/g, "")
  const matched =
    Object.entries(CATEGORY_IMAGE_BY_KEY).find(([k]) =>
      key.includes(k),
    )?.[1] ?? DEFAULT_CATEGORY_IMAGE

  return {
    imageSrc: matched.imageSrc,
    imageAlt: matched.imageAlt,
    description:
      description?.trim() ||
      SHOP_CATEGORIES.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
      )?.description ||
      `Browse ${categoryName} from China, delivered with your freight.`,
  }
}
