import {create} from "zustand"

type StoreType = {
    isModalActive: boolean
    setIsModalActive: () => void
}

export const useEditModalStore = create<StoreType>((set) => ({
    isModalActive: false,
    setIsModalActive: () => set((state) => ({isModalActive: !state.isModalActive}))
}))