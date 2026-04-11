"use client"

import { Product, ProductImage } from "@/types/entityTypeDef"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FaStar } from "react-icons/fa"
import { BeatLoader } from "react-spinners"


const ProductCard = (props: Product) => {
  const { name, price, discount_price, stock_quantity, id } = props
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [images, setImages] = useState<ProductImage[]>([])

  const fetchImages = async() => {
    setIsImageLoading(true)
    try{
      const res = await fetch(`/api/products/images/${props.id}`)
      const result = await res.json()
      
      console.log(result)
      setImages(result.data)
    }
    catch(err){
      console.error(`ERR:: Error fetching product image with product id-${props.id}`)
    }
    finally{
      setIsImageLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [props.id])

  return (
    <Link href={`/base/marketplace/${id}`} className="relative">
        {
          props.is_featured && 
          <div className="absolute top-1 left-1 z-100 rounded-full p-1 bg-white/50"> 
             <FaStar className="text-[10px] text-accent-blue"/>
          </div>
        }
        <figure className="w-27 h-27 bg-red-500 rounded relative overflow-hidden ">
            {
              isImageLoading ? (
              <BeatLoader color="#FFF"  size={10}/> ) :
              (<Image
              src={images[0]?.image_url }
              alt={"Product Image"}
              loading="eager"
              fill
              className="overflow-hidden object-cover"
              />)
            }
        </figure>

        {discount_price && discount_price < price && (
          <span className="block w-fit bg-[#ffebcf] p-px px-1 rounded absolute top-0 right-0 text-accent-red">
              -{Math.round(((price - discount_price) / price) * 100)}%
          </span>
        )}
        <p className="text-[10px] mt-2">
            {name}
        </p>
        <p className="text-lg font-semibold">
            # {discount_price ?? price}k
        </p>
        <p className="text-[10px] line-clamp-1 text-ellipsis">
            {stock_quantity} units left
        </p>
    </Link>
  )
}

export default ProductCard