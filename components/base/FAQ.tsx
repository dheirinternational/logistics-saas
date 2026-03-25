import { useState } from "react"
import { FaChevronDown } from "react-icons/fa"

const FAQ = () => {

    const [isActive, setIsActive] = useState(false)
  return (
    <div>
        <div className="h-fit text-sm">
            <div className="bg-accent-red p-2 rounded-lg text-white flex justify-between items-center relative z-50">
              <span>
                Lorem ipsum dolor?
              </span>
              <button
              onClick={() => setIsActive(!isActive)}
              className={`${isActive && "rotate-180"}`}
              >
                <FaChevronDown />
              </button>
            </div>
            <div className={` bg-light -mt-2 relative z-40  rounded-b-lg shadow shadow-dark/10 transition-set overflow-hidden 
            ${isActive ? "h-fit pb-8 p-4" : "h-0 max-h-0"}    
            `}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Id, accusantium. Officia, qui porro! Repellendus nihil placeat, a quas quidem quaerat, adipisci fugit voluptatem enim ea iusto perferendis vel pariatur blanditiis?
            </div>
          </div>
    </div>
  )
}

export default FAQ