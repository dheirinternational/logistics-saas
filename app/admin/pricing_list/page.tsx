"use client"

import { AirPricingTemplate, SeaPricingTemplate } from "@/types/entityTypeDef"
import { useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"


type MoneyExchangeRate = {
    name: string,
    currency_one: number,
    currency_two: number
}


export default function Page(){

    // Money Exchange rate
    const [moneyExchangeRate, setMoneyExhangeRate] = useState<MoneyExchangeRate[]>([])


    // selected values
    const [currency, setCurrency] = useState<"Naira" | "Dollar">("Dollar")
    const [currentSelectedCurrencyValue, setCurrentSelectedCurrencyValue] = useState(0)


    // Loading States
    const [isFetchingMoneyExchangeRates, setIsFetchingMoneyExchangeRates] = useState(true)


    // Fetch Money exchange rates
    useEffect(() => {
        const fetchMoneyExchangeRates = async() => {
            try{
                const res = await fetch(`/api/money-exchange-rate`)
                const result = await res.json()

                if(!res.ok){
                    toast.error(result.message)
                    return
                }   

                console.log(result)

                setMoneyExhangeRate(result.data)
                setCurrentSelectedCurrencyValue(result.data[0].currency_one)
            }
            catch(err: any){
                console.error(err.message, err)
                toast.error(err.message)
            }
            finally{
                setIsFetchingMoneyExchangeRates(false)
            }
        }

        fetchMoneyExchangeRates()
    }, [])



    return <div className="h-dvh p-body">
        
        <h2 className="text-2xl font-semibold">
            Pricing List/Templates
        </h2>
        
        <p className="text-xs text-dark/50 mt-2">
            Manage, edit and and manage all Pricing List from one control deck.
        </p>

        <div>
            <div className="w-fit text-[10px] bg-gray-200 rounded mt-4 p-1">
                <button className={`
                    p-2 rounded ${currency === "Dollar" && "bg-white"}
                `}
                onClick={() => {
                    setCurrency("Dollar")
                    setCurrentSelectedCurrencyValue(moneyExchangeRate[0].currency_one)
                }}
                >
                    Dollar
                </button>
                <button className={`
                    p-2 rounded ${currency === "Naira" && "bg-white"}
                `}
                onClick={() => {
                    setCurrency("Naira")
                    setCurrentSelectedCurrencyValue(moneyExchangeRate[0].currency_two)
                }}
                >
                    Naira
                </button>
            </div>
        </div>
        <p className="text-[10px] mt-2">
            <span className="text-red-400 font-semibold mr-2">Note:</span>
            <span className="text-dark/70 italic">
            While currency can be changed on the ui, all edits made to the prices must be made in dollars as that is the standard currency in the database</span>
        </p>

        <div className="w-full p-2 bg-light rounded mt-6">
            <div className="bg-gray-100 p-2 rounded">
                
                <div className="p-4 bg-light rounded">
                    <h2 className="font-semibold">
                        Air Shipping Template
                    </h2>
                    <AirTemplateComponent {...{currencyValue: currentSelectedCurrencyValue}}/>
                </div>

                <div className="p-4 bg-light rounded">
                    <h2 className="font-semibold">
                        Sea Shipping Template
                    </h2>
                    <SeaTemplateComponent />
                </div>
                
                <div className="p-4 bg-light rounded">
                    <h2 className="font-semibold">
                        Express Shipping Template
                    </h2>
                    <ExpressTemplateComponent {...{currencyValue: currentSelectedCurrencyValue}} />
                </div>

            </div>
        </div>
        
    </div>
}




const AirTemplateComponent = ({currencyValue} : {currencyValue: number}) => {
    

    // Arrays 
    const [airTemplate, setAirTemplate] = useState<AirPricingTemplate[]>()
    
    
    // Loading States indicators
    const [isFetchingAirTemplate, setIsFetchingAirTemplate] = useState(true)


    // Selectors



    // Fetch Air Templates
    const fetchAirTemplates = async () => {
        setIsFetchingAirTemplate(true)
        try{
            const res = await fetch(`/api/pricing_template/air`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setAirTemplate(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingAirTemplate(false)
        }
    }



    useEffect(() => {
        fetchAirTemplates()
    }, [])


    return <div className="bg-gray-100 p-1 mt-2 rounded space-y-1">
        {
            isFetchingAirTemplate ? 
            <div className="p-3 center-items">
                <BeatLoader color="orange" size={8}/> 
            </div>:
            airTemplate?.map( (template, i) => 
                <AirComp key={i} {...{template, currencyValue}}/>
            )
        }
    </div>
}


const AirComp = ({template, currencyValue}) => {

        const [isEditPageActive, setIsEditPageActive] = useState(false)


    return <div 
    className="p-2 bg-light"
    >
        <div className="flex items-center justify-between">    
            <h3 className="text-xs capitalize text-dark/70">
                {`${template.name.split("_").join(" ")}`}
            </h3>
            <button 
            className="text-[10px] bg-blue-500 px-3 py-1 rounded text-white"
            onClick={() => {setIsEditPageActive(!isEditPageActive)}}
            >
                {
                    isEditPageActive ?
                    "Back" : "Edit" 
                }
            </button>
        </div>
        <hr className="my-3 border-dark/10"/>
        <div className="text-[10px] px-8 space-y-2 h-27">
            {
                !isEditPageActive ?
                <>
                    <p>
                        Price per kg: {currencyValue === 1 ? "$" : "₦"}{(template.price * currencyValue).toFixed(2)}
                    </p>
                    <p>
                        Clearance Fee per kg: ₦{template.clearance}
                    </p>
                    <p>
                        Minimum expected delivery: {template.min_duration} {template.duration_type}
                    </p>
                    <p>
                        Maximum expected delivery: {template.max_duration} {template.duration_type}
                    </p>
                </> :
                <EditAirTemplate {...{id: template.id}}/>
            }
        </div>
        
    </div>
}

const EditAirTemplate = ({id}) => {

    const [price, setPrice] = useState<null | number>(null)
    const [clearance, setClearance] = useState<null | number>(null)


    // Loading States
    const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false)


    // Edit template data 
    const editTemplateData = async () => {
        setIsUpdatingTemplate(true)
        
        console.log(price, clearance, id)
        try{
            const res = await fetch(`/api/pricing_template/air`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    price,
                    clearance,
                    id
                })
            })
            const result = await res.json()

            if (!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
    
        }
        catch(err){ 
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsUpdatingTemplate(false)
        }
    }


    
    return <div className="w-full h-full space-y-2">
        <label className="flex gap-2 items-center w-50 justify-between ">
            <span className="font-semibold">
                Price:
            </span>
            <input 
            type="number" 
            value={price || 0}
            onChange={(e) => setPrice(Number(e.currentTarget.value) === 0.00 ? null : Number(e.currentTarget.value))}
            className="border border-dark/10 rounded py-1 px-2 outline-0"
            step="0.01"
            />
        </label>
        <label className="flex gap-2 items-center w-50 justify-between">
            <span className="font-semibold">
                Clearance:
            </span>
            <input 
            type="number" 
            value={clearance || 0}
            onChange={(e) => setClearance(Number(e.currentTarget.value) === 0.00 ? null : Number(e.currentTarget.value))}
            className="border border-dark/10 rounded py-1 px-2 outline-0"
            step="0.01"
            />
        </label>
        <button
        className="text-[10px] py-1 px-3 bg-accent-blue/80 rounded text-white"
        onClick={editTemplateData}
        >
            {
                isUpdatingTemplate ?
                <BeatLoader size={8} color="white" /> :
                "Submit Change"
            }
        </button>
    </div>
}








