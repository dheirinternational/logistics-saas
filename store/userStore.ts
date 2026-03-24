import { create } from "zustand";

type UserStore = {
    role: "admin" | "staff" | "customer"
}

export const useUserStore = create<UserStore>(() => ({
    role: "staff",
}))