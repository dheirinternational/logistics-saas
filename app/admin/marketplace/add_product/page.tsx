import AddProduct from '@/components/admin/marketplace/AddProduct'
import { NextPage } from 'next'

const Page: NextPage = ({}) => {
  return <div className='space-y-body'>
    <h2 className="text-2xl font-semibold">
        Add Product
    </h2>
    <p className="text-xs text-dark/50 mt- mb-16">
        Add product to marketplace inventory.
    </p>
    <AddProduct/>
  </div>
}

export default Page