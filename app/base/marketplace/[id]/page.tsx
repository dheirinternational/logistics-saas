"use client"

import AddToCart from "@/components/base/marketplace/AddToCart"
import Header from "@/components/base/marketplace/Header"
import MarketSearch from "@/components/base/marketplace/MarketSearch"
import { CartProduct, Product, ProductImage } from "@/types/entityTypeDef"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaStar } from "react-icons/fa"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function ProductDisplay(){
    
    const router = useRouter()
    const {id} = useParams()
    console.log(id)

    const [product, setProduct] = useState<Product | null>(null)
    const [images, setImages] = useState<ProductImage[]>([])
    const [cartItem, setCartItem] = useState<CartProduct | null>(null)
    const [isFetchingData, setIsFetchingData] = useState(true)
    const [selectedImage, setSelectedImage] = useState("")

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

            setSelectedImage(images.data[0].image_url)

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
        <div className='h-full w-full space-y-1 max-w-full overflow-hidden'>
            {/* <Header /> */}
            <MarketSearch/>
            <button 
            className="ml-4 text-xs"
            onClick={() => {router.back()}}
            >
                Go Back
            </button>
            <div className="flex p-6 gap-4 relative z-10 max-sm:flex-col overflow-auto max-sm:h-dvh max-sm:max-h-dvh max-sm:pb-60">
                
                {/* Image business container */}
                <div className="flex max-sm:flex-col">
                    <figure className="
                        w-120 aspect-square bg-light rounded relative overflow-hidden shadow shadow-dark/4
                        max-sm:w-full max-sm:aspect-sqaure    
                    ">
                        {
                            isFetchingData ?
                            <div className="h-full w-full center-items">
                                <BeatLoader color="orange" size={8}/>    
                            </div>
                             :
                            <Image 
                            src={selectedImage}
                            alt={""}
                            fill
                            className="object-cover"
                            loading="eager"
                            />
                        }
                    </figure>
                    <div className="flex flex-col pl-3 gap-2 max-sm:flex-row max-sm:pl-0 max-sm:pt-2">
                        {
                            images.map( (image, i) => 
                                <button 
                                className={`
                                    w-16 h-16 bg-light rounded relative overflow-hidden
                                    ${image.image_url === selectedImage ? "shadow shadow-red-400" : "shadow shadow-dark/5" }
                                `}
                                key={i}
                                onClick={() => setSelectedImage(image.image_url)}
                                >
                                     <Image 
                                    src={image.image_url}
                                    alt={""}    
                                    fill
                                    className="object-cover opacity-60"
                                    loading="eager"
                                    />
                                </button>

                            )
                        }
                    </div>
                </div>


                <div className="flex-1 h-fit bg-light rounded shadow shadow-dark/5 p-6">
                    <h2 className="">
                        {product?.name}
                    </h2>
                    <div className="p-4 border-dark/8 border rounded mt-4">
                        <p className="text-3xl font-semibold flex items-center flex-wrap gap-2 max-sm:flex-col max-sm:items-start">
                            <span className="whitespace-nowrap">
                                ₦ {Number(product?.discount_price || product?.price || 0).toLocaleString()}
                            </span>
                            {
                                product?.discount_price &&
                                <span className="whitespace-nowrap text-xl line-through font-normal">    
                                    ₦ ${Number(product?.price || 0).toLocaleString()}
                                </span>
                            }
                        </p>
                        <span className="mt-1 block w-fit text-[10px] opacity-60 ">
                            {product?.stock_quantity || 0 > 0 ? `${product?.stock_quantity} items left In stock` : "Not in stock"}
                        </span> 
                    </div>
                    <p className="text-[11px] mt-2">
                        + shipping <span className="font-semibold">₦ {(5600).toLocaleString()}</span> to Abuja 
                    </p>

                    <div className="bg-light p-body mt-2">
                        <h2 className="tracking-wide text-sm font-semibold">
                            Product Details
                        </h2>
                        <hr className="border-dark/20 my-3"/>
                        <p className="text-xs leading-5 px-10 max-sm:text-[10px] max-sm:px-1">
                            {product?.description}
                        </p>
                    </div> 

                    {/* Add to cart */}
                    <div className="bg-light p-body">
                        {
                            cartItem &&
                            <AddToCart {...cartItem}/>
                        }
                    </div> 
                </div>

                {/* <div className="p-2 flex gap-2 overflow-auto">
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
                            </span> */}

                            {/* Rating */}

                            {/* <div className="flex gap-1 mt-4 text-gray-400">
                                <FaStar/>
                                <FaStar/>
                                <FaStar/>
                                <FaStar/>
                                <FaStar/>
                            </div> */}
                        {/* </div> */}

                        {/* Product Description */}

                        {/* <div className="bg-light p-body mt-2">
                            <h2 className="tracking-wide">
                                Product Details
                            </h2>
                            <hr className="border-dark/20 my-3"/>
                            <p className="text-xs leading-5">
                                {product?.description}
                            </p>
                        </div> */}


                        {/* Add to cart */}
                        {/* <div className="bg-light p-body mb-20">
                            {
                                cartItem &&
                                <AddToCart {...cartItem}/>
                            }
                        </div> */}

                    {/* </>
                } */}
            </div>
            
        </div>
    )
}


