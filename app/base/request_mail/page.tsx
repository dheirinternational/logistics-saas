"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import RequestMailProduct from '@/components/base/RequestMailProduct'
import { Package } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = () => {


    const [packages, setPackages] = useState<Package[]>([])
    const [selectedPackages, setSelectedPackages] = useState<Package[]>([])
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [isPostingData, setIsPostingData] = useState(false)
    const [isConfirmModal, setIsConfirmModal] = useState(false)
    const [shippingMethod, setShippingMethod] = useState<"air" | "sea" | "express">("air")
    const [shippingPayment, setShippingPayment] = useState<"pay_before_shipment" | "pay_after_shipment">("pay_before_shipment")

    const [filterValues, setFilterValues] = useState({
        warehouse_id: "",
        tracking_id: "" 
    })


    const router = useRouter()

  

    const fetchPackages = async () => {
        setIsDataLoading(true)
        try{
            const res = await fetch("/api/packages/user")
            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            setPackages(result.data)
        }
        catch(err){
            console.error("ERR Fetching packages", err)
            toast.error("ERR fetchng packages")
            return
        }
        finally{
            setIsDataLoading(false)
        }
    }


    const handleSubmit = async (packagingOption: string, customerNote: string) => {

        if(customerNote.trim().length === 0){
            toast.info("Put in note for shipping in customer note")
            return
        }

        setIsPostingData(true)
        try{
            const res = await fetch("/api/shipment-requests", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    package_ids: selectedPackages.map( x => x.id ),
                    user_id: selectedPackages[0].user_id,
                    customer_code: selectedPackages[0].customer_code,
                    channel: shippingMethod,
                    payment_time: shippingPayment,
                    total_weight: selectedPackages.reduce((acc, pack) => acc + pack.weight, 0),
                    customer_note: customerNote,
                    packaging: packagingOption
                })
            })
            const result = await res.json()

            if (!res.ok){
                toast.error(result.message)
                return
            }

            fetchPackages()
            toast.success("Shipment Request Successfully made")
        }
        catch(err){ 
            toast.error("ERR:: making shipment request");
            console.error("ERR:: making shipment request", err)
        }
        finally{
            setIsPostingData(false)
            setIsConfirmModal(false)
        }
    }



    // Fetch Packages
    useEffect(() => {
   
        fetchPackages()
        
    }, [])

    const data = packages
        .filter( x => x.incoming_package_id.toLowerCase().includes(filterValues.tracking_id.toLowerCase()) || x.package_name.toLowerCase().includes(filterValues.tracking_id.toLowerCase()))
        .filter(x => x.status === "stored")

  return <div className='h-full w-full space-y-2'>
    {/* Header */}
    <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
        <button 
        className='flex flex-1 justify-start w-fit gap-1'
        onClick={() => {router.back()}}
        >
            <span className='text-xs font-semibold'>
                Go Back
            </span>
        </button>
        <h1 className='font-semibold'>
            Request Mail
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>


    {/* Search Component */}
    <div className='bg-white p-4 flex flex-col gap-2'> 
        <div className='w-40 -mt-2'>

        </div>
        <div className='flex items-center text-xs gap-1'>
            <InputComponent
            name='tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Tracking Id, package name...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white rounded'>
                Search
            </button>
        </div>
    </div>


    {/* Input Fields */}
    <div className='bg-light px-4 py-2'>
        <span className='text-xs'>
            Selected Packages: <span className='text-accent-red font-bold text-sm'>{selectedPackages.length}</span> 
        </span>
        
        {/* Shipping method */}
        <fieldset className='text-xs flex gap-4 mt-2'>
            <span>Shipping Method :</span>
            <label className='flex items-center gap-2'>
                <span>Air</span>
                <input 
                type="radio" 
                name='shipping'
                value={"air"}
                checked={shippingMethod === "air"}
                onChange={(e) => setShippingMethod(e.target.value as "air")}
                />
            </label>
            <label className='flex items-center gap-2'>
                <span>Sea</span>
                <input 
                type="radio" 
                name='shipping'
                value={"sea"}
                checked={shippingMethod === "sea"}
                onChange={(e) => setShippingMethod(e.target.value as "sea")}
                />
            </label>
            <label className='flex items-center gap-2'>
                <span>Express</span>
                <input 
                type="radio" 
                name='shipping'
                value={"express"}
                checked={shippingMethod === "express"}
                onChange={(e) => setShippingMethod(e.target.value as "express")}
                />
            </label>
            
        </fieldset>

        {/* Payment Type */}
        <fieldset className='text-xs flex gap-2 mt-2'>
            <span className='whitespace-nowrap'>Payment Time:</span>
            <label className='flex items-center gap-2'>
                <span className='whitespace-nowrap'>Pay Before Shipment</span>
                <input 
                type="radio" 
                name='payment_time'
                value={"pay_before_shipment"}
                checked={shippingPayment === "pay_before_shipment"}
                onChange={(e) => setShippingPayment(e.target.value as "pay_before_shipment")}
                />
            </label>
            <label className='flex items-center gap-2'>
                <span className='whitespace-nowrap'>Pay After Shipment</span>
                <input 
                type="radio" 
                name='payment_time'
                value={"pay_after_shipment"}
                checked={shippingPayment === "pay_after_shipment"}
                onChange={(e) => setShippingPayment(e.target.value as "pay_after_shipment")}
                />
            </label>
        </fieldset>
    </div>

    <div className='bg-light p-4 min-h-68 h-68 max-h-68 space-y-2 overflow-y-scroll'>
        {
            data.length < 1 && 
            <p className='text-xs italic'>
                ...No package available for request mail. Be sure to have at least one package with status {"stored"} to be able to make a shipment request.
            </p>
        }
        {
            !isDataLoading ?
            data
                // .filter( pack => pack.status === "stored" )
                .map( packag => 
                    <RequestMailProduct key={packag.id} prop={packag} handlePackage={setSelectedPackages}/>   
                ) :
                <div className='w-full h-full center-items'>
                    <BeatLoader color='#f26430' size={15}/>
                </div>
        }
    </div>

    <div className='p-body pb-20'>
        <button 
        className='bg-accent-red text-white w-full text-sm py-3 rounded'
        onClick={() => {
           if ( selectedPackages.length > 0){
                setIsConfirmModal(true)
            } else{
                toast.error("Select package")
            }
        }}
        >
            Request Shipment
        </button>
    </div>





    {
        isConfirmModal &&
        <ConfirmModal {...{setIsConfirmModal, isPostingData, handleSubmit}}/>
    }
  </div>
}











