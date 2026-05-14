import { Package, PackageImage } from "@/types/entityTypeDef"
import Image from "next/image"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

interface Props {
    prop: Package
    handlePackage?: Dispatch<SetStateAction<Package[]>>
}

const RequestMailProduct = ({prop, handlePackage}: Props) => {

    // Array
    const [packageImages, setPackageImages] = useState<PackageImage[]>([])


    // Selectors
    const [isSelected, setIsSelected] = useState(false)



    // Loading Indicator
    const [isFetchingImages, setIsFetchingImages] = useState(true)  


    // Fetch package images
    const fetchPackageImages = async () => {
        setIsFetchingImages(true)
        try{
            const res = await fetch(`/api/packages/images/${prop.id}`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return 
            }

            setPackageImages(result.data)
        }
        catch(err: any){
            console.error("Network Error", err)
            // toast.error(err.message)
        }
        finally{
            setIsFetchingImages(false)
        }
    }

    useEffect(() => {
        fetchPackageImages()
    }, [])


    
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
    <div 
    className={`
        border border-dark/20 p-4 py-3 space-y-2 rounded transition-set    
        ${isSelected ? "bg-accent-red/30" : ""} 
    `}
    onClick={() => {
        if(handlePackage) {
            setIsSelected(!isSelected)
        }
    }}
    >
        <div className='flex items-center justify-between'>
            <p className='border border-dark/8 text-sm p-2 rounded shadow-sm'>
                {prop.package_name}
            </p>
            <p className='text-[10px] text-dark/70 whitespace-nowrap '>
                Track: {prop.incoming_package_id}
            </p>
            <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                <span className='text-[10px] text-accent-blue block'>
                    {prop.status}
                </span>
            </div>
        </div>

        <div className='text-xs flex'>

            <div className='flex-1 flex gap-2 p-2 border border-dark/8 rounded shadow-sm bg-gray-100'>
                {
                    isFetchingImages && <div className='p-3'>
                        <BeatLoader color='orange' size={8} />
                    </div>
                }
                {packageImages.map( image => 
                    <figure key={image.id} className='w-10 h-10 relative overflow-hidden rounded border border-dark/20'>
                        <Image 
                        src={image.image_url}
                        alt={image.alt_text || "heyyy"}
                        fill
                        className='object-cover'
                        />
                    </figure>
                    )}
            </div>
            
            <p className='flex-1 whitespace-nowrap flex justify-end text-[10px]'>
                Added: {new Date(prop.created_at).toDateString()}
            </p>
        </div>
    </div>
  )
}

export default RequestMailProduct