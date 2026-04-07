"use client"

import SearchComponent from '@/components/admin/shipments/requests/SearchComponent'
import ShipmentStatusStatCard from '@/components/admin/ShipmentStatusStatCard'
import { Table } from '@/components/admin/table/Table'
import { generateTrackingNumber } from '@/lib/generators/generateTrackingNumber'
import { ShippingRequest } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { create } from 'domain'
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BiCheck } from 'react-icons/bi'
import { FaCheckCircle, FaClock } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

export type SearchProps = {
    search: string,
    status: "pending" | "approved",
    warehouse_id: number
}

const columnHelper = createColumnHelper<ShippingRequest>()


const Page: NextPage = () => {

    const [shipmentRequests, setShipmentRequests] = useState<ShippingRequest[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [isCreatingShipmentData, setIsCreatingShipmentData] = useState(false)
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        warehouse_id: 0,
        status: "pending"
    })
    const [isModalActive, setIsModalActive] = useState(false)

    const router = useRouter()


    const [modalSelectedRequest, setModalSelectedRequest] = useState<null | ShippingRequest>(null)

    const createShipment = async () => {
        setIsCreatingShipmentData(true)
        try{
            const res = await fetch("/api/shipments", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    customer_code: modalSelectedRequest?.customer_code,
                    origin_warehouse_id: 1,
                    destination_warehouse_id: 2,
                    channel: modalSelectedRequest?.channel,
                    total_cost: 50000,
                    shipment_request_id: modalSelectedRequest?.id,
                    shipment_note: modalSelectedRequest?.shipping_note,
                    user_id: modalSelectedRequest?.user_id,
                    payment_time: modalSelectedRequest?.payment_time,
                    package_ids: modalSelectedRequest?.package_ids
                })
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Shipment Initialized Succesfully")
            router.refresh()

        }
        catch(err){
            console.error("ERR:: creating shipment", err)
            toast.error("ERR:: creating shipment")
        }
        finally{
            setIsCreatingShipmentData(false)
            setIsModalActive(false)
        }
    }


    const shipmentRequestColumnDef = [
        columnHelper.accessor("id", {
            header: "Id"
        }),
        columnHelper.accessor("customer_code", {
            header: "Customer Code"
        }),
        columnHelper.accessor("channel", {
            header: "Channel"
        }),
        columnHelper.display({
            header: "No. Of Packages",
            cell: ({row}) => <p>{row.original.package_ids.length}</p>
        }),
        columnHelper.accessor("status", {
            header: "Status"
        }),
        columnHelper.display({
            id: "Details",
            cell: ({row}) => 
            <button 
            className={`${row.original.status === "accepted" && "hidden"}`}
            onClick={() => {
                setModalSelectedRequest(row.original)
                setIsModalActive(true)
            }}>
                View Request
            </button>
        })
    ]

    useEffect(() => {
        const fetchShipmentData = async () => {
            try{
                const res = await fetch(`/api/shipment-requests`, {
                    method: "GET",
                    credentials: "include"
                })

                const data = await res.json()
                
                if(!res.ok){
                    toast.error(data.message)
                    return
                }

                setShipmentRequests(data.data)
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

    const data = shipmentRequests.filter( x => x.status === filterValues.status )

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
                value={shipmentRequests.filter(x => x.status === "pending").length}
                status='Pending'
                icon={FaClock}
                />
                <ShipmentStatusStatCard 
                value={shipmentRequests.filter(x => x.status === "accepted").length}
                status='Accepted'
                icon={FaCheckCircle}
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
                    shipmentRequests ?
                    <Table 
                    importedData={data}
                    columnDef={shipmentRequestColumnDef}
                    globalFilter={`${filterValues.search}`}
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
                        disabled={isCreatingShipmentData}
                        onClick={() => setIsModalActive(false)}>
                            <FaX/>
                        </button>
                    </div>
                    <hr className='border-dark/20 my-3'/>
                    <div className='space-y-2'>
                        <p><span className='font-semibold'>Requested At:</span> {new Date(modalSelectedRequest?.created_at || "").toDateString()}</p>
                        <p className='space-x-2'>
                            <span className='font-semibold'>Product Ids:</span> 
                            <span className='space-x-2'>
                                {modalSelectedRequest?.package_ids.map((x, i)=> <span key={x}>{x}{i !== modalSelectedRequest.package_ids.length - 1 && ","}</span>)}
                            </span>
                        </p>
                        <p><span className='font-semibold'>Channel Requested:</span> {modalSelectedRequest?.channel}</p>
                        <p><span className='font-semibold'>Customer Code:</span> {modalSelectedRequest?.customer_code}</p>
                        <p><span className='font-semibold'>Package Wrapping:</span> {modalSelectedRequest?.wrapping}</p>
                        <p><span className='font-semibold'>Payment Time:</span> {modalSelectedRequest?.payment_time} shipping</p>
                        <div className='mt-3 space-y-1'>
                            <span>Customer Note</span>
                            <p className='border border-dark/20 h-26 mt-2 p-3 rounded-lg overflow-y-auto'>
                                {modalSelectedRequest?.shipping_note}
                            </p>
                        </div>
                    </div>

                    <div className='flex justify-end mt-2'>
                        <button 
                        disabled={isCreatingShipmentData}
                        className='bg-accent-blue text-white px-3 py-2 rounded flex gap-1 items-center'
                        onClick={async() => {
                            await createShipment()
                        }}
                        >
                            {
                                isCreatingShipmentData ? 
                                <BeatLoader color='#FFF' size={10}/> :
                                <>
                                <BiCheck className='text-lg'/>
                                Accept
                                </>
                            }
                        </button>
                    </div>
                </div>
            </div>
        }

    </>}
  </div>
}

export default Page