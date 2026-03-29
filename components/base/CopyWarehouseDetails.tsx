"use client"

import { useEffect, useState } from "react"
import { FaCheck } from "react-icons/fa"

const CopyWarehouseDetails = () => {

    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            setIsCopied(false)
        }, 3000)

        return () => {clearInterval(timeOutId)}
    }, [isCopied])

    const handleCopy = async () => {
        try{
            await navigator.clipboard.writeText("Copied text")
            setIsCopied(true)
        }
        catch(err){
            console.error(err)  
        }
    }

  return (
    <div className="text-sm flex items-center justify-between">
        <p className="">
            Recipent: lorem lorem
        </p>
        <button 
        className="text-xs w-16 h-7 bg-accent-red text-secondary-text rounded-full justify-center flex items-center disabled:bg-accent-red/40"
        disabled={isCopied}
        onClick={handleCopy}
        >
            {
                isCopied ? <FaCheck/> : "copy"
            }
        </button>
    </div>
  )
}

export default CopyWarehouseDetails