import { Shipment } from "@/types/entityTypeDef"
import { ShipmentStatus } from "@/types/statusTypes"
import { ChangeEvent } from "react"
import { create } from "zustand"

type StoreType = {
    selectedShipment : Shipment | null
    setSelectedShipment: (value: Shipment) => void
    handleSelectedShipmentInput : (e: ChangeEvent<HTMLInputElement>) => void
    resetSelectedShipment: () => void
    setShipmentStatus: (value: ShipmentStatus) => void
    shipmentTrigger: number
    setShipmentrigger: () => void
}


export const useShipmentStore = create<StoreType>((set) => ({
    selectedShipment: null,
    setSelectedShipment: (packag) => set({selectedShipment: packag}),
    handleSelectedShipmentInput: (e) => {
        const { name, type } = e.currentTarget
        let { value } = e.currentTarget

        // remove leading zeros but keep single zero
        value = value.replace(/^0+(?=\d)/, "")

        set((state) => {
            if (!state.selectedShipment) return state

            let parsedValue: any = value

            if (type === "number") {
                parsedValue = value === "" ? "" : Number(value)
            }

            return {
                selectedShipment: {
                    ...state.selectedShipment,
                    [name]: parsedValue
                }
            }
        })
    },
    setShipmentStatus: (value) => set((state) => {

        if(!state.selectedShipment) return state

        return {selectedShipment: {...state.selectedShipment, status: value}}
    }),
    resetSelectedShipment: () => set({selectedShipment: null}),
    shipmentTrigger: 0,
    setShipmentrigger: () => set((state) => ({shipmentTrigger: state.shipmentTrigger + 1}))
}))