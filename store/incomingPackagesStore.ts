import { Package } from "@/types/entityTypeDef"
import { ChangeEvent } from "react"
import { create } from "zustand"

type StoreType = {
    selectedPackage : Package | null
    setSelectedPackage: (value: Package) => void
    handleSelectedPackageInput : (e: ChangeEvent<HTMLInputElement>) => void
    setPackageWarehouse: (value: number) => void
    resetSelectedPackage: () => void
    trigger: number
    setTrigger: () => void
    readonly: boolean
    setReadOnly: () => void
    resetReadOnly: () => void
}


export const usePackageStore = create<StoreType>((set) => ({
    selectedPackage: null,
    setSelectedPackage: (packag) => set({selectedPackage: packag}),
    handleSelectedPackageInput: (e) => {
        const { name, type } = e.currentTarget
        let { value } = e.currentTarget

        // remove leading zeros but keep single zero
        value = value.replace(/^0+(?=\d)/, "")

        set((state) => {
            if (!state.selectedPackage) return state

            let parsedValue: any = value

            if (type === "number") {
                parsedValue = value === "" ? "" : Number(value)
            }

            return {
                selectedPackage: {
                    ...state.selectedPackage,
                    [name]: parsedValue
                }
            }
        })
    },
    setPackageWarehouse: (value) => {
        set((state) => {
            if (!state.selectedPackage) return state

            return {
                selectedPackage: {
                    ...state.selectedPackage,
                    warehouse_id: value 
                }
            }
        })
    },
    trigger: 0,
    setTrigger: () => set((state) => ({trigger: state.trigger + 1})),
    resetSelectedPackage: () => set({selectedPackage: null}),
    readonly: true,
    setReadOnly: () => set({readonly: false}),
    resetReadOnly: () => set({readonly: true})
}))