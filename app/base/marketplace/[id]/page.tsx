import AddToCart from "@/components/base/marketplace/AddToCart"
import Header from "@/components/base/marketplace/Header"
import { dummyProductImages, dummyProducts } from "@/types/dummyData"
import Image from "next/image"
import { FaStar } from "react-icons/fa"

export default async function ProductDisplay({ params }: {params: {id: string}}){
    
    const {id} = await params
    const numericId = parseInt(id)

    // Get Product 

    const product = dummyProducts.find( x => x.id === numericId )
    const cartProduct = {
        id: product?.id || 0,
        name: product?.name || "",
        price: product?.price || 0,
        discount_price: product?.discount_price || null,
        quantity: product?.stock_quantity || 0,
        image:dummyProductImages.find(img => img.product_id === numericId)?.image_url || "",
        amount_to_be_ordered: 1
    }
    const productImg = dummyProductImages.filter(x => x.product_id === numericId)

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
                <AddToCart {...cartProduct}/>
            </div>
        </div>
    )
}