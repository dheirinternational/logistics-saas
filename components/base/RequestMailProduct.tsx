import { Package } from "@/types/entityTypeDef"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

interface Props {
    prop: Package
    handlePackage?: Dispatch<SetStateAction<Package[]>>
}

const RequestMailProduct = ({prop, handlePackage}: Props) => {

    const [isSelected, setIsSelected] = useState(false)

    useEffect(() => {
        if(!handlePackage) return

        if(isSelected){
            handlePackage(prev => {
                const prevArray = prev.filter( packag => packag.id != prop.id )
                return([...prevArray, {...prop}])
            })
        } else{
            handlePackage(prev => prev.filter(packag => packag.id != prop.id))
        }
    }, [isSelected])


  return (
    <div className={`
        border border-dark/20 p-4 py-3 space-y-2 rounded active:scale-90 transition-set
        ${isSelected ? "bg-accent-red/30" : ""}    
    `}
    onClick={() => {
        if(handlePackage) {
            setIsSelected(!isSelected)
        }
    }}
    >
            <div className='flex items-center justify-between'>
                <p className='text-lg'>
                    {prop.package_name}
                </p>
                <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                    <span className='text-[10px] text-accent-blue block'>
                        {prop.status}
                    </span>
                </div>
            </div>

            <div className='text-xs flex'>
                <p className='text-xs flex-1 whitespace-nowrap border-r border-dark/20'>
                    Track: {prop.incoming_package_id}
                </p>
                <p className='flex-1 whitespace-nowrap flex justify-center border-r border-dark/20'>
                    {prop.warehouse_id}
                </p>
                <p className='flex-1 whitespace-nowrap flex justify-end'>
                    {prop.created_at.slice(0, 10)}
                </p>
            </div>
        </div>
  )
}

export default RequestMailProduct