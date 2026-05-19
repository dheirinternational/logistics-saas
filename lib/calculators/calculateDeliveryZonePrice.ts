import { DeliveryZonePrice, State } from "@/types/entityTypeDef";
import { toast } from "react-toastify"


export const calculateDeliveryZonePrice = async (state: string): Promise<number> => {
    let price = 0;
    try{
        const res = await fetch("/api/delivery-zones")
        const result = await res.json()

        const stateRes = await fetch("/api/states")
        const stateResult = await stateRes.json()
        const stateData: State[] = stateResult.data

         if (!stateResult.success){
            throw new Error(stateResult.message || "Error Fetching States")
        }

        if (!result.success){
            throw new Error(result.message || "Error Fetching Delivery Zones")
        }

        console.log(stateData)
        console.log(state)

        const macthedStateId = stateData.find( stat => stat.name.toLowerCase() ===  state.toLowerCase())?.id
        

        const deliveryZones: DeliveryZonePrice[] = result.data
        const zone = deliveryZones.find(z => z.state_id === macthedStateId)
        if (zone) {
            price = zone.price
        }
    }
    catch(err: any){
        console.error("Error Fetching Delivery Zones", err)
        toast.error(err.message || "Error Fetching Delivery Zones")
    }
    return price    
}