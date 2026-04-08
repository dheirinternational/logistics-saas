import MarketSearch from '@/components/base/marketplace/MarketSearch'
import ProductCard from '@/components/base/marketplace/ProductCard'
import { NextPage } from 'next'
import { BiSolidShoppingBagAlt } from 'react-icons/bi'
import { BsTagFill } from 'react-icons/bs'
import { dummyProducts, dummyProductImages } from '@/types/dummyData'

const Page: NextPage = ({}) => {
  // Get featured products for discounted sale section
  const featuredProducts = dummyProducts.filter(product => product.is_featured === "true")
  const regularProducts = dummyProducts.filter(product => product.is_featured !== "true")

  // Helper function to get images for a product
  const getProductImages = (productId: number) => {
    return dummyProductImages.filter(image => image.product_id === productId)
  }

  return <div className='h-full w-full space-y-1'>
    <MarketSearch />
    
    {/* Products */}
    <div className='text-sm'>
        <div className='bg-accent-red px-body py-3 text-white flex items-center gap-2'>
            <BsTagFill className=''/>
            <p className='font-bold tex'>
                Discounted Sale
            </p>
        </div>
        <div className='p-2 flex bg-emerald-50 gap-4 max-w-full overflow-scroll'>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                images={getProductImages(product.id)}
              />
            ))}
        </div>

        {/* Products */}
        <div className='bg-accent-red px-body py-3 text-white flex items-center gap-2 mt-4'>
            <BiSolidShoppingBagAlt />
            <p className='font-bold tex'>
                Products
            </p>
        </div>
        <div className='p-2 flex flex-wrap bg-emerald-50 gap-6 max-w-full overflow-scroll justify-start'>
            {regularProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                images={getProductImages(product.id)}
              />
            ))}
        </div>
    </div>
  </div>
}

export default Page