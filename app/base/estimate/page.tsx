"use client"

import { generateAirShippingQuotation } from "@/lib/calculators/generateAirShippingQuotation"
import { generateExpressShippingQuotation } from "@/lib/calculators/generateExpressShippingQuotation"
import { generateSeaShippingQuotation } from "@/lib/calculators/generateSeaShippingQuotation"
import { AirPricingTemplate, ExpressPricingTemplate, SeaPricingTemplate } from "@/types/entityTypeDef"
import { useEffect, useState } from "react"
import { BsQuestionCircle } from "react-icons/bs"
import { FaChevronDown } from "react-icons/fa"
import { PulseLoader } from "react-spinners"
import { toast } from "react-toastify"


type ItemCartType = {
    id: number
    name: string
    weight: number
    numberOfItems: number
}

type QuotationResultType = {
    itemName: string
    price: string
    clearanceFee: string
    expectedDeliveryWindow: string
    quantity: number
}

type QuotationState = {
    goods: QuotationResultType[]
    totalPrice: string
}


export default function Page(){

    const [selectedTemplate, setSelectedTemplate] = useState<"air" | "sea" | "express" >("air")
    const [isSelectedTemplateMenu, setIsSelectedTemplateMenu]= useState(false)

    const [itemCart, setItemCart] = useState<ItemCartType[]>([])
    const [quotation, setQuotation] = useState<QuotationState | null>(null)
    const [isFetchingQuotation, setIsFetchingQuotation] = useState(false)

    const [isExtraInformationMenuOpen, setIsExtraInformationMenuOpen] = useState(false)

    
    // Edit Item in Cart
    const addToCart = (value: ItemCartType) => {
        setItemCart(prev => ([
            ...prev, value
        ]))
    }

    // Remove Item from Cart
    const removeItemCart = (id: number) => {
        setItemCart(prev => prev.filter(item => item.id !== id))
    }

    
    
    useEffect(() => {

        const fetchQuota = async () => {
            setIsFetchingQuotation(true)
            try{    
                let result: QuotationState | undefined 
                
                switch(selectedTemplate){
                    case "air" :
                        result = await generateAirShippingQuotation(itemCart)
                        break
                    case "sea" :
                        result = await generateSeaShippingQuotation(itemCart)
                        break
                    case "express" : 
                        result = await generateExpressShippingQuotation(itemCart)
                        break
                    }
                
                setQuotation(result || null)
            }
            catch(err){
                console.error("ERR:: Fetching Quotation", err)
                toast.error("ERR:: Fetching Quotation")
            }   
            finally{
                setIsFetchingQuotation(false)
            }
            
        }



        // console.log(itemCart)


        if(itemCart.length > 0){
            fetchQuota()
        }

    }, [itemCart.length])

    let component

    switch (selectedTemplate){
        case "air" :
            component = <AirShipping {...{addToCart}}/>
            break
        case "sea" :
            component = <SeaShipping {...{addToCart}}/>
            break
        case "express" :
            component = <ExpressShipping {...{addToCart}}/>
            break
    }




    // Fetch Sea Pricing Template
    // const fetchSeaPricingTemplate = async ( ) => {
    //     setIsDataLoading(true)
    //     try{
    //         const res = await fetch(`/api/pricing_template/sea`)
    //         const result = await res.json()

    //         if(!res.ok){
    //             toast.error(result.message)
    //             return
    //         }
    //         console.log(result.data)
    //         setSeaPricingTemplate(result.data)
    //     }
    //     catch(err){
    //         console.error("ERR:: Fetching Sea Pricing Template", err)
    //         toast.error("ERR:: Fetching Sea Pricing Template")
    //     }
    //     finally{
    //         setIsDataLoading(false)
    //     }
    // }

    

    // Fetch Express Pricing Template
    // const fetchExpressPricingTemplate = async ( ) => {
    //     setIsDataLoading(true)
    //     try{
    //         const res = await fetch(`/api/pricing_template/express`)
    //         const result = await res.json()

    //         if(!res.ok){
    //             toast.error(result.message)
    //             return
    //         }
    //         console.log(result.data)
    //         setExpressPricingTemplate(result.data)
    //     }
    //     catch(err){
    //         console.error("ERR:: Fetching Express Pricing Template", err)
    //         toast.error("ERR:: Fetching Express Pricing Template")
    //     }
    //     finally{
    //         setIsDataLoading(false)
    //     }
    // }


    // useEffect(() => {

    //     switch (selectedTemplate){
    //         case "air" :
    //             fetchAirPricingTemplate()
    //             break
    //         case "sea" :
    //             fetchSeaPricingTemplate()
    //             break
    //         case "express" : 
    //             fetchExpressPricingTemplate()
    //             break
    //         }

        
    // }, [selectedTemplate])


    return <div className="h-dvh w-full flex flex-wrap">
        <div className="bg-light flex-1  shadow-[20px_0_20px_rgba(0,0,0,0.15)] relative z-20 p-8 h-[calc(100dvh-70px)] max-h-[calc(100dvh-70px)] overflow-y-auto">

            <div className="flex justify-between items-center relative z-100">
                <h2 className="font-semibold text-2xl max-sm:text-lg">
                    Generate Quotation
                </h2>
                <div className="relative">
                    <button
                    onClick={() => setIsExtraInformationMenuOpen(prev => !prev)}
                    > 
                        <BsQuestionCircle/>
                    </button>
                    <div className={`
                        bg-light shadow-[0_0_10px_rgba(0,0,0,0.2)] p-4 rounded-lg absolute w-56 text-[10px] right-0 top-full mt-2 transition-set overflow-y-auto max-h-70
                        ${!isExtraInformationMenuOpen && "opacity-0 pointer-events-none translate-y-10"}
                    `}>
                        <h3 className="font-semibold text-yellow-500">
                            List of Special goods    
                        </h3> 
                        <ul className="list-disc list-inside mb-2 mt-4">
                            <li>
                                Battery goods
                            </li>
                            <li>
                                Liquid
                            </li>
                            <li>
                                Perishable goods
                            </li>
                            <li>
                                Medicine
                            </li>
                            <li>
                                Gases
                            </li>
                            <li>
                                Cosmetics
                            </li>
                            <li>
                                Food etc
                            </li>
                        </ul>
                        
                        <h3 className="font-semibold text-yellow-600">
                            Notice:
                        </h3>
                        <p className="text-[10px]">
                            China to Nigeria🇳🇬
                            <br />
                            Updated fee. 
                            <br />
                            Shipping fee: please note below prices are subject to change due to influctuations in exchange rate and clearing fee.
                            <br />
                            Air: <br />
                            Normal goods $11.9 per kg <br /> 
                            Duration 7-10 days <br />
                            Special goods $12.7 per kg <br />
                            Duration 2-3 weeks <br />
                            Clearance 1,000 per kg <br />
                            <br />
                            Express: <br />
                            Duration 3-5days <br />
                            Phone $20.5 per <br />
                            Laptop $35.8 per <br />
                            Tablet below 1kg $25.5 <br />
                            Tablet above $25.5 <br />
                            Clearance 1200 per kg <br />
                            Items above 20kg $14 per kg <br />
                            Items less than 20kg $16 per kg clearance 1600 per kg


                            Sea: <br />
                            Normal goods N550,000 per cbm inclusive clearing. <br />
                            Special goods 580,000 <br />
                            Duration: 2-3 month (-/+) <br />

                            <br />
                            Warehouse:<br />
                            Guangzhou: for Consolidation.<br />
                            Foshan: no consolidation, immediate loading. <br />
                            CBM: 0.1<br />
                            <br />
                            Interstate,  
                            Onitsha, 
                            Kano and other states are waybill. <br />
                            <br />
                            Notice <br />
                            No missing items <br />
                            Inspection of few packages based on request from 1cbm above <br />
                            We give accurate CBM <br />
                            We repack goods together/consolidate <br /> 
                            We pack goods into freezers and washing machines <br />
                            {"We're no longer shipping any lithium batteries like power bank and co."} <br />
                            <br />
                            Important notice: <br />
                            your name and phone number must be written on your packages.<br />
                        </p>

                    </div>
                </div>
            </div>


            <div className="bg-dark/5 p-4 py-1 rounded mt-3 border border-dark/10 text-[10px]">
                <p className="text-xs text-dark mt-2 mb-4 font-semibold"> 
                    Our Current Conversion Rates are as follows: 
                </p>
                <p>Dollar to Naira: $1 / ₦1500</p>
                <p>Yen to Naira: ¥1 / ₦1500</p>
                <br/>
            </div>


            {/* Shipping Channel */}
            <div className="mt-14 text-xs max-w-110 relative z-50">
                

                {/* Input */}
                <label className="flex gap-4 flex-col  ">
                    <span className="text-dark/50 max-sm:text-[9px]">
                        Shipping Channel
                    </span>
                    <input 
                    type="text" 
                    className="text-base border-b border-dark/30 outline-0 p-2 font-semibold capitalize max-sm:text-sm"
                    readOnly
                    value={selectedTemplate}
                    onChange={(e) => {setSelectedTemplate(e.currentTarget.value as "air" | "sea" | "express")}}
                    />
                </label>
                
                {/* Change Button */}
                <button className={`absolute right-3 bottom-3 transition-set ${isSelectedTemplateMenu ? "rotate-180" : "rotate-0"}`}
                onClick={() => {
                    setIsSelectedTemplateMenu(prev => !prev)
                }}
                >
                    <FaChevronDown className="text-black/60 "/>
                </button>

                {/* DropDown menu */}
                <div className={`
                    p-1 shadow-[0_5px_20px_rgba(0,0,0,0.25)] absolute rounded right-1 flex flex-col transition-set bg-light
                    ${!isSelectedTemplateMenu && "opacity-0 pointer-events-none translate-y-10"}    
                `}>
                    {
                        ["air", "sea", "express"].map((x, i) => 
                            <button 
                            key={x} 
                            className={` py-2 w-30 wborder-b-20 border-dark/10 ${i !== 2 && "border-b"} active:bg-gray-200 text-[10px] rounded ${x === selectedTemplate && "bg-dark text-light"}`}
                            onClick={() => {
                                setSelectedTemplate(x as "sea" | "air" | "express")
                                setIsSelectedTemplateMenu(prev => !prev)
                                setItemCart([])
                                setQuotation(null)
                            }}
                            >
                                {x.charAt(0).toUpperCase() + x.slice(1)}
                            </button>
                        )
                    }
                </div>
            </div>

            {/* Select type of Package*/}
            
            {component}
{}
        </div>


        {/* PACKAGE SUMMARY & QUOTATION */}

        <div className=" flex-1 bg-gray-100 relative z-10 p-8 pb-20">
            <h2 className="text-2xl font-semibold">
                Package Summary
            </h2> 
            
            {/* Cart */}
            <div className="p-2 rounded-lg mt-4 h-52 overflow-y-auto space-y-2 shadow-[0_5px_20px_rgba(0,0,0,0.25)]">
                {
                    itemCart.length === 0 ?
                    <div className="w-full h-full center-items text-dark/50">
                        No items added
                    </div> :   
                    itemCart.map((item, i) =>
                        <div key={i} className="border border-dark/50 py-2 rounded text-[10px] px-3 flex justify-between items-center">
                            
                            <span>
                                {item.name.charAt(0).toUpperCase() + item.name.slice(1).split("_").join(" ")}
                            </span>

                            <div className="flex gap-3">
                                <div className="flex gap-2">
                                    {
                                        selectedTemplate !== "express" &&
                                        <span>
                                            {item.weight}{selectedTemplate === "sea" ? " cbm" : "kg"}
                                        </span>
                                    }
                                    <div className="h-full border-l border-dark/20"/>
                                    <span>
                                        {item.numberOfItems} {item.numberOfItems > 1 ? "items" : "item"}
                                    </span>
                                </div>
                                <button 
                                className="text-red-300"
                                onClick={() => removeItemCart(item.id)}
                                >
                                    Remove
                                </button>
                            </div>

                        </div>
                    )
                }
            </div>



            {/* QUOTATION */}


            <div className="shadow-[0_0_10px_rgba(0,0,0,0.35)] mt-4 h-62 rounded-lg p-6 w-full max-w-full pb-20">
                <h2 className="text-sm font-bold flex gap-2 items-center">
                    DHEIRINTERNATIONAL
                    {
                        isFetchingQuotation && <PulseLoader color="orange" size={10}/>
                    }
                </h2>
                <div className="border-b m-2 border-dashed"/>
                <div className="flex flex-col w-full max-w-full">
                    <div className="border border-dark/30 p-2 mb-2 rounded text-[10px]">
                        <span className="font-semibold mr-2">
                            Channel:
                        </span> 
                        {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}
                    </div>

                    {/* QUOTATION ITEMS */}
                    <div className="h-26 flex flex-wrap gap-2 overflow-x-auto max-w-full w-full">
                        {
                            quotation ? quotation.goods.map((good, i) =>  {

                                if(good.quantity === 0){
                                    return null
                                }   

                                return <div 
                                key={i}
                                className="h-full flex-1 min-w-40 border border-dark/20 rounded-lg text-[10px] p-4 flex justify-center flex-col gap-1 ">
                                    
                                    {/* ITEM NAME */}
                                    <p>
                                        {good.itemName.charAt(0).toUpperCase() + good.itemName.slice(1).split("_").join(" ")} &nbsp; x{good.quantity}
                                    </p>

                                    {/* PRICE */}
                                    <p>Price: ₦ {Number(good.price).toLocaleString()}</p>

                                    {/* CLEARANCE FEE */}
                                    <p>
                                        {
                                            good.clearanceFee === "0.00" ? "Clearance Fee: Included in price" : `Clearance Fee: ₦ ${Number(good.clearanceFee).toLocaleString()}`
                                        }
                                    </p>

                                    {/* EXPECTED DELIVERY WINDOW */}
                                    <p>Expected Delivery Window: {good.expectedDeliveryWindow}</p>
                                </div>}
                            ) :
                            <div className="w-full h-full center-items text-dark/50">
                                No quotation available
                            </div>
                        }
                    </div>
                </div>
                <div className="border-b my-2 border-dashed"/>
                <div className="h-5 font-semibold text-sm mt-2 flex justify-end">
                    <p>Total Cost: ₦ {Number(quotation?.totalPrice).toLocaleString()}</p>
                </div>
            </div>
        </div>
    </div>
}



