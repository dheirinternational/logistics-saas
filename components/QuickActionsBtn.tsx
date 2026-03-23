import { FaPlus } from "react-icons/fa"

const QuickActionsBtn = () => {
  return (
    <button className="bg-primary w-16 h-16 rounded-lg center-items flex-col gap-y-1">
        <FaPlus/>
        <span className="text-xs">
            Create
        </span>
    </button>
  )
}

export default QuickActionsBtn