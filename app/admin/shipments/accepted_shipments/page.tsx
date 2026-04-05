"use client"

import SearchComponent from '@/components/admin/shipments/SearchComponent'
import ShipmentStatusStatCard from '@/components/admin/ShipmentStatusStatCard'
import { Table } from '@/components/admin/table/Table'
import { generateTrackingNumber } from '@/lib/generators/generateTrackingNumber'
import { Shipment } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { FaInbox, FaMoneyBillWave, FaShippingFast, FaTruck } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
import { FcProcess } from 'react-icons/fc'
import { MdDoneAll, MdOutbox } from 'react-icons/md'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

export type SearchProps = {
    search: string,
    status: "expected" | "received",
}

const columnHelper = createColumnHelper<Shipment>()


const Page: NextPage = () => {

    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        status: "expected"
    })
    const [isModalActive, setIsModalActive] = useState(false)


    const [modalSelectedShipment, setModalSelectedShipmodalSelectedShipment] = useState<null | Shipment>(null)



    const shipmentRequestColumnDef = [
        columnHelper.accessor("tracking_number", {
            header: "Tracking Number"
        }),
        columnHelper.accessor("customer_code", {
            header: "Customer Code"
        }),
        columnHelper.accessor("channel", {
            header: "Channel"
        }),
        columnHelper.accessor("status", {
            header: "Status"
        }),
        columnHelper.display({
            id: "Details",
            cell: ({row}) => 
            <button 
            onClick={() => {
                setModalSelectedShipmodalSelectedShipment(row.original)
                setIsModalActive(true)
            }}>
                View Shipment
            </button>
        })
    ]

    generateTrackingNumber()


    useEffect(() => {
        const fetchShipmentData = async () => {
            try{
                const res = await fetch(`/api/shipments`, {
                    method: "GET",
                    credentials: "include"
                })

                const data = await res.json()
                
                if(!res.ok){
                    toast.error(data.message)
                    return
                }

                setShipments(data.data)
            }
            catch(err){
                toast.error("Cannot fetch Shipment Data")
                console.error(err)
            }
            finally{
                setIsDataLoading(false) 
            }
        }

        fetchShipmentData()
    
    }, [])


  return <div className='space-y-body'>
    {isDataLoading ? <div className='w-screen h-[calc(100dvh-80px)] center-items'>
        <BeatLoader color='#f26430' size={20}/>
    </div> :
    <>
        <div className='p-4 bg-accent-red rounded-lg text-white'>
            <span className='text-xs opacity-80'>
                Admin/Operations
            </span>
            <h1 className='font-bold mt-4 mb-2 text-xl'>
                Manage Shipments
            </h1>
            <div>
                <p className='text-[10px] opacity-70'>
                    Monitor, filter, and manage all outgoing shipments from one control deck.
                </p>
            </div>
        </div>

        {/* ADD SHIPMENT BUTTON */}
        {/* <div className='bg-light rounded-lg '>
            <Link href={'/admin/shipments/create_shipment'} className='rounded-lg border border-dark/20 flex w-full items-center justify-center gap-3 text-sm py-3 font-bold'>
                <FaPlus/>
                Create Shipment
            </Link>
        </div> */}

        {/* STATUS CARDS */}
        <div>
            <h2 className='text-sm'>
                STATS
            </h2>
            <div className='flex my-body space-x-2 overflow-x-auto'>
                <ShipmentStatusStatCard 
                value={shipments.filter(x => x.status === "processing").length}
                status='Processing'
                icon={FcProcess}
                />
                <ShipmentStatusStatCard 
                value={shipments.filter(x => x.status === "shipped").length}
                status='Shipped'
                icon={FaShippingFast}
                />

                <ShipmentStatusStatCard 
                value={shipments.filter(x => x.status === "in_transit").length}
                status='In transit'
                icon={FaTruck}
                />
                <ShipmentStatusStatCard 
                value={shipments.filter(x => x.status === "arrived_nigeria").length}
                status='Arrived'
                icon={FaInbox}
                />
                <ShipmentStatusStatCard 
                value={shipments.filter(x => x.status === "pending_payment").length}
                status='Pending Payment'
                icon={FaMoneyBillWave}
                />
                <ShipmentStatusStatCard 
                value={shipments.filter(x => x.status === "out_for_delivery").length}
                status='Out For Delivery'
                icon={MdOutbox}
                />
                <ShipmentStatusStatCard 
                value={shipments.filter(x => x.status === "delivered").length}
                status='Delivered'
                icon={MdDoneAll}
                />
            </div>
        </div>

        {/* SEARCH COMPONENT  */}
        <SearchComponent state={filterValues} setState={setFilterValues} />

        {/* Table */}
        <div className='bg-light p-body rounded-lg'>
            <h2 className='text-sm font-bold'>
                Shipment Records
            </h2>
            <p className='text-xs mt-2 opacity-70'>
                A live overview of all shipments in the system.
            </p>
            <div className='mt-4'>
                {
                    shipments ?
                    <Table 
                    importedData={shipments}
                    columnDef={shipmentRequestColumnDef}
                    /> : null
                }
            </div>
        </div>
        {
            isModalActive &&
            <div className={`fixed w-screen h-dvh bg-dark/20 top-0 right-0 z-1000 center-items text-xs`}>
                <div className='bg-white p-4 rounded max-w-100 w-[90%] h-fit shadow shadow-dark/20'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-sm font-semibold'>
                            Request Details
                        </h2>
                        <button 
                        onClick={() => setIsModalActive(false)}>
                            <FaX/>
                        </button>
                    </div>
                    <hr className='border-dark/20 my-3'/>
                    <div className='space-y-2'>
                        <p><span className='font-semibold'>Tracking Number:</span> {modalSelectedShipment?.tracking_number}</p>
                        <p><span className='font-semibold'>Requested At:</span> {new Date(modalSelectedShipment?.created_at || "").toDateString()}</p>
                        <p><span className='font-semibold'>Channel Requested:</span> {modalSelectedShipment?.channel}</p>
                        <p><span className='font-semibold'>Customer Code:</span> {modalSelectedShipment?.customer_code}</p>
                        <p><span className='font-semibold'>Total Cost:</span> ₦ {modalSelectedShipment?.total_cost}</p>
                        <div className='mt-3 space-y-1'>
                            <span>Customer Note</span>
                            <p className='border border-dark/20 h-26 mt-2 p-3 rounded-lg overflow-y-auto'>
                                {modalSelectedShipment?.shipping_note}
                            </p>
                        </div>
                        t
                    </div>

                    <div className='mt-4 mb-8'>
                        {/* <InputComponent
                        name='status'
                        
                        /> */}
                    </div>
                
                </div>
            </div>
        }

    </>}
  </div>
}

export default Page