const SeaTemplateComponent = () => {
    
    const [seaTemplate, setSeaTemplate] = useState<SeaPricingTemplate[]>()
    const [isFetchingSeaTemplate, setIsFetchingSeaTemplate] = useState(true)

        const fetchSeaTemplates = async () => {
        setIsFetchingSeaTemplate(true)
        try{
            const res = await fetch(`/api/pricing_template/sea`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setSeaTemplate(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingSeaTemplate(false)
        }
    }


    useEffect(() => {
        fetchSeaTemplates()
    }, [])


    return <div className="bg-gray-100 p-1 mt-2 rounded space-y-1">
        {
            isFetchingSeaTemplate ? 
            <div className="p-3 center-items">
                <BeatLoader color="orange" size={8}/> 
            </div>:
            seaTemplate?.map( (template, i) => 
                <SeaTemp key={i} {...{template}}/>
            )
        }
    </div>
}

const SeaTemp = ({template}) => {

    const [isEditPageActive, setIsEditPageActive] = useState(false)

    return <div 
    className="p-2 bg-light"
    >
        <div className="flex items-center justify-between">    
            <h3 className="text-xs capitalize text-dark/70">
                {`${template.name.split("_").join(" ")}`}
            </h3>
            <button 
            className="text-[10px] bg-blue-500 px-3 py-1 rounded text-white"
            onClick={() => {setIsEditPageActive(!isEditPageActive)}}
            >
                {
                    isEditPageActive ?
                    "Back" : "Edit" 
                }
            </button>
        </div>
        <hr className="my-3 border-dark/10"/>
        <div className="text-[10px] px-8 space-y-2">
            {
                !isEditPageActive ?
                <>
                    <p>
                        Price per cbm: ₦{template.price}
                    </p>
                    <p>
                        Clearance Fee per cbm: ₦{template.clearance}
                    </p>
                    <p>
                        Minimum expected delivery: {template.min_duration} {template.duration_type}
                    </p>
                    <p>
                        Maximum expected delivery: {template.max_duration} {template.duration_type}
                    </p>    ,
                </> : <EditSeaTemplate {...{id: template.id}}/>
            }        
        </div>
        
    </div>
}

const EditSeaTemplate = ({id}) => {

    const [price, setPrice] = useState<null | number>(null)
    const [clearance, setClearance] = useState<null | number>(null)


    // Loading States
    const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false)


    // Edit template data 
    const editTemplateData = async () => {
        setIsUpdatingTemplate(true)
        
        console.log(price, clearance, id)
        try{
            const res = await fetch(`/api/pricing_template/sea`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    price,
                    clearance,
                    id
                })
            })
            const result = await res.json()

            if (!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
    
        }
        catch(err){ 
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsUpdatingTemplate(false)
        }
    }


    
    return <div className="w-full h-full space-y-2">
        <label className="flex gap-2 items-center w-50 justify-between ">
            <span className="font-semibold">
                Price:
            </span>
            <input 
            type="number" 
            value={price || 0}
            onChange={(e) => setPrice(Number(e.currentTarget.value) === 0 ? null : Number(e.currentTarget.value))}
            className="border border-dark/10 rounded py-1 px-2 outline-0"
            step="0.01"
            />
        </label>
        <label className="flex gap-2 items-center w-50 justify-between">
            <span className="font-semibold">
                Clearance:
            </span>
            <input 
            type="number" 
            value={clearance || 0}
            onChange={(e) => setClearance(Number(e.currentTarget.value) === 0 ? null : Number(e.currentTarget.value))}
            className="border border-dark/10 rounded py-1 px-2 outline-0"
            step="0.01"
            />
        </label>
        <button
        className="text-[10px] py-1 px-3 bg-accent-blue/80 rounded text-white"
        onClick={editTemplateData}
        >
            {
                isUpdatingTemplate ?
                <BeatLoader size={8} color="white" /> :
                "Submit Change"
            }
        </button>
    </div>
}











