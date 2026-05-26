/** Category card imagery — one distinct image per category (not product inventory photos). */

type CategoryVisual = {
  imageSrc: string
  imageAlt: string
}

const CATEGORY_IMAGES: Record<string, CategoryVisual> = {
  automotive: {
    imageSrc:
      "https://images.unsplash.com/photo-1767265581229-8ad720f7f814?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Shelves filled with colorful craft supplies and accessories",
  },
  beauty: {
    imageSrc:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Beauty and skincare products",
  },
  books: {
    imageSrc:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Books and reading materials",
  },
  electronics: {
    imageSrc:
      "https://images.unsplash.com/photo-1634990677553-4a2a6b2dcaac?auto=format&fit=crop&w=900&q=80",
    imageAlt: "A collection of electronics and gadgets laid out on a table",
  },
  entertainment: {
    imageSrc:
      "https://images.unsplash.com/photo-1665041982909-8a86864a1e49?auto=format&fit=crop&w=900&q=80",
    imageAlt: "A group of toys on a table",
  },
  fashion: {
    imageSrc:
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=900&q=80",
    imageAlt:
      "Woman wearing beige and red floral top with white leather bag",
  },
  fitness: {
    imageSrc:
      "https://images.unsplash.com/photo-1517836357043-4b0e4110dcca?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Fitness and gym equipment",
  },
  groceries: {
    imageSrc:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Groceries and fresh food",
  },
  home: {
    imageSrc:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Home furniture and decor",
  },
  kids: {
    imageSrc:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Kids toys and clothing",
  },
  pets: {
    imageSrc:
      "https://images.unsplash.com/photo-1450770069471-970686473a3e?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Pet food and accessories",
  },
  services: {
    imageSrc:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Professional services",
  },
  tools: {
    imageSrc:
      "https://images.unsplash.com/photo-1504148455328-59b4a43ebe8e?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Tools and hardware",
  },
}

const DEFAULT_VISUAL: CategoryVisual = {
  imageSrc:
    "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80",
  imageAlt: "Shopping and retail",
}

function normalizeCategoryKey(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "")
}

export function getCategoryDisplayImage(
  categoryName: string,
  description?: string,
): { imageSrc: string; imageAlt: string; description: string } {
  const key = normalizeCategoryKey(categoryName)
  const visual = CATEGORY_IMAGES[key] ?? DEFAULT_VISUAL

  return {
    imageSrc: visual.imageSrc,
    imageAlt: visual.imageAlt,
    description:
      description?.trim() ||
      `Browse ${categoryName} from China, delivered with your freight.`,
  }
}