type PackOp = "Easy Packaging Paper" | "Balloon Cotton Box" | "Vacuum Service" | "Normal Standard Packaging" | null

const ConfirmModal = ({setIsConfirmModal, isPostingData, handleSubmit} : {setIsConfirmModal: Dispatch<SetStateAction<boolean>>, isPostingData: boolean, handleSubmit: (value: string, note: string) => Promise<void> }) => {

    const [customerNote, setCustomerNote] = useState("")
    const [page, setPage] = useState<"policy" | "confirm">("policy") 
    const [packaging, setPackaging] = useState<PackOp>(null)



    const packagingOptions = [ "Easy Packaging Paper", "Balloon Cotton Box", "Vacuum Service ", "Normal Standard Packaging" ]


    return <div className='w-screen h-dvh fixed top-0 right-0 center-items bg-accent-blue/20'>
        {
            page === "policy" ?
            <div className=' w-[90%] max-w-125 h-70 bg-light border border-dark/10 shadow shadow-dark rounded p-4 text-[10px] flex flex-col justify-between overflow-y-auto'>
                <div>
                    <hr className='border-dark/10 '/>
                    <section className="shipping-notice">
                        <h1>Dear Customer,</h1>

                        <p>
                            The following is a reminder to confirm the contents of the item being mailed.
                            Please review and confirm carefully before shipment processing.
                        </p>

                        <h2>★ Important Note</h2>

                        <p>
                            The normal working hours of the warehouse are:
                            <strong>Monday to Saturday, 8:30 - 17:30</strong>,
                            with a full break on Sundays.
                            Please follow the public notice for official holidays.
                        </p>

                        <p>
                            Warehouse packing rules: The packing staff packages in sequence according
                            to the time when everyone applies for mailing to submit the order.
                            After applying for packaging, it generally takes 1-3 days to complete
                            the packaging. There may be a slight delay during weekends or holidays.
                            If you have urgent packages, you must apply for packaging in advance.
                        </p>

                        <ol>
                            <li>
                            <strong>Recognize prohibited goods:</strong>
                            Before mailing, be sure to confirm whether the package contains prohibited
                            goods or items subject to customs clearance. The warehouse does not assume
                            any loss due to security or customs seizures.
                            </li>

                            <li>
                            <strong>Billing weight:</strong>
                            Entry weight is the gross weight of courier packaging.
                            Exit weight = item weight + packed carton + tape - useless courier outer packaging.
                            Billing weight is based on exit weight.
                            </li>

                            <li>
                            <strong>Rounding billing:</strong>
                            The courier industry calculates freight using rounding billing.
                            Channels less than 1kg are billed as 1kg.
                            Example: 5.2kg is billed as 6kg.
                            Minimum CBM is 0.1. Anything less than 0.1CBM will still be charged as 0.1CBM.
                            </li>

                            <li>
                            <strong>Confirm inventory:</strong>
                            Please confirm that the parcel is in full inventory before applying for packing.
                            If you need to open the box to adjust the parcel after packing is complete,
                            there is a separate charge.
                            </li>

                            <li>
                            <strong>Damage is not covered:</strong>
                            Damage during international shipping transit is not covered.
                            Extra caution should be exercised when mailing fragile items.
                            </li>

                            <li>
                            <strong>Methods of packaging:</strong>
                            When packaging in a box, the courier outer packaging and shoe boxes
                            are removed by default. Fragile and delicate items remain in the packaging.
                            It is advisable to request extra packing layers for fragile packages.
                            If there are special requirements, please note them when applying for packaging.
                            Without a note, it is considered that you agree to allow the warehouse
                            decide whether packaging should be removed.
                            </li>

                            <li>
                            <strong>Confirm information:</strong>
                            Once a package is sent, it cannot be withdrawn or altered.
                            Ensure the shipping address is complete and accurate before submission.
                            </li>

                            <li>
                            <strong>Timely feedback:</strong>
                            If there is a problem after the parcel is received,
                            please contact customer service within 7 days after delivery.
                            Late complaints will not be accepted.
                            </li>

                            <li>
                            <strong>Free storage:</strong>
                            The warehouse provides free storage for 90 days.
                            Beyond 90 days, storage is charged at 2 yuan/day/piece.
                            Parcels exceeding 180 days may be destroyed.
                            </li>

                            <li>
                            <strong>No guarantee of time limits:</strong>
                            Delays may occur due to force majeure factors such as strikes,
                            holidays, war, weather, natural disasters, customs factors,
                            government actions, epidemics, etc.
                            The warehouse is not responsible for direct or indirect losses
                            resulting from shipment delays.
                            </li>
                        </ol>

                        <h2>Types of Mailed Goods Restrictions</h2>

                        <h3>➊ Types of prohibited goods carried by sea</h3>
                        <ul>
                            <li>Controlled knives</li>
                            <li>Lighters</li>
                            <li>Weapons or imitation weapons</li>
                            <li>Poisons</li>
                            <li>Drugs</li>
                            <li>White powder without labelling</li>
                            <li>Cultural relics</li>
                            <li>Precious metals</li>
                            <li>Valuable Chinese herbal medicines</li>
                            <li>Other items prohibited by customs</li>
                        </ul>

                        <h3>➋ Types of items at risk (foreign customs screening)</h3>
                        <p>
                            Mailing meat, eggs, milk, intestines, seeds, and solid wood
                            (unprocessed logs) risks confiscation if inspected by foreign customs.
                            Customers are advised to think carefully before mailing these items.
                        </p>

                        <h3>➌ Types of goods at risk (domestic / foreign customs inspection)</h3>
                        <ul>
                            <li>Imitation licensed products</li>
                            <li>Psychotropic or narcotic drugs</li>
                            <li>Nucleic acid test kits</li>
                            <li>National currency</li>
                        </ul>

                        <p>
                            If found, these items may be destroyed by customs authorities.
                        </p>

                        <h3>➍ Types of items at risk of taxation</h3>
                        <ul>
                            <li>Bulk items</li>
                            <li>Cigarettes</li>
                            <li>Liquors</li>
                            <li>Luxury goods</li>
                            <li>Designer products</li>
                            <li>High-value items</li>
                        </ul>

                        <p>
                            Designer and luxury products may be destroyed if customs requests proof
                            of authenticity and such proof cannot be provided or accepted.
                        </p>

                        <aside>
                            <strong>[Special Tip]</strong>
                            If you have doubts, please consult customer service in advance.
                            D_HEIR Logistics warehouse does not bear any losses caused by security
                            inspections or customs seizures. Please confirm carefully before shipment.
                        </aside>

                        <footer>
                            <p>CopyRight ©️ D_HEIR International Logistics Container Transport</p>
                        </footer>
                    </section>
                    <div className='flex justify-end space-x-2'>
                    <button 
                    className='px-3 py-2 border border-dark/10 rounded'
                    onClick={() => setIsConfirmModal(false)}
                    disabled={isPostingData}
                    >
                        Go back
                    </button>
                    <button className='px-3 py-2 text-white bg-accent-blue rounded'
                    onClick={() => setPage("confirm")}
                    disabled={isPostingData}
                    >
                        Next
                    </button>
                </div>

                </div>            
            </div> :
            <div className=' w-[90%] max-w-125 h-70 bg-light border border-dark/10 shadow shadow-dark rounded p-4 text-[10px] flex flex-col justify-between overflow-y-auto'>
                
                <section className="packaging-services">

                    <header>
                        <h1 className='font-semibold mb-4'>
                            Packaging Services
                        </h1>

                        <p>
                        Please note that damages during transit are not covered.
                        Customers are strongly advised to choose a suitable packaging method
                        for their goods.
                        </p> <br/>

                        <p>
                        Multiple packaging options are available, and additional charges may apply
                        for larger or fragile items.
                        </p>

                        <p>
                        Kindly note that package weight may increase after packaging,
                        and the final actual weight will be confirmed after shipment.
                        </p>
                        <br/>
                    </header>

                    <section className="packaging-options">
                        <h2 className='font-bold'>Available Packaging Options:</h2>
                        <br/>
                        
                        <div className='flex gap-2 flex-wrap'>
                            {
                                packagingOptions.map((option, i) => 
                                <label key={i} className='flex items-center gap-1'>
                                    <span>{option}</span>
                                    <input 
                                    type="checkbox"
                                    checked={option === packaging}
                                    onChange={() => setPackaging(option as PackOp)}
                                    />
                                </label>
                                )
                            }
                        </div>
                        <br/>
                        <div className='space-y-2 mb-6'>
                            <p className='font-bold'>
                                Shipment Note: 
                            </p>
                            <textarea 
                            name='customer_note'
                            value={customerNote}
                            onChange={(e) => setCustomerNote(e.currentTarget.value)}
                            className='text-[10px] border border-dark/20 rounded outline-0 px-2 py-1 focus:border-dark w-full h-20 resize-none'
                            />
                        </div>
                    </section>
                    <br/>
                    <br/>
                    <div className="important-note">
                        <h2 className='font-semibold text-blue-700'>Important Note</h2>

                        <p>
                        By proceeding with shipment, you confirm that you have read,
                        understood, and accepted the service agreement.
                        </p>

                    </div>
                    </section>

                

                <div className='flex justify-end space-x-2 mt-8'>
                    <button 
                    className='px-3 py-2 border border-dark/10 rounded'
                    onClick={() => setIsConfirmModal(false)}
                    disabled={isPostingData}
                    >
                        Go back
                    </button>
                    <button className='px-3 py-2 text-white bg-accent-blue rounded'
                    onClick={() => {

                            if(customerNote === ""){
                                toast.error("Input custimer note")
                                return
                            } 
                            if(packaging === null){
                                toast.error("Select packaging option")
                                return
                            }
                            handleSubmit(packaging, customerNote)                    
                        }
                    }
                    disabled={isPostingData}
                    >
                        {
                            isPostingData ?
                            <BeatLoader color='#FFF' size={10}/> : "Confirm Submit"
                        }
                    </button>
                </div>
            </div>
        }
    </div>
}



export default Page