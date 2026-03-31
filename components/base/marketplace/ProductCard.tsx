"use client"

import { Product, ProductImage } from "@/types/entityTypeDef"
import Image from "next/image"
import Link from "next/link"

interface ProductCardProps extends Product {
  images?: ProductImage[]
}

const ProductCard = (props: ProductCardProps) => {
  const { name, price, discountPrice, stock_quantity, images, id } = props
  const mainImage = images?.[0]?.imageUrl || "https://picsum.photos/400/300"

  return (
    <Link href={`/base/marketplace/${id}`} className="relative">
        <figure className="w-27 h-27 bg-red-500 rounded relative overflow-hidden ">
            <Image
            src={mainImage}
            alt={images?.[0]?.altText || "Product Image"}
            loading="eager"
            fill
            className="overflow-hidden object-cover"
            />
        </figure>

        {discountPrice && discountPrice < price && (
          <span className="block w-fit bg-[#ffebcf] p-px px-1 rounded absolute top-0 right-0 text-accent-red">
              -{Math.round(((price - discountPrice) / price) * 100)}%
          </span>
        )}
        <p className="text-[10px] mt-2">
            {name}
        </p>
        <p className="text-lg font-semibold">
            # {discountPrice || price}k
        </p>
        <p className="text-[10px] line-clamp-1 text-ellipsis">
            {stock_quantity} units left
        </p>
    </Link>
  )
}

export default ProductCard