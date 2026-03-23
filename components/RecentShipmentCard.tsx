import { BsArrowRight } from "react-icons/bs"

const RecentShipmentCard = () => {
  return (
    <div className="border p-2 border-dark/20 rounded-lg relative">
        <p className="text-sm font-semibold">
            TRK879012
        </p>
        <p className="text-xs">
            Musa A.
        </p>
        <div className="text-xs flex items-center gap-2 mt-4">
            <span>Location A</span>
            <BsArrowRight/>
            <span>Location B</span>
        </div>
        <span className="text-[10px] font-bold block absolute top-1 right-1 px-3 py-1 bg-accent-blue/20 rounded-full text-accent-blue">
            Shipped
        </span>
    </div>
  )
}

export default RecentShipmentCard