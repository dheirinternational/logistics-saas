import { BiPackage } from "react-icons/bi"

const StatusStatCard = () => {
  return (
    <div className="p-4 bg-light rounded-lg flex flex-col justify-center items-center min-w-31">
        <BiPackage className="text-3xl opacity-70" />
        <h3 className="font-bold text-xl mt-2">
            1200
        </h3>
        <span className="text-[10px] mt-1">
            Delivered
        </span>
    </div>
  )
}

export default StatusStatCard