const AirShipping = ({addToCart} : {addToCart: (value: ItemCartType) => void}) => {

    const [airPricingTemplates, setAirPricingTemplates] = useState<AirPricingTemplate[]>([])
    const [selectedPackageTemplateType, setSelectedPackageTemplateType] = useState<AirPricingTemplate | null>(null)
    const [isDataLoading, setIsDataLoading] = useState(true)

    const [weight, setWeight] = useState(0)
    const [numberOfItems, setNumberOfItems] = useState(1)

    // Fetch Air Pricing Template
    const fetchAirPricingTemplate = async ( ) => {
        setIsDataLoading(true)
        try{
            const res = await fetch(`/api/pricing_template/air`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }
            console.log(result.data)
            setAirPricingTemplates(result.data)
            setSelectedPackageTemplateType(result.data[0])
        }
        catch(err){
            console.error("ERR:: Fetching Air Pricing Template", err)
            toast.error("ERR:: Fetching Air Pricing Template")
        }
        finally{
            setIsDataLoading(false)
        }
    }

    useEffect(() => {
        fetchAirPricingTemplate()
    }, [])


    return <div className=" min-h-80 h-80 mt-8">
        {
            isDataLoading ? 
            <div className="w-full h-full center-items">
                <PulseLoader color="orange" size={10}/>
            </div> :
            <div>
                <div className="flex gap-2">
                    {
                        airPricingTemplates.map( (type, i) => 
                            <button key={i}
                            className={`
                                text-[10px] border border-dark/20 px-4 py-2 rounded-full
                                ${type.name === selectedPackageTemplateType?.name && "bg-dark text-light"}    
                            `}
                            onClick={() => setSelectedPackageTemplateType(type)}
                            >
                                {
                                    `${type.name.charAt(0).toUpperCase() + type.name.slice(1) }`.split("_").join(" ")
                                }
                            </button>
                        )
                    }
                </div>

                <div className="mt-14 text-xs max-w-110 min-w-20 relative flex gap-4 flex-wrap">
                    <label className="flex gap-4 flex-col text-[10px]">
                        <span className="text-dark/50">
                            Weight (Kg)
                        </span>
                        <input 
                        type="number" 
                        className="text-base border-b border-dark/30 outline-0 p-2 font-semibold"
                        value={weight}
                        onChange={(e) => {setWeight(Number(e.currentTarget.value))}}
                        min={1}
                        />
                    </label>
                    <label className="flex gap-4 flex-col text-[10px]">
                        <span className="text-dark/50">
                            No. Of Items
                        </span>
                        <input 
                        type="number" 
                        className="text-base border-b border-dark/30 outline-0 p-2 font-semibold"
                        value={numberOfItems}
                        onChange={(e) => {setNumberOfItems(Number(e.currentTarget.value))}}
                        min={1}
                        />
                    </label>
                </div>

                {/* Add Button */}
                <div className="mt-14 text-xs max-w-110 relative flex gap-4 pb-20">
                    <button 
                    className="bg-accent-red py-3 w-full text-white font-semibold rounded"
                    onClick={() => {
                        const id = Date.now()

                        addToCart({
                            id,
                            name: selectedPackageTemplateType?.name || "",
                            weight,
                            numberOfItems
                        })
                    }}
                    >
                        Add Good
                    </button>
                </div>
            </div>
        }
    </div>
}


