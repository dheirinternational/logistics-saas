import { ReactNode } from "react"

export default function OrdersLayout({ children }: { children: ReactNode }) {
    return <div className="h-full max-h-full w-full overflow-y-auto">{children}</div>
}