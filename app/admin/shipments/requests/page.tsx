"use client"

import SearchComponent from '@/components/admin/shipments/requests/SearchComponent'
import ShipmentStatusStatCard from '@/components/admin/ShipmentStatusStatCard'
import { Table } from '@/components/admin/table/Table'
import { ShippingRequest } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
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
    status: string,
    warehouse_id: string
}

const columnHelper = createColumnHelper<ShippingRequest>()


const Page: NextPage = () => {

    const router = useRouter()

    const [totalPrice, setTotalPrice] = useState(0) 
    const [totalWeight, setTotalWeight] = useState(0)
    const [shipmentRequests, setShipmentRequests] = useState<ShippingRequest[]>([])

    const [isDataLoading, setIsDataLoading] = useState(true)
    const [isCreatingShipmentData, setIsCreatingShipmentData] = useState(false)
    const [isModalActive, setIsModalActive] = useState(false)
    
    
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        warehouse_id: "",
        status: ""
    })

    const [modalSelectedRequest, setModalSelectedRequest] = useState<null | ShippingRequest>(null)

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

    const createShipment = async () => {

        if(totalWeight < 1 || totalWeight < 1){
            toast.error("Input Price and Weight")
            return 
        }

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
                    wrapping: modalSelectedRequest?.wrapping,
                    shipment_request_id: modalSelectedRequest?.id,
                    shipment_note: modalSelectedRequest?.shipping_note,
                    user_id: modalSelectedRequest?.user_id,
                    payment_time: modalSelectedRequest?.payment_time,
                    package_ids: modalSelectedRequest?.package_ids,
                    total_weight: totalWeight,
                    price: totalPrice
                })
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Shipment Initialized Succesfully")
            fetchShipmentData()
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
        columnHelper.accessor("total_weight", {
            header: "Total Weight",
            cell: ({getValue}) => <p>{getValue()} kg</p>,
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
    
        fetchShipmentData()
    
    }, [])

    const data = shipmentRequests.filter( x => x.status.toLowerCase().includes(filterValues.status.toLowerCase()))

  return <div className='space-y-body'>
    {isDataLoading ? <div className='h-full max-h-full center-items'>
        <BeatLoader color='#f26430' size={10}/>
    </div> :
    
    <>
        {/* STATUS CARDS */}
        <div>
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

                        <div className='space-y-2'>

                            <label className='text-[10px] flex gap-2 items-center'>
                                Total Price
                                <input 
                                type="number" 
                                value={totalPrice}
                                onChange={(e) => {setTotalPrice(Number(e.currentTarget.value))}}
                                min={0}
                                className='border border-dark/10 rounded px-2 py-1 outline-0'
                                />
                            </label>

                            <label className='text-[10px] flex gap-2 items-center'>
                                Weight (kg)
                                <input 
                                type="number" 
                                value={totalWeight}
                                onChange={(e) => {setTotalWeight(Number(e.currentTarget.value))}}
                                min={0}
                                className='border border-dark/10 rounded px-2 py-1 outline-0'
                                />
                            </label>

                        </div>

                        <div className='mt-3 space-y-1'>
                            <span>Customer Note</span>
                            <p className='border border-dark/20 h-16 mt-2 p-3 rounded-lg overflow-y-auto'>
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