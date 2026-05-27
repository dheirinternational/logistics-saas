import {create} from "zustand"

type StoreType = {
    isModalActive: boolean
    setIsModalActive: () => void
    openModal: () => void
    closeModal: () => void
}

export const useEditModalStore = create<StoreType>((set) => ({
    isModalActive: false,
    setIsModalActive: () => set((state) => ({isModalActive: !state.isModalActive})),
    openModal: () => set({ isModalActive: true }),
    closeModal: () => set({ isModalActive: false }),
}))