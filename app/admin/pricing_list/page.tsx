"use client"

import { AirPricingTemplate, SeaPricingTemplate } from "@/types/entityTypeDef"
import { useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"


export default function Page(){


    return <div className="h-dvh p-body">
        
        <h2 className="text-2xl font-semibold">
            Pricing List/Templates
        </h2>
        
        <p className="text-xs text-dark/50 mt-2">
            Manage, edit and and manage all Pricing List from one control deck.
        </p>


        <div className="w-full p-2 bg-light rounded mt-6">
            <div className="bg-gray-100 p-2 rounded">
                
                <div className="p-4 bg-light rounded">
                    <h2 className="font-semibold">
                        Air Shipping Template
                    </h2>
                    <AirTemplateComponent />
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
                    <ExpressTemplateComponent />
                </div>

            </div>
        </div>
        
    </div>
}




const AirTemplateComponent = () => {
    
    const [airTemplate, setAirTemplate] = useState<AirPricingTemplate[]>()
    const [isFetchingAirTemplate, setIsFetchingAirTemplate] = useState(true)

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
            airTemplate?.map( template => 
                <div 
                key={template.id}
                className="p-2 bg-light"
                >
                    <h3 className="text-xs capitalize text-dark/70">
                        {`${template.name.split("_").join(" ")}`}
                    </h3>
                    <hr className="my-3 border-dark/10"/>
                    <div className="text-[10px] px-8 space-y-2">
                        <p>
                            Price per kg: ${template.price}
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
                    </div>
                    
                </div>
            )
        }
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
            seaTemplate?.map( template => 
                <div 
                key={template.id}
                className="p-2 bg-light"
                >
                    <h3 className="text-xs capitalize text-dark/70">
                        {`${template.name.split("_").join(" ")}`}
                    </h3>
                    <hr className="my-3 border-dark/10"/>
                    <div className="text-[10px] px-8 space-y-2">
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
                        </p>
                    </div>
                    
                </div>
            )
        }
    </div>
}


const ExpressTemplateComponent = () => {
    
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
                <div 
                key={template.id}
                className="p-2 bg-light"
                >
                    <h3 className="text-xs capitalize text-dark/70">
                        {`${template.name.split("_").join(" ")}`}
                    </h3>
                    <hr className="my-3 border-dark/10"/>
                    <div className="text-[10px] px-8 space-y-2">
                        <p>
                            Price: ${template.price}
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
                    </div>
                    
                </div>
            )
        }
    </div>
}