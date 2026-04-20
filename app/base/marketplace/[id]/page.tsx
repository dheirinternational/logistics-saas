"use client"

import AddToCart from "@/components/base/marketplace/AddToCart"
import Header from "@/components/base/marketplace/Header"
import { CartProduct, Product, ProductImage } from "@/types/entityTypeDef"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { FaStar } from "react-icons/fa"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function ProductDisplay(){
    

    const {id} = useParams()
    console.log(id)

    const [product, setProduct] = useState<Product | null>(null)
    const [images, setImages] = useState<ProductImage[]>([])
    const [cartItem, setCartItem] = useState<CartProduct | null>(null)
    const [isFetchingData, setIsFetchingData] = useState(true)

    // Get Product 
    const fetchProduct = async() => {
        setIsFetchingData(true)
        try{
            const res = await fetch(`/api/products/${id}`)
            const producta = await res.json()
            const imgRes = await fetch(`/api/products/images/${id}`)
            const images = await imgRes.json()

            if(!res.ok){
                toast.error(producta.message)
            }

            setProduct(producta.data)
            setImages(images.data)


            const productDetails: Product = producta.data
            setCartItem({
                id: productDetails.id ,
                name: productDetails.name,
                price: productDetails.price,
                discount_price: productDetails.discount_price,
                quantity: productDetails.stock_quantity,
                image: images.data[0].image_url,
                amount_to_be_ordered: 1
            })

        }
        catch(err){
            console.error("ERR:: Fetching Product Details", err)
            toast.error("ERR:: Fetching Product Details")
        }
        finally{
            setIsFetchingData(false)
        }
    }

    useEffect(() => {
        fetchProduct()
    }, [])

    useEffect(() => {
        console.log(cartItem)
    }, [cartItem])
    
    return (
        <div className='h-full w-full space-y-1'>
            <Header />
            <div className="p-2 flex gap-2 overflow-auto">
                {images.map( (img: ProductImage) => 
                    <figure key={img.id} className="w-66 h-50 min-w-66 overflow-hidden max-h-50 max-w-66 relative rounded">
                        {
                            isFetchingData ?
                            <BeatLoader color="orange" size={10}/> :
                            <Image 
                            src={img.image_url}
                            alt={""}
                            fill
                            className="object-cover"
                            loading="eager"
                            />
                        }
                    </figure>
                )}
            </div>

           {
            isFetchingData ? 
            <BeatLoader color="orange" size={10}/> :
            <>
                <div className="p-body bg-light py-8">
                    <h2 className="">
                        {product?.name}
                    </h2>
                    <p className="text-2xl mt-3 font-semibold">
                        ₦ {product?.price}
                    </p>

                    <span className="mt-3 block w-fit text-xs opacity-60">
                        {product?.stock_quantity || 0 > 0 ? "In stock" : "Not in stock"}
                    </span>

                    {/* Rating */}

                    {/* <div className="flex gap-1 mt-4 text-gray-400">
                        <FaStar/>
                        <FaStar/>
                        <FaStar/>
                        <FaStar/>
                        <FaStar/>
                    </div> */}
                </div>

                {/* Product Description */}

                <div className="bg-light p-body mt-2">
                    <h2 className="tracking-wide">
                        Product Details
                    </h2>
                    <hr className="border-dark/20 my-3"/>
                    <p className="text-xs leading-5">
                        {product?.description}
                    </p>
                </div>
                {/* Add to cart */}
                <div className="bg-light p-body mb-20">
                    {
                        cartItem &&
                        <AddToCart {...cartItem}/>
                    }
                </div>

            </>
           }
        </div>
    )
}


