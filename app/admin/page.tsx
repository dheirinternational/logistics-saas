"use client"

// import PendingAlerts from '@/components/admin/PendingAlerts'
import QuickActionsBtn from '@/components/admin/QuickActionsBtn'
// import RecentActivity from '@/components/admin/RecentActivity'
// import RecentShipmentCard from '@/components/admin/RecentShipmentCard'
// import RevenueSnapshot from '@/components/admin/RevenueSnapshot'
import StatusStatCard from '@/components/admin/StatusStatCard'
import { buttonsProps } from '@/components_map_definitions/quickActionsBtns'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { BiCheck, BiExport } from 'react-icons/bi'
import { FaCheckCircle, FaTruck } from 'react-icons/fa'
import { Fa42Group, FaShip } from 'react-icons/fa6'
import { FcProcess } from 'react-icons/fc'
// import { GrDeliver } from 'react-icons/gr'
import { toast } from 'react-toastify'


type ShipmentCount = {
    total_active_count: number,
    processing: number,
    shipped: number,
    in_transit: number,
    delivered: number 
}


const Page: NextPage = () => {

    const [shipmentCounts, setShipmentCounts] = useState<ShipmentCount | null>(null)

    
    useEffect(() => {

        // Fetch Active shipments records
        const fetchActiveShipmentRecords = async () => {
            try{
                const shipmentCountRes = await fetch(`/api/shipments/count`)
                const shipmentCountResult = await shipmentCountRes.json()
                
                console.log(shipmentCountResult)
                setShipmentCounts(shipmentCountResult.data)
    
            }
            catch(err){
                console.error("ERR:: Fetching shipment result count", err)
                toast.error("ERR:: Fetching shipment result count")
            }
        }

        fetchActiveShipmentRecords()

    }, [])
    
    


  return (
    <div className='max-h-[calc(100dvh-56px)] h-[calc(100dvh-56px)] overflow-y-auto p-body space-y-4'>

        {/* System Snapshot */}
        <div className='bg-accent-blue p-4 rounded-lg text-white relative'>
            <span className=' text-xs'>
                System Snapshot
            </span>
            <h3 className='font-bold text-4xl mt-4'>
                {shipmentCounts?.total_active_count}
            </h3>
            <p className='text-sm opacity-80 mt-1'>
                Total active shipment record
            </p>
            <div className='flex items-center gap-x-2 text-xs bg-black/70 w-fit px-3 rounded-full py-1 absolute right-4 bottom-4'>
                <div className='w-2 h-2 bg-white rounded-full'/>
                <span>live</span>
            </div>
        </div>

        {/* Stats */}
        <div>
            <div className='flex justify-between items-center'>
                <h2 className='font-bold text-sm'>
                    STATS <span className='text-[10px]'>(today)</span>
                </h2>
                <button className='text-xs font-bold'>
                    See all
                </button>
            </div>
            
            {/* STATS Components Ctn */}
            <div className='flex my-body space-x-2 overflow-x-auto'>
                <StatusStatCard count={shipmentCounts?.processing || 0} status='processing' icon={FcProcess} />
                <StatusStatCard count={shipmentCounts?.shipped || 0} status="shipped" icon={BiExport} />
                <StatusStatCard count={shipmentCounts?.in_transit || 0} status='in_transit' icon={FaTruck} />
                <StatusStatCard count={shipmentCounts?.delivered || 0} status='delivered' icon={FaCheckCircle} />
            </div>
        </div>

        {/* QuicK actions */}

        <div className='p-body bg-light rounded-lg space-y-body'>
            <div className='flex justify-between'>
                <h2 className='text-sm font-bold'>
                    Quick Actions
                </h2>
                {/* ? <button className='text-xs'>See all</button> */}
            </div>

            {/* Actions button container */}
            <div className='flex justify-center gap-3'>
                {buttonsProps.map( (button, i) => 
                    <QuickActionsBtn key={i} {...button} />
                )}
            </div>
        </div>

        {/* View Recent Shipments */}
        {/* <div className='p-body bg-light rounded-lg space-y-body'>
            <div className='flex justify-between items-center'>
                <h2 className='text-sm font-bold'>
                    Recent Shipments
                </h2>
                <button className='text-xs'>
                    see all
                </button>
            </div>
            <div className='h-70 max-h-70 space-y-2 overflow-auto'>
                <RecentShipmentCard />
                <RecentShipmentCard />
                <RecentShipmentCard />
                <RecentShipmentCard />
                <RecentShipmentCard />
            </div>
        </div> */}

        {/* STATUS OVERVIEW */}

        {/* <div className='p-body bg-light rounded-lg space-y-body'>
            <h2 className='text-sm font-bold'>
                Status Overview
            </h2>
            <div>
                chart
            </div>
        </div> */}

        {/* Recent Activity */}

        {/* <div className='p-body bg-light rounded-lg space-y-body'>
            <h2 className='text-sm font-bold'>
                Recent Activity
            </h2>

            <div className=' h-25 max-h-25 overflow-y-auto pl-[8.5px] relative space-y-2.5'>
                <div className='absolute h-full w-0 border-l border-accent-red/80 left-3 z-10 '/>
                <RecentActivity />
                <RecentActivity />
                <RecentActivity />
                <RecentActivity />
                <RecentActivity />
            </div>
        </div> */}

        {/* <div className='p-body bg-light rounded-lg space-y-body'> 
            <h2 className='text-sm font-bold'>
                Pending Alerts
            </h2>
            <div className='space-y-2 h-47 max-h-47 min-h-47 overflow-y-scroll'>
                <PendingAlerts/>
                <PendingAlerts/>
                <PendingAlerts/>
                <PendingAlerts/>
                <PendingAlerts/>
                <PendingAlerts/>
                <PendingAlerts/>
            </div>
        </div> */}

        {/* <div className='p-body bg-light rounded-lg space-y-body'>  
            <h2 className='text-sm font-bold'>
                Revenue Snapshot
            </h2>
            <div className='flex gap-2'>
                <RevenueSnapshot />
                <RevenueSnapshot />
                <RevenueSnapshot />
            </div>
        </div> */}

    </div>
  )
}

export default Page