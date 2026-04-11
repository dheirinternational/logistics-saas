"use client"

import MarketSearch from '@/components/base/marketplace/MarketSearch'
import ProductCard from '@/components/base/marketplace/ProductCard'
import { NextPage } from 'next'
import { BiSolidShoppingBagAlt } from 'react-icons/bi'
import { BsTagFill } from 'react-icons/bs'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Product, ProductCategory } from '@/types/entityTypeDef'
import { BeatLoader } from 'react-spinners'
import InputComponent from '@/components/admin/shipments/InputComponent'

const Page: NextPage = ({}) => {
  // Get featured products for discounted sale section

  const [isDataLoading, setIsDataLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [filterValue, setFilterValue] = useState<{search: string, category: null | number}>({
    search: "",
    category: null
  })

  
  const fetchProducts = async () => {
    setIsDataLoading(true)
    try{
      const res = await fetch("/api/products")
      const result = await res.json()
      const resCat = await fetch("/api/products/categories")
      const resCatResult = await resCat.json()

      if(!res.ok){
        toast.error(result.message)
        return
      }

      setCategories(resCatResult.data)
      setProducts(result.data)
    }
    catch(err){
      toast.error("ERR:: Fetching Products")
      console.error("ERR:: Fetching Products", err)
    }
    finally{
      setIsDataLoading(false)
    }
  }




  useEffect(() => {
    fetchProducts()
  } ,[])
  

  const cate = categories.length > 0 ? categories.map( x => 
    ({name: `${x.name.charAt(0).toUpperCase()}${x.name.slice(1)}`, value: x.id})) 
    : []

  const filteredProducts = products
    .filter( x => x.name.toLowerCase().includes(filterValue.search.toLowerCase()))
    .filter( x => {
      if(filterValue.category === null){
        return true
      }
      else if(Number(x.category_id) === filterValue.category){
        return true
      }
    })

    console.log(cate)
    console.log(products)

  return <div className='h-full w-full space-y-1'>
    <MarketSearch />
    
    {/* Products */}
    <div className='text-sm'>
        <div className='bg-accent-red px-body py-3 text-white flex items-center gap-2'>
            <BsTagFill className=''/>
            <p className='font-bold tex'>
                Featured Products
            </p>
        </div>
        <div className='p-2 flex gap-4 max-w-full overflow-auto min-h-36 h-45'>
            {
              isDataLoading ? 
              <BeatLoader color='#f26430' size={10}/> :
              products.filter( x => x.is_featured ).map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                />
              ))
            }
        </div>

        {/* Products */}
        <div className='bg-accent-red px-body py-3 text-white flex items-center gap-2 mt-4'>
            <BiSolidShoppingBagAlt />
            <p className='font-bold tex'>
                Products
            </p>
        </div>
        <div className=' h-10 w-50 p-2 mb-3'>
            <InputComponent
            name='search'
            state={filterValue}
            setState={setFilterValue}
            placeHolder='Search Product...'
            type='text'
            />
        </div>

        <div className='flex text-xs overflow-auto w-full gap-4 px-2  pb-2'>
          <button 
            onClick={() => setFilterValue(prev => ({...prev, category: null}))}
            className={`${filterValue.category === null && "text-accent-red font-semibold"}`}
            > 
              {"All"}
          </button>
          {
            cate.map( x => <button 
            key={x.value}
            onClick={() => setFilterValue(prev => ({...prev, category: x.value}))}
            className={`${x.value === filterValue.category && "text-accent-red font-semibold"}`}
            > 
              {x.name}
            </button>)
          }
        </div>

        <div className='p-2 flex flex-wrap  gap-6 max-w-full overflow-auto justify-start'>
            {
              isDataLoading ? 
              <BeatLoader color='#f26430' size={10}/> :
              (
                !filterValue.search.trim() ?
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                  />
                )) :
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                  />
                ))
              )
            }
        </div>
    </div>
  </div>
}

export default Page