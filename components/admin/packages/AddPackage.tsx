"use client"

import { ChangeEvent, FormEvent, useState } from "react"
import { IoCreate } from "react-icons/io5"
import { IncomingPackage, Package } from "@/types/entityTypeDef"
import InputComponent from "../shipments/InputComponent"
import Image from "next/image"
import { toast } from "@/lib/ui/toast"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { useRouter } from "next/navigation"


type PackageValues = Omit<Package, "id" | "created_at" >

const AddPackage = ({props} : {props: IncomingPackage}) => {

//     const [packageValues, setPackageValues] = useState<PackageValues>({
//         package_name: props.declared_item_name,
//         weight: 0,
//         condition: "good",
//         status: "stored",
//         received_at: "",
//         stored_at: "",
//         customer_code: props.customer_code,
//         warehouse_id: Number(props.warehouse_id),
//         user_id: props.user_id,
//         incoming_package_id: props.incoming_tracking_number,
//     })
    
//     const [images, setImages] = useState<File[]>([])
//     const [previews,setPreviews] = useState<string[]>([])
//     const [isSubmitting, setIsSubmitting] = useState(false)

//     const router = useRouter()

    

//     const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault()
//         setIsSubmitting(true)

//         const formData = new FormData(e.currentTarget)
//         formData.append("inp_status", props.status)
//         formData.append("user_id", String(props.user_id))

//         try{
//             const res = await fetch("/api/packages", {
//                 method: "POST",
//                 body: formData
//             })

//             const result = await res.json()

//             if(!res.ok){
//                 toast.error(result.message)
//                 return
//             }

//             toast.success("Successfully Added package")
//             router.push("/admin/shipments")
            
//         }
//         catch(err){
//             toast.error("ERR adding package")
//             console.error(err)
//         }
//         finally{
//             setIsSubmitting(false)
//         }
//     }

//     const hanldeImageChange = (e:ChangeEvent<HTMLInputElement>) => {

//         if(!e.target.files) return

//         const files = Array.from(e.target.files)

//         if(files.length < 1){
//             toast.error("Select Images")
//             return
//         }
//         else if(files.length !== 4){
//             toast.error("Select Just Four images")
//             return
//         }

//         const urls = files.map( file => URL.createObjectURL(file) )
//         setPreviews(urls)
//         setImages(files)
//     }

//     // const handleImageUpload = async () => {
//     //     if(images.length < 0) return

//     //     const sigRes = await fetch("/api/sign-cloudinary", {
//     //         method: "POST"
//     //     })

//     //     const {timestamp, signature, apiKey, cloudName} = await sigRes.json()

//     //     const uploads = await Promise.all(
//     //         images.map( async (file) => {

//     //             if (file.size > (5 * 1024 * 1024)) {
//     //                 toast.error("Image size should not exceed 5mb")
//     //                 throw new Error("Image size should not exceed 5mb")
//     //             }
//     //             const formData = new FormData()
//     //             formData.append("file", file)
//     //             formData.append("timestamp", timestamp)
//     //             formData.append("signature", signature)
//     //             formData.append("api_key", apiKey)
//     //             formData.append("folder", "logistics")

//     //             return fetch(
//     //                 `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
//     //                 { method: "POST", body: formData }
//     //             ).then( (r) => r.json())
//     //         })
//     //     )   

//     //     const urls = uploads.map((u) => u.secure_url)
//     //     alert(urls)
//     // }

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <InputComponent name="package_name" type="text" title="Package Name" state={packageValues} setState={setPackageValues} required readonly/>
//         <InputComponent name="weight" type="number" title="Actual Weight of product" state={packageValues} setState={setPackageValues} required/>

//         <InputComponent name="warehouse_id" type="text" title="Warehouse" state={packageValues} setState={setPackageValues} readonly required/>

//         <InputComponent name="customer_code" type="text" title="Customer Code" state={packageValues} setState={setPackageValues} readonly required/>

//         <InputComponent name="incoming_package_id" type="text" title="Incoming Package ID" state={packageValues} setState={setPackageValues} readonly required/>

//         <InputComponent name="received_at" type="datetime-local" title="Date Received" state={packageValues} setState={setPackageValues} required/>

//         <InputComponent name="stored_at" type="datetime-local" title="Date stored" state={packageValues} setState={setPackageValues} required/>

//         <InputComponent 
//         name="condition" 
//         type="text" 
//         title="Package Condition" 
//         state={packageValues} 
//         setState={setPackageValues}
//         select
//         selectValues={[{name: "Good", value: "good"} ,{name: "Damaged", value : "damaged"}]}
//         required
//         />

//         <input 
//         type="file" 
//         accept="image/*"
//         multiple
//         name="images"
//         onChange={hanldeImageChange}
//         className="bg-light text-xs w-40 py-1 pl-2 rounded-"
//         />


//         <div className="flex gap-2">
//             {previews.map( (x, i) => 
//             <figure key={i} className="w-15 h-15 bg-accent-red rounded overflow-hidden relative">
//                 <Image 
//                     src={x}
//                     alt=""
//                     fill
//                     />
//                 </figure>
//         )}
//         </div>
//         {/* <button 
//         type="button"
//         onClick={handleImageUpload}
//         >
//             Submit
//         </button> */}

//         <div className="">
//             <button className="flex items-center justify-center gap-1 bg-accent-blue px-4 py-3 rounded-lg mt-4 float-right text-white"
//             disabled={isSubmitting}
//             >
//                 {
//                     isSubmitting ? 
//                     <DheirLoader color="#FFF" size={15}/> :
//                     <>
//                         <IoCreate/>
//                         <p className="text-xs font-bold">
//                             Add
//                         </p>
//                     </>
//                 }
//             </button>
//         </div>
//     </form>
//   )
}

export default AddPackage