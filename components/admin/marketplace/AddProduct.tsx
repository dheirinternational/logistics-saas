"use client"

import { FormEvent, useState } from "react"
import InputComponent from "../shipments/InputComponent"
import { IoCreate } from "react-icons/io5"
import { Product} from "@/types/entityTypeDef"

type ProductValues = Omit<Product, "id" | "status" | "slug" | "createdAt" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt">

const AddProduct = () => {

    // const [productValues, setProductValues] = useState<ProductValues>({
    //     name: "",
    //     description: "",
    //     categoryId: "",
    //     price: 0,
    //     discountPrice: 0,
    //     costPrice: 0,
    //     stock_quantity: 0,
    //     low_stock_threshold: 0,
    //     weight: 0,
    //     length: 0,
    //     width: 0,
    //     height: 0,
    //     visibility: "public",
    //     isFeatured: "",
    // })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* <InputComponent name="name" type="text" title="Product Name" state={productValues} setState={setProductValues}/>
        <InputComponent name="description" type="text" title="Description (Optional)" state={productValues} setState={setProductValues}/>
        <InputComponent name="categoryId" type="text" title="Category ID (Optional)" state={productValues} setState={setProductValues}/>
        <InputComponent name="price" type="number" title="Price" state={productValues} setState={setProductValues}/>
        <InputComponent name="discountPrice" type="number" title="Discount Price (Optional)" state={productValues} setState={setProductValues}/>
        <InputComponent name="costPrice" type="number" title="Cost Price (Optional)" state={productValues} setState={setProductValues}/>
        <InputComponent name="stock_quantity" type="number" title="Stock Quantity" state={productValues} setState={setProductValues}/>
        <InputComponent name="low_stock_threshold" type="number" title="Low Stock Threshold" state={productValues} setState={setProductValues}/>
        <InputComponent name="weight" type="number" title="Weight" state={productValues} setState={setProductValues}/>
        <InputComponent name="length" type="number" title="Length" state={productValues} setState={setProductValues}/>
        <InputComponent name="width" type="number" title="Width" state={productValues} setState={setProductValues}/>
        <InputComponent name="height" type="number" title="Height" state={productValues} setState={setProductValues}/>
        <InputComponent name="visibility" type="text" title="Visibility" state={productValues} setState={setProductValues}
        />
        <InputComponent name="isFeatured" type="checkbox" title="Featured Product" state={productValues} setState={setProductValues}/>
        <div className="">
            <button className="flex items-center justify-center gap-1 bg-accent-blue px-4 py-3 rounded-lg mt-4 float-right">
                <IoCreate/>
                <p className="text-xs font-bold">
                    Add
                </p>
            </button>
        </div> */}
    </form>
  )
}

export default AddProduct