const ExpressTemplateComponent = ({currencyValue} : {currencyValue : number}) => {
    
    const [expressTemplate, setExpressTemplate] = useState<SeaPricingTemplate[]>()
    const [isFetchingExpressTemplate, setIsFetchingExpressTemplate] = useState(true)

        const fetchExpressTemplates = async () => {
        setIsFetchingExpressTemplate(true)
        try{
            const res = await fetch(`/api/pricing_template/express`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setExpressTemplate(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingExpressTemplate(false)
        }
    }


    useEffect(() => {
        fetchExpressTemplates()
    }, [])


    return <div className="bg-gray-100 p-1 mt-2 rounded space-y-1">
        {
            isFetchingExpressTemplate ? 
            <div className="p-3 center-items">
                <BeatLoader color="orange" size={8}/> 
            </div>:
            expressTemplate?.map( template => 
                <ExpressContainer key={template.id} {...{template, currencyValue}}/>
            )
        }
    </div>
}


const ExpressContainer = ({template, currencyValue}) => {

    const [isEditPageActive, setIsEditPageActive] = useState(false)


    return <div 
    className="p-2 bg-light"
    >
        <div className="flex items-center justify-between">    
            <h3 className="text-xs capitalize text-dark/70">
                {`${template.name.split("_").join(" ")}`}
            </h3>
            <button 
            className="text-[10px] bg-blue-500 px-3 py-1 rounded text-white"
            onClick={() => {setIsEditPageActive(!isEditPageActive)}}
            >
                {
                    isEditPageActive ?
                    "Back" : "Edit" 
                }
            </button>
        </div>
        <hr className="my-3 border-dark/10"/>
        <div className="text-[10px] px-8 space-y-2">
            {
                !isEditPageActive ? 
                <>
                    <p>
                        Price: {currencyValue === 1 ? "$" : "₦"}{(template.price * currencyValue).toFixed(2)}
                    </p>
                    <p>
                        Clearance Fee: ₦{template.clearance}
                    </p>
                    <p>
                        Minimum expected delivery: {template.min_duration} {template.duration_type}
                    </p>
                    <p>
                        Maximum expected delivery: {template.max_duration} {template.duration_type}
                    </p>
                </> : <EditExpressTemplate {...{id: template.id}}/>
            }
        </div>
        
    </div>
}

const EditExpressTemplate = ({id}) => {

    const [price, setPrice] = useState<null | number>(null)
    const [clearance, setClearance] = useState<null | number>(null)


    // Loading States
    const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false)


    // Edit template data 
    const editTemplateData = async () => {
        setIsUpdatingTemplate(true)
        
        console.log(price, clearance, id)
        try{
            const res = await fetch(`/api/pricing_template/express`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    price,
                    clearance,
                    id
                })
            })
            const result = await res.json()

            if (!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
    
        }
        catch(err){ 
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsUpdatingTemplate(false)
        }
    }


    
    return <div className="w-full h-full space-y-2">
        <label className="flex gap-2 items-center w-50 justify-between ">
            <span className="font-semibold">
                Price:
            </span>
            <input 
            type="number" 
            value={price || 0}
            onChange={(e) => setPrice(Number(e.currentTarget.value) === 0 ? null : Number(e.currentTarget.value))}
            className="border border-dark/10 rounded py-1 px-2 outline-0"
            step="0.01"
            />
        </label>
        <label className="flex gap-2 items-center w-50 justify-between">
            <span className="font-semibold">
                Clearance:
            </span>
            <input 
            type="number" 
            value={clearance || 0}
            onChange={(e) => setClearance(Number(e.currentTarget.value) === 0 ? null : Number(e.currentTarget.value))}
            className="border border-dark/10 rounded py-1 px-2 outline-0"
            step="0.01"
            />
        </label>
        <button
        className="text-[10px] py-1 px-3 bg-accent-blue/80 rounded text-white"
        onClick={editTemplateData}
        >
            {
                isUpdatingTemplate ?
                <BeatLoader size={8} color="white" /> :
                "Submit Change"
            }
        </button>
    </div>
}