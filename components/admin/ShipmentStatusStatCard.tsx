import type { Icon } from "@tabler/icons-react"
import type { ComponentType } from "react"

type Props = {
  value: number
  icon: Icon | ComponentType<{ className?: string; size?: number | string }>
  status: string
}

const ShipmentStatusStatCard = ({ value, icon: Icon, status }: Props) => {
  return (
    <div className="p-4 bg-light rounded-lg flex flex-col justify-center items-center min-w-31 ">
        <Icon className="text-xl opacity-70" size={20} />
        <h3 className="font-bold text-xl mt-2">
            {value}
        </h3>
        <span className="text-[10px] mt-1">
            {status}
        </span>
    </div>
  )
}

export default ShipmentStatusStatCard
