import { Shipment } from "@/types/entityTypeDef"
import { ChangeEvent } from "react"
import { create } from "zustand"

type StoreType = {
    selectedShipment : Shipment | null
    setSelectedShipment: (value: Shipment) => void
    handleSelectedShipmentInput : (e: ChangeEvent<HTMLInputElement>) => void
    resetSelectedShipment: () => void
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
    resetSelectedShipment: () => set({selectedShipment: null}),
}))