import { IconType } from "react-icons"

interface StatusStatCardProps {
    count: number
    status: string, //"stored" | "assigned_to_shipment" | "delivered" | "requested_for" | "processing",
    icon: IconType  
}

const StatusStatCard = ({ count, status, icon: Icon }: StatusStatCardProps) => {
  return (
    <div className="p-2 bg-dark/10 rounded-lg flex flex-col justify-center items-center min-w-26">
        <Icon className="text-xl opacity-70" />
        <h3 className="font-bold text-xl mt-2">
            {count}
        </h3>
        <span className="text-[10px] mt-1">
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    </div>
  )
}

export default StatusStatCard