"use client"

import { Order } from "@/types/entityTypeDef"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { BiChevronLeft } from "react-icons/bi";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";

export type OrderItem = {
  id: number;

  order_id: string;

  product_id: number;
  product_name: string

  quantity: number;
  unit_price: number;
  subtotal: number;
  image: string

  created_at: string; // ISO timestamp
};

export default function Page(){

    const params = useParams()
    
    const [order, setOrder] = useState<Order | null>(null)
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)

    const router = useRouter()

    // Fetch Order Items and order
    useEffect(() => {

        const fetchOrderAndItems = async () => {
            setIsDataLoading(true)
            try{
                const orderRes = await fetch(`/api/orders/${params.id}`)
                const orderResult = await orderRes.json()

                const itemsRess = await fetch(`/api/orders/items/${params.id}`)
                const itemsResult = await itemsRess.json()

                console.log(itemsResult)

                // const itemsRes = await fetch()

                setOrder(orderResult.data)
                setOrderItems(itemsResult.data)
            
            }
            catch(err){
                console.error("ERR:: Fetching order items", err)
                toast.error("ERR:: Fetching order items")
            }
            finally{
                setIsDataLoading(false)
            }
        }


        fetchOrderAndItems()
    }, [])

    return(
        <div className='h-full w-full space-y-2 bg-red-400 p-body'>
            <div className="flex gap-6 items-center">
                <button 
                className="text-xs flex items-center"
                onClick={() => {router.back()}}
                >
                    <BiChevronLeft className="text-lg"/>
                    Back
                </button>
                <h1 className="font-bold">
                    {order?.order_id}
                </h1>
            </div>
            {
            isDataLoading ? 
            <BeatLoader color="orange" size={10} />
            :
            <>
                <div className="mt-8">
                    <h3 className="text-xs">
                        Order Details
                    </h3>
                    <div className="border border-dark/20 p-2 w-full rounded mt-2">
                        <table className=" table-auto w-full">
                            <thead>
                                <tr className="text-xs">
                                    <th className="text-dark text-left p-2 py-0">ID</th>
                                    <th className="text-dark text-left p-2 py-0">Product Name</th>
                                    <th className="text-dark text-left p-2 py-0">Qty</th>
                                    <th className="text-dark text-left p-2 py-0">Price</th>
                                    <th className="text-dark text-left p-2 py-0">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems.map( item => 
                                    <tr 
                                    key={item.id}
                                    className="text-xs border-t border-dark/10">
                                        <td className="p-2">{orderItems[0]?.product_id}</td>
                                        <td className="p-2">{orderItems[0]?.product_name}</td>
                                        <td className="p-2">x {orderItems[0]?.quantity}</td>
                                        <td className="p-2">₦{orderItems[0]?.unit_price}</td>
                                        <td className="p-2">₦{orderItems[0]?.subtotal}</td>
                                        
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                <div>
                    <h3 className="text-sm mt-6 font-semibold">
                        Paid By Customer
                    </h3>
                    <div className="border border-dark/20 p-4 rounded mt-4 text-xs gap-3">
                        <div className="flex justify-between">
                            <div className="flex">
                                <p className="min-w-18">Subtotal</p>
                                <p>{orderItems.length} items</p>
                            </div>
                            <div>
                                <p>₦{String(order?.total_price).slice(0, -3)}</p>
                            </div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="flex">
                                <p className="min-w-18">Delivery fee</p>
                                {/* <p>{order?.delivery_fee}</p> */}
                            </div>
                            <div>
                                <p>₦{String(order?.delivery_fee).slice(0, -3)}</p>
                            </div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="flex">
                                <p className="min-w-18">Total Paid</p>
                                {/* <p>{order?.delivery_fee}</p> */}
                            </div>
                            <div>
                                <p>₦{Number(order?.total_price) || 0 + Number(order?.delivery_fee)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold">
                        Timeline
                    </h3>
                    <div className="border border-dark/20 p-body rounded mt-2">
                        <p className="text-xs gap-2">
                            Status: 
                            <span>&nbsp;&nbsp;{order?.status}</span>
                        </p>
                    </div>
                </div>
            </>}
        </div>
    )
}   