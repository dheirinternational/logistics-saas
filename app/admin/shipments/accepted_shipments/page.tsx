"use client"

import SearchComponent from '@/components/admin/shipments/accepted/SearchComponent'
import InputComponent from '@/components/admin/shipments/InputComponent'
import ShipmentStatusStatCard from '@/components/admin/ShipmentStatusStatCard'
import { Table } from '@/components/admin/table/Table'
import { generateTrackingNumber } from '@/lib/generators/generateTrackingNumber'
import { Shipment } from '@/types/entityTypeDef'
import { ShipmentStatus } from '@/types/statusTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaInbox, FaShippingFast, FaTruck } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
import { FcProcess } from 'react-icons/fc'
import { MdDoneAll, MdOutbox } from 'react-icons/md'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

export type SearchProps = {
    search: string,
    status: ShipmentStatus,
}

type currentSelectedStatus = {
    status: ShipmentStatus | ""
}

const columnHelper = createColumnHelper<Shipment>()


const Page: NextPage = () => {

    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        status: "processing"
    })
    const [isModalActive, setIsModalActive] = useState(false)
    
    
    const [modalSelectedShipment, setModalSelectedShipmodalSelectedShipment] = useState<null | Shipment>(null)
    const [currentStatus, setCurrentStatus] = useState<currentSelectedStatus>({
        status: ""
    })

    const [isUpdatingShipmentStatus, setIsUpdatingShipmentStatus] = useState(false)

    const router = useRouter()

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
        columnHelper.accessor("payment_time", {
            header: "Payment Time"
        }),
        columnHelper.accessor("paid_for", {
            header: "Paid For",
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


    const updateShipmentStatus = async() => {
        setIsUpdatingShipmentStatus(true)
        try{
            const res = await fetch(`/api/shipments/shipment-status/${modalSelectedShipment?.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    status: currentStatus.status
                })
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Shipment Status successfully updated")
            router.refresh()

        }
        catch(err){
            toast.error("ERR:: Updating shipment Status")
            console.error(err)
        }
        finally{
            setIsUpdatingShipmentStatus(false)
        }
    }

    const data = shipments.filter( x => x.status === filterValues.status )


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
                value={shipments.filter(x => x.status === "arrived").length}
                status='Arrived'
                icon={FaInbox}
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
                    importedData={data}
                    columnDef={shipmentRequestColumnDef}
                    globalFilter={filterValues.search}
                    /> : null
                }
            </div>
        </div>


        {/* EDIT MODAL */}

        {
            isModalActive &&
            <div className={`fixed w-screen h-dvh bg-dark/20 top-0 right-0 z-1000 center-items text-xs`}>
                <div className='bg-white p-4 rounded max-w-100 w-[90%] h-fit shadow shadow-dark/20'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-sm font-semibold'>
                            Shipment Details
                        </h2>
                        <button 
                        disabled={isUpdatingShipmentStatus}
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
                        <p><span className='font-semibold'>User ID:</span> {modalSelectedShipment?.user_id}</p>
                        <div className='mt-3 space-y-1'>
                            <span>Customer Note</span>
                            <p className='border border-dark/20 h-26 mt-2 p-3 rounded-lg overflow-y-auto'>
                                {modalSelectedShipment?.shipping_note}
                            </p>
                        </div>
                    </div>

                    <div className='mt-4 mb-8'>
                        <div className='mb-3 flex items-center'>
                            Current Status: &nbsp; 
                            <p className='w-fit py-2 px-3 bg-accent-blue/20 rounded-full'>
                                {modalSelectedShipment?.status}
                            </p>
                        </div>
                        <InputComponent
                        name="status" 
                        type="text" 
                        state={currentStatus} 
                        setState={setCurrentStatus}
                        readonly
                        select
                        selectValues={[
                            {name: "Processing", value: "processing"}, 
                            {name: "In Transit", value: "in_transit"},
                            {name: "Shipped", value: "shipped"},
                            {name: "Arrived", value: "arrived"},
                            {name: "Out For Delivery", value: "out_for_delivery"},
                            {name: "Delivered", value: "delivered"}
                        ]}
                        />
                        <div className='flex justify-end'>
                            {
                                currentStatus.status && 
                                <button 
                                onClick={async () => {
                                    try{

                                        if(modalSelectedShipment?.status === currentStatus.status){
                                            toast.info("No changes made to shipment status")
                                            return
                                        }

                                        if(modalSelectedShipment?.payment_time === "before" && currentStatus.status !== "processing" && modalSelectedShipment.paid_for === false){
                                            toast.error("Invalid status update. Payment is required before processing.")
                                            return
                                        }

                                        if(modalSelectedShipment?.payment_time === "after" && ["out_for_delivery", "delivered"].includes(currentStatus.status) && modalSelectedShipment.paid_for === false){
                                            toast.error("Invalid status update. Payment is required before marking shipment as out for delivery or delivered.")
                                            return
                                        }

                                        await updateShipmentStatus()

                                    }
                                    catch(err){
                                        toast.error("ERR:: Updating Shipment Status")
                                        console.error(err)  
                                    }  
                                }}
                                disabled={isUpdatingShipmentStatus}
                                className='bg-accent-blue text-white px-4 py-2 rounded mt-2'
                                >
                                    {
                                        isUpdatingShipmentStatus ? 
                                        <BeatLoader color='#FFF' size={10} speedMultiplier={0.5}/> :
                                        "Update"
                                    }
                                </button>
                            }
                        </div>
                    </div>
                
                </div>
            </div>
        }

    </>}
  </div>
}

export default Page