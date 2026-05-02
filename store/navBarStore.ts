import { create } from "zustand";

type StoreType = {
    isSideBarActive: boolean
    setIsSideBarActive: () => void
}


export const useNavbarStore = create<StoreType>((set) => ({
    isSideBarActive: false,
    setIsSideBarActive: () => set((state) => ({isSideBarActive: !state.isSideBarActive})) 
}))