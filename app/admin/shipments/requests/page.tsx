"use client"

import SearchComponent from '@/components/admin/shipments/requests/SearchComponent'
import { Table } from '@/components/admin/table/Table'
import { ShipmentImage, ShippingRequest } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { BiCheck } from 'react-icons/bi'
import { FaImage } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import { IconChecks, IconClock } from "@tabler/icons-react"

export type SearchProps = {
    search: string,
    status: string,
    warehouse_id: string
}

const columnHelper = createColumnHelper<ShippingRequest>()


const Page: NextPage = () => {

    const router = useRouter()

    const [shipmentRequests, setShipmentRequests] = useState<ShippingRequest[]>([])



    const [totalPrice, setTotalPrice] = useState("") 
    const [totalWeight, setTotalWeight] = useState("")
    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])



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


    // handle image selection
    const hanldeImageChange = (e:ChangeEvent<HTMLInputElement>) => {

        if(!e.target.files) return

        const files = Array.from(e.target.files)

        if(files.length < 1){
            toast.error("Select Images")
            return
        }

        const urls = files.map( file => URL.createObjectURL(file) )
        setPreviews(urls)
        setImages(files)
    }




    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsCreatingShipmentData(true)
        const formData = new FormData(e.currentTarget)

        images.forEach((image) => {
            formData.append("images", image)
        })

        formData.append("customer_code", modalSelectedRequest?.customer_code || "")
        formData.append("origin_warehouse_id", "1")
        formData.append("destination_warehouse_id", "2")
        formData.append("channel", modalSelectedRequest?.channel || "")
        formData.append("shipment_request_id", modalSelectedRequest?.id || "")
        formData.append("shipment_request_id", modalSelectedRequest?.id || "")
        formData.append("shipment_note", modalSelectedRequest?.customer_note || "")
        formData.append("user_id", `${modalSelectedRequest?.user_id}` || "")
        formData.append("payment_time", `${modalSelectedRequest?.payment_time}` || "")
        formData.append("package_ids", `${modalSelectedRequest?.package_ids}` || "")

        console.log(Object.fromEntries(formData))

        if(Number(formData.get("total_price") || 0) < 1 || Number(formData.get("total_weight") || 0.01) < 0.01){
            toast.error("Input Price and Weight")
            setIsCreatingShipmentData(false)
            return 
        }



        try{
            const res = await fetch(`/api/shipments`, {
                method: "POST",
                body: formData
            })
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Shipment created")
            fetchShipmentData()
        }
        catch(err: any){
            console.error(err.message, err)
            toast.error(err.message)
        }
        finally{
            setIsCreatingShipmentData(false)
            setIsModalActive(false)
            setModalSelectedRequest(null)
            setImages([])
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
        columnHelper.accessor("packaging", {
            header: "Packaging type"
        }),
        columnHelper.accessor("created_at", {
            header: "Requested at",
            cell: ({getValue}) => <p>{new Date(getValue()).toDateString()}</p>,
        }),
        columnHelper.display({
            id: "Details",
            cell: ({row}) => 
            <button 
            className={`portal-home__table-btn${row.original.status === "accepted" ? " hidden" : ""}`}
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

  return (
    <div className="portal-home">
      {isDataLoading ? (
        <div className="portal-home__panel portal-home__loader">
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : (
        <>
          <div className="portal-home__stats" role="list" aria-label="Shipment requests status">
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconClock size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Pending</span>
                <span className="portal-home__stat-card-value">
                  {shipmentRequests.filter((x) => x.status === "pending").length}
                </span>
              </span>
            </div>
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconChecks size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Accepted</span>
                <span className="portal-home__stat-card-value">
                  {shipmentRequests.filter((x) => x.status === "accepted").length}
                </span>
              </span>
            </div>
          </div>

          <section className="portal-home__panel" aria-label="Filters">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Filters</h2>
              </div>
            </div>
            <SearchComponent state={filterValues} setState={setFilterValues} />
          </section>

          <section className="portal-home__panel" aria-labelledby="shipment-requests-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="shipment-requests-heading" className="portal-home__section-title">
                  Shipment records
                </h2>
                <p className="portal-home__section-sub">
                  A live overview of all shipment requests in the system.
                </p>
              </div>
            </div>
            {shipmentRequests ? (
              <Table
                importedData={data}
                columnDef={shipmentRequestColumnDef}
                globalFilter={`${filterValues.search}`}
                pageSize={15}
              />
            ) : null}
          </section>



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
                    <div className='text-[10px] p-4 space-y-3'>
                        <p><span className='font-semibold'>Requested At:</span> {new Date(modalSelectedRequest?.created_at || "").toDateString()}</p>
                        <p className='space-x-2'>
                            <span className='font-semibold'>Product Ids:</span> 
                            <span className='space-x-2'> 
                                {modalSelectedRequest?.package_ids.map((x, i)=> <span key={x}>{x}{i !== modalSelectedRequest.package_ids.length - 1 && ","}</span>)}
                            </span>
                        </p>
                        <p><span className='font-semibold'>Channel Requested:</span> {modalSelectedRequest?.channel}</p>
                        <p><span className='font-semibold'>Customer Code:</span> {modalSelectedRequest?.customer_code}</p>
                        <p><span className='font-semibold'>Payment Time:</span> {modalSelectedRequest?.payment_time}</p>
                        <p><span className='font-semibold'>Packaging Type:</span> {modalSelectedRequest?.packaging}</p>

                        <form onSubmit={handleSubmit} className='space-y-2'>

                            <label className='text-[10px] flex gap-2 items-center'>
                                Total Price
                                <input 
                                type="number" 
                                value={totalPrice}
                                name='total_price'
                                onChange={(e) => {
                                    let { value } = e.currentTarget
                                    // remove leading zeros but keep single zero
                                    value = value.replace(/^0+(?=\d)/, "")

                                    setTotalPrice(String(Number(value).toFixed(2)))
                                }
                                }
                                min={0}
                                step="0.01"
                                className='border border-dark/10 rounded px-2 py-1 outline-0'
                                />
                            </label>

                            <label className='text-[10px] flex gap-2 items-center'>
                                Weight {`(${modalSelectedRequest?.channel === "sea" ? "cbm" : "kg"})`}
                                <input 
                                type="number" 
                                value={totalWeight}
                                name='total_weight'
                                onChange={(e) => {
                                    let { value } = e.currentTarget
                                    // remove leading zeros but keep single zero
                                    value = value.replace(/^0+(?=\d)/, "")

                                    setTotalWeight(String(Number(value).toFixed(2)))
                                }}
                                min={0}
                                step="0.01"
                                className='border border-dark/10 rounded px-2 py-1 outline-0'
                                />
                            </label>
                            <div className='mt-3 space-y-1'>
                                <span>Customer Note</span>
                                <p className='border border-dark/20 h-16 mt-2 p-3 rounded-lg overflow-y-auto'>
                                    {modalSelectedRequest?.customer_note}
                                </p>
                            </div>


                            <div>
                                <div className="w-fit h-fit overflow-hidden max-w-fit max-h-fit relative rounded">
                                    <button 
                                    className="text-[10px] border border-dark/30 rounded px-4 py-2 flex gap-1 items-center relative z-100"
                                    type="button"
                                    >
                                        Select Images
                                        <FaImage />
                                    </button>
                                    <input 
                                    type="file" 
                                    accept="image/*"
                                    multiple
                                    name="images"
                                    onChange={hanldeImageChange}
                                    className="w-full h-full bg-red-400 absolute z-1000 top-0 left-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="border border-dark/40 rounded py-2 mt-4">
                                    <div className="flex justify-center w-full gap-4 max-w-full overflow-x-auto">
                                        {previews.map( (x, i) => 
                                        <figure key={i} className="w-10 h-10 bg-accent-red rounded overflow-hidden relative">
                                            <Image
                                                src={x}
                                                alt=""
                                                fill
                                                className="object-fill"
                                                />
                                            </figure>
                                        )}
                                    </div>
                                </div>
                            </div>      

                        


                            {/* Submit button */}

                            <div className='flex justify-end mt-14'>
                                <button 
                                disabled={isCreatingShipmentData}
                                className='bg-accent-blue text-white px-3 py-2 rounded flex gap-1 items-center'
                                // onClick={async() => {
                                //     await createShipment()
                                // }}
                                >
                                    {
                                        isCreatingShipmentData ? 
                                        <DheirLoader color='#FFF' size={10}/> :
                                        <>
                                        <BiCheck className='text-lg'/>
                                        Accept
                                        </>
                                    }
                                </button>
                            </div>
                        </form>

                        
                    </div>

                    
                </div>
            </div>
        }
    </>
  )}
  </div>
  )
}

export default Page