const SeaShipping = ({addToCart} : {addToCart: (value: ItemCartType) => void}) => {

    const [seaPricingTemplates, setSeaPricingTemplates] = useState<SeaPricingTemplate[]>([])
    const [selectedPackageTemplateType, setSelectedPackageTemplateType] = useState<SeaPricingTemplate | null>(null)
    const [isDataLoading, setIsDataLoading] = useState(true)

    const [cbm, setCbm] = useState(0)
    const [numberOfItems, setNumberOfItems] = useState(1)

    // Fetch Sea Pricing Template
    const fetchSeaPricingTemplate = async ( ) => {
        setIsDataLoading(true)
        try{
            const res = await fetch(`/api/pricing_template/sea`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }
            console.log(result.data)
            setSeaPricingTemplates(result.data)
            setSelectedPackageTemplateType(result.data[0])
        }
        catch(err){
            console.error("ERR:: Fetching Sea Pricing Template", err)
            toast.error("ERR:: Fetching Sea Pricing Template")
        }
        finally{
            setIsDataLoading(false)
        }
    }

    useEffect(() => {
        fetchSeaPricingTemplate()
    }, [])


    return <div className=" min-h-80 h-80 mt-8">
        {
            isDataLoading ? 
            <div className="w-full h-full center-items">
                <PulseLoader color="orange" size={10}/>
            </div> :
            <div>
                <div className="flex gap-2">
                    {
                        seaPricingTemplates.map( (type, i) => 
                            <button key={i}
                            className={`
                                text-[10px] border border-dark/20 px-4 py-2 rounded-full
                                ${type.name === selectedPackageTemplateType?.name && "bg-dark text-light"}    
                            `}
                            onClick={() => setSelectedPackageTemplateType(type)}
                            >
                                {
                                    `${type.name.charAt(0).toUpperCase() + type.name.slice(1) }`.split("_").join(" ")
                                }
                            </button>
                        )
                    }
                </div>

                <div className="mt-14 text-xs max-w-110 relative flex gap-4">
                    <label className="flex gap-4 flex-col text-[10px]">
                        <span className="text-dark/50">
                            cbm
                        </span>
                        <input 
                        type="number" 
                        className="text-base border-b border-dark/30 outline-0 p-2 font-semibold"
                        value={cbm}
                        onChange={(e) => {setCbm(Number(e.currentTarget.value))}}
                        min={1}
                        />
                    </label>
                    <label className="flex gap-4 flex-col text-[10px]">
                        <span className="text-dark/50">
                            No. Of Items
                        </span>
                        <input 
                        type="number" 
                        className="text-base border-b border-dark/30 outline-0 p-2 font-semibold"
                        value={numberOfItems}
                        onChange={(e) => {setNumberOfItems(Number(e.currentTarget.value))}}
                        min={1}
                        />
                    </label>
                </div>

                {/* Add Button */}
                <div className="mt-14 text-xs max-w-110 relative flex gap-4 pb-20">
                    <button 
                    className="bg-accent-red py-3 w-full text-white font-semibold rounded"
                    onClick={() => {
                        const id = Date.now()

                        addToCart({
                            id,
                            name: selectedPackageTemplateType?.name || "",
                            weight: cbm,
                            numberOfItems
                        })
                    }}
                    >
                        Add Good
                    </button>
                </div>
            </div>
        }
    </div>
}


const ExpressShipping = ({addToCart} : {addToCart: (value: ItemCartType) => void}) => {

    const [expressPricingTemplates, setExpressPricingTemplates] = useState<ExpressPricingTemplate[]>([])
    const [selectedPackageTemplateType, setSelectedPackageTemplateType] = useState<ExpressPricingTemplate | null>(null)
    const [isDataLoading, setIsDataLoading] = useState(true)

    const [weight] = useState(0)
    const [numberOfItems, setNumberOfItems] = useState(1)

    // Fetch Express Pricing Template
    const fetchExpressPricingTemplate = async ( ) => {
        setIsDataLoading(true)
        try{
            const res = await fetch(`/api/pricing_template/express`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }
            console.log(result.data)
            setExpressPricingTemplates(result.data)
            setSelectedPackageTemplateType(result.data[0])
        }
        catch(err){
            console.error("ERR:: Fetching Express Pricing Template", err)
            toast.error("ERR:: Fetching Express Pricing Template")
        }
        finally{
            setIsDataLoading(false)
        }
    }

    useEffect(() => {
        fetchExpressPricingTemplate()
    }, [])


//      {
//       id: 1,
//       name: 'phone',
//       price: '20.50',
//       clearance: '1200.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 2,
//       name: 'laptop',
//       price: '35.80',
//       clearance: '1200.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 3,
//       name: 'tablet_below_1kg',
//       price: '25.50',
//       clearance: '1200.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 4,
//       name: 'tablet_above_1kg',
//       price: '25.50',
//       clearance: '1200.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 5,
//       name: 'items_above_20kg',
//       price: '14.00',
//       clearance: '1600.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 6,
//       name: 'items_below_20kg',
//       price: '16.00',
//       clearance: '1600.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     }
//   ]


    return <div className=" min-h-80 h-80 mt-8">
        {
            isDataLoading ? 
            <div className="w-full h-full center-items">
                <PulseLoader color="orange" size={10}/>
            </div> :
            <div>
                <div className="flex gap-2 flex-wrap">
                    {
                        expressPricingTemplates.map( (type, i) => 
                            <button key={i}
                            className={`
                                text-[10px] border border-dark/20 px-4 py-2 rounded-full h-8 w-fit whitespace-nowrap
                                ${type.name === selectedPackageTemplateType?.name && "bg-dark text-light"}    
                            `}
                            onClick={() => setSelectedPackageTemplateType(type)}
                            >
                                {
                                    `${type.name.charAt(0).toUpperCase() + type.name.slice(1) }`.split("_").join(" ")
                                }
                            </button>
                        )
                    }
                </div>

                <div className="mt-14 text-xs max-w-110 relative flex gap-4">
                    {/* <label className="flex gap-4 flex-col text-[10px]">
                        <span className="text-dark/50">
                            Weight (Kg)
                        </span>
                        <input 
                        type="number" 
                        className="text-base border-b border-dark/30 outline-0 p-2 font-semibold"
                        value={weight}
                        onChange={(e) => {setWeight(Number(e.currentTarget.value))}}
                        min={1}
                        readOnly
                        />
                    </label> */}
                    <label className="flex gap-4 flex-col text-[10px]">
                        <span className="text-dark/50">
                            No. Of Items
                        </span>
                        <input 
                        type="number" 
                        className="text-base border-b border-dark/30 outline-0 p-2 font-semibold"
                        value={numberOfItems}
                        onChange={(e) => {setNumberOfItems(Number(e.currentTarget.value))}}
                        min={1}
                        />
                    </label>
                </div>

                {/* Add Button */}
                <div className="mt-14 text-xs max-w-110 relative flex gap-4 pb-20">
                    <button 
                    className="bg-accent-red py-3 w-full text-white font-semibold rounded"
                    onClick={() => {
                        const id = Date.now()

                        addToCart({
                            id,
                            name: selectedPackageTemplateType?.name || "",
                            weight,
                            numberOfItems
                        })
                    }}
                    >
                        Add Good
                    </button>
                </div>
            </div>
        }
    </div>
}