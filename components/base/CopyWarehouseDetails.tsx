"use client"

import { useEffect, useState } from "react"
import { FaCheck } from "react-icons/fa"

const CopyWarehouseDetails = ({text, title} : {text: string, title: string}) => {

    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            setIsCopied(false)
        }, 3000)

        return () => {clearInterval(timeOutId)}
    }, [isCopied])

    const handleCopy = async () => {
        try{
            await navigator.clipboard.writeText(text)
            setIsCopied(true)
        }
        catch(err){
            console.error(err)  
        }
    }

  return (
    <div className="text-sm flex items-center justify-between flex-wrap gap-3">
        <p className="">
            <span className="font-semibold">{title}:</span> {text}
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