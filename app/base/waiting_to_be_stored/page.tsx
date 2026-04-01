"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { dummyIncomingPackages } from '@/types/dummyData'
import { useEffect, useState } from 'react'
import { IncomingPackage, Package } from '@/types/entityTypeDef'
import { toast } from 'react-toastify'
import { BeatLoader } from 'react-spinners'

const Page: NextPage = ({}) => {

    const [filterValues, setFilterValues] = useState({
        warehouse_id: "",
        incoming_tracking_id: "" 
    })
    const [packages, setPackages] = useState<IncomingPackage[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    
    useEffect(() => {
        const fetchPackages = async () => {
            try{

                const userRes = await fetch(`/api/auth/me`, {
                    method: "GET",
                    credentials: "include"
                })

                const user = await userRes.json()

                const res = await fetch(`/api/incoming-packages/${user.user_id}`, {
                    method: "GET",
                    credentials: "include"
                })
                
                const result = await res.json()
    
                if(!res.ok){
                    toast.error(result?.message)
                }
    
                setPackages(result.data)
            }
            catch(err){
                console.error(err)
            }
            finally{
                setLoading(false)
            }
        }

        fetchPackages()
    }, [])
    

  return <div className='h-full w-full space-y-1'>
    <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
        <button 
        className='flex gap-2 flex-1 justify-start'
        onClick={() => {router.back()}}
        >
            <FaChevronLeft />
            <span className='text-xs font-semiboldd'>
                Go Back
            </span>
        </button>
        <h1 className='font-semibold'>
            Orders not yet in stock
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>

    <div className='bg-white p-4 flex flex-col gap-2'> 
        <div className='w-40 -mt-2'>
            <InputComponent
            name='warehouse_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            readonly
            select
            // selectValues={dummyWarehouses.map( x => x.name)}
            />
        </div>
        <div className='flex items-center text-xs gap-1 -mt-2'>
            <InputComponent
            name='incoming_tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Tracking Number Id...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white mt-2 rounded'>
                Search
            </button>
        </div>

    </div>
    <div className='bg-light px-4 py-2'>
        <span className='text-xs'>
            Total: <span className='text-accent-red font-bold text-sm'>{packages?.length || 0}</span> incoming Packgages
        </span>
    </div>

    {
        loading ? 
        <div className='flex justify-center py-10'>
            <BeatLoader color='#f26430' size={12} speedMultiplier={0.5}/>
        </div> :
        <div className='bg-light p-4 min-h-100 gap-y-3'>
            {
                dummyIncomingPackages.length < 1 && 
                <p className='text-xs italic'>
                    ...There are no incoming packages
                </p>
            }
            
            {
                packages.map( x => 
                    <div
                    key={x.id} 
                    className='border border-dark/20 p-4 py-3 space-y-2 rounded mb-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-lg'>
                                {x.declared_item_name}
                            </p>
                            <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                                <span className='text-[10px] text-accent-blue block'>
                                    expected
                                </span>
                            </div>
                        </div>

                        <div className='text-xs flex'>
                            <p className='text-xs flex-1 whitespace-nowrap border-r border-dark/20'>
                                Track: {x.incoming_tracking_number}
                            </p>
                            <p className='flex-1 whitespace-nowrap flex justify-center border-r border-dark/20'>
                                {x.warehouse_id}
                            </p>
                            <p className='flex-1 whitespace-nowrap flex justify-end'>
                                {x.created_at.slice(0, 10)}
                            </p>
                        </div>
                    </div>
                )
            }
        </div>
    }
  </div>
}

export default Page