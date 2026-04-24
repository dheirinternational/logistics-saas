"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { IncomingPackage } from '@/types/entityTypeDef'
import { toast } from 'react-toastify'
import { BeatLoader } from 'react-spinners'
import { IncomingPackageStatus } from '@/types/statusTypes'

type FilterValues = {
    status: IncomingPackageStatus | ""
    tracking_id: string
}


const Page: NextPage = ({}) => {

    const [filterValues, setFilterValues] = useState<FilterValues>({
        status: "",
        tracking_id: "" 
    })
    const [packages, setPackages] = useState<IncomingPackage[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    
    useEffect(() => {
        const fetchPackages = async () => {
            try{

                const res = await fetch(`/api/incoming-packages/user`, {
                    method: "GET",
                    credentials: "include"
                })
                
                const result = await res.json()
    
                if(!res.ok){
                    toast.error(result?.message)
                }
    
                setPackages(result.data.filter((x : IncomingPackage) => x.status === "expected"))
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


        const data = packages.filter( x => 
        (x.incoming_tracking_number.toLowerCase().includes(filterValues.tracking_id.toLowerCase()) || 
        x.declared_item_name.toLowerCase().includes(filterValues.tracking_id.toLowerCase())))

    

  return <div className='h-full w-full space-y-1'>
    <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between '>
        <button 
        className='flex gap-2 flex-1 justify-start'
        onClick={() => {router.back()}}
        >
            <span className='text-xs font-semibold'>
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

    <div className='bg-white p-4 flex flex-col gap-2 md:max-w-150 md:mx-auto '> 
        <div className='flex items-center text-xs gap-1'>
            <InputComponent
            name='incoming_tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Tracking Number Id...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white rounded'>
                Search
            </button>
        </div>

        <div className='w-40 '>
            <InputComponent
            name='warehouse_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Select Status'
            title='Status'
            readonly
            select
            selectValues={[
                {name: "Expected", value: "expected"},
                {name: "Received", value: "received"},
                {name: "Cancelled", value: "cancelled"},
                {name: "Stored", value: "stored"}
            ]}
            overshadow
            // "expected" | "received" | "cancelled" | "stored"
            />
        </div>
    </div>
    <div className='bg-light px-4 py-2 md:max-w-150 md:mx-auto'>
        <span className='text-xs'>
            Total: <span className='text-accent-red font-bold text-sm'>{packages?.filter(x => x.status === "expected").length || 0}</span> incoming Packgages
        </span>
    </div>

    {
        loading ? 
        <div className='flex justify-center py-10'>
            <BeatLoader color='#f26430' size={12} speedMultiplier={0.5}/>
        </div> :
        <div className='bg-light p-4 min-h-100 gap-y-3 pb-30 md:max-w-150 md:mx-auto'>
            {
                data.length < 1 && 
                <p className='text-xs italic'>
                    ...There are no incoming packages
                </p>
            }
            
            {
                data.map( x => 
                    <div
                    key={x.id} 
                    className='border border-dark/20 p-4 py-3 space-y-2 rounded mb-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-lg'>
                                {x.declared_item_name}
                            </p>
                            <div className={`
                                 px-3 py-1 w-fit rounded-full h-fit
                                ${x.status === "expected" ? "text-accent-blue bg-accent-blue/30" : "text-green-800 bg-green-300"}

                            `}>
                                <span className={`
                                    text-[10px] block
                                `}>
                                    {x.status}
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