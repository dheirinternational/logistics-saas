import AddToCart from "@/components/base/marketplace/AddToCart"
import Header from "@/components/base/marketplace/Header"
import { dummyProductImages, dummyProducts } from "@/types/dummyData"
import { Product } from "@/types/entityTypeDef"
import Image from "next/image"
import { FaStar } from "react-icons/fa"

export default async function ProductDisplay({ params }: {params: {id: string}}){
    
    const {id} = await params

    // Get Product 

    const product = dummyProducts.find( x => x.id === id )
    const productImg = dummyProductImages.filter(x => x.product_id === id)

    if (!product) return

    return (
        <div className='h-full w-full space-y-1'>
            <Header />
            <div className="p-2 flex gap-2 overflow-auto">
                {productImg.map( img => 
                    <figure key={img.id} className="w-66 h-50 min-w-66 overflow-hidden max-h-50 max-w-66 relative rounded">
                        <Image 
                        src={img.image_url}
                        alt={img.alt_text}
                        fill
                        className="object-cover"
                        loading="eager"
                        />
                    </figure>
                )}
            </div>

            <div className="p-body bg-light py-8">
                <h2 className="">
                    {product?.name}
                </h2>
                <p className="text-2xl mt-3 font-semibold">
                    # {product?.price}
                </p>

                <span className="mt-3 block w-fit text-xs opacity-60">
                    {product?.stock_quantity || 0 > 0 ? "In stock" : "Not in stock"}
                </span>

                {/* Rating */}

                <div className="flex gap-1 mt-4 text-gray-400">
                    <FaStar/>
                    <FaStar/>
                    <FaStar/>
                    <FaStar/>
                    <FaStar/>
                </div>
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
                <AddToCart {...product}/>
            </div>
        </div>
    )
}