"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { calculateShippingFee } from '@/lib/calculators/calculateShippingFee'
import { ShippingType } from '@/types/miscallaneous'
import { NextPage } from 'next'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'

type CalculateParametersType = {
    type: ShippingType
    weight: number
    amount: number
}

const Page: NextPage = ({}) => {

    const [calculateParameters, setCalculateParameters] = useState<CalculateParametersType>({
        type: "air",
        weight: 0,
        amount: 0,
    })

    const [isCalculating, setIsCalculating] = useState(false)

    const [totalPrice, setTotalPrice] = useState<number | null>(null)

    const shippingTypeValues: ShippingType[] = ["air", "sea", "express"]

    const handleSubmit = async () => {
        setIsCalculating(true)
        try{
            const res = await calculateShippingFee(
                calculateParameters.weight,
                calculateParameters.amount,
                calculateParameters.type
            )

            setTotalPrice(res)

        }
        catch(err){
            console.error("ERR calculating shipping fee", err)
        }
        finally{
            setIsCalculating(false)
        }
        

    }

  return <>
    <div className='h-full w-full p-body space-y-body'>
        <div className='bg-accent-blue h-fit rounded-lg p-body md:max-w-150 md:mx-auto'>
            <h1 className='text-white font-bold text-lg'>
                Shipping Cost Estimate
            </h1>
            <p className='text-xs text-white/60 mt-1 w-[90%]'>
                {"We'll"} give you an accurate price estimate for your shipping order
            </p>
        </div>

        <div className='text-sm md:max-w-150 md:mx-auto'>
            <h2 className='py-2'>
                Shipping Type
            </h2>
            <div className=''>
                <InputComponent 
                name='type'
                type="text"
                state={calculateParameters}
                setState={setCalculateParameters}
                readonly
                select
                selectValues={[
                    {name: "Air Shipping", value: "air"},
                    {name: "Sea Shipping", value: "sea"},
                    {name: "Express Shipping", value: "express"}
                ]}
                />
            </div>
        </div>

        <div className='text-sm md:max-w-150 md:mx-auto'>
            <h2 className='py-2'>
                Shipping Information    
            </h2>
            <div className='flex text-xs mt-3 justify-center gap-4'>
                <InputComponent 
                title='Weight'
                name='weight'
                type="number"
                state={calculateParameters}
                setState={setCalculateParameters}
                unit='Kg'
                />

                <InputComponent 
                title='Amount'
                name='amount'
                type="number"
                state={calculateParameters}
                setState={setCalculateParameters}
                unit='No.'
                />
            </div>
        </div>
        <div className='md:max-w-150 md:mx-auto'>
            <button 
            className='w-full bg-accent-red text-white py-2 rounded disabled:opacity-50'
            onClick={handleSubmit}
            disabled={isCalculating}
            >
                {
                    isCalculating ?
                    <BeatLoader color='#fff' size={10}/> :
                    "Estimate"
                }
            </button>
        </div>

        <div className='mt-4 p-body bg-light rounded-lg text-xs md:max-w-150 md:mx-auto'>
            <p>Total Price: ₦ {totalPrice?.toFixed(2) || "0.00"}</p>
        </div>
    </div>
  </>
}

export default Page