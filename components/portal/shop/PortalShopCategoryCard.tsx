import { getCategoryDisplayImage } from "@/lib/portal/shopCategoryImages"
import { SHOP_TEASER_COPY } from "@/lib/marketing/shopCatalog"
import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

type PortalShopCategoryCardProps = {
  id: number
  name: string
  description?: string
}

export function PortalShopCategoryCard({
  id,
  name,
  description,
}: PortalShopCategoryCardProps) {
  const display = getCategoryDisplayImage(name, description)

  return (
    <article className="shop-category-card group">
      <div className="shop-category-card__copy">
        <h3 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
          {name}
        </h3>
        <p className="mt-3 text-[14px] leading-[1.55] text-dheir-muted md:text-[15px]">
          {display.description}
        </p>
        <Link
          href={`/base/shop?category=${id}`}
          className="shop-category-card__link mt-5 inline-flex items-center gap-1 text-[14px] font-semibold text-dheir-blue no-underline transition-[gap] hover:gap-2"
        >
          {SHOP_TEASER_COPY.exploreCategory}
          <IconArrowRight size={16} stroke={2} aria-hidden />
        </Link>
      </div>
      <div className="shop-category-card__media">
        <Image
          src={display.imageSrc}
          alt={display.imageAlt}
          fill
          sizes="(max-width: 768px) 90vw, 360px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
    </article>
  )
}
