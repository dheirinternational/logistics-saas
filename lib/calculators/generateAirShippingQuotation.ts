import type { MoneyExchangeRate } from "@/lib/portal/quote/types"
import { AirPricingTemplate } from "@/types/entityTypeDef"
import { toast } from "react-toastify"

type ItemCartType = {
    id: number
    name: string
    weight: number
    numberOfItems: number
}

type QuotationResultType = {
    itemName: string
    price: string
    clearanceFee: string
    expectedDeliveryWindow: string
    quantity: number
}

type QuotationState = {
    goods: QuotationResultType[]
    totalPrice: string
}

const PAYMENT_GATEWAY_FEE_RATE = 1.5


export const generateAirShippingQuotation = async (itemCart: ItemCartType[]) => {
    
    try{
        const res = await fetch(`/api/pricing_template/air`)
        const result = await res.json()

        const moneyRatesRes = await fetch(`/api/money-exchange-rate`)
        const moneyRatesResult = await moneyRatesRes.json()

        if(!res.ok){
            toast.error(result.message)
            return
        }

        if (!moneyRatesRes.ok){
            toast.error(moneyRatesResult.message)
            return
        }

        const moneyRatesData: MoneyExchangeRate = moneyRatesResult.data[0]


        

        const normal_goods: ItemCartType[] = []
        const special_goods: ItemCartType[]  = []

        itemCart.forEach( item => {
            if(item.name === "normal_goods"){
                normal_goods.push(item)
            }else if(item.name === "special_goods"){
                special_goods.push(item)
            }
        })

        const normal_goods_template: AirPricingTemplate = result.data[0]
        const special_goods_template: AirPricingTemplate = result.data[1]

        // console.log(normal_goods_template, special_goods_template)

        const noraml_goods_weight = normal_goods.reduce((acc, item) => acc + (item.weight * item.numberOfItems), 0)
        const special_goods_weight = special_goods.reduce((acc, item) => acc + (item.weight * item.numberOfItems), 0)

        const normal_goods_price = noraml_goods_weight * normal_goods_template.price
        const special_goods_price = special_goods_weight * special_goods_template.price

        const normal_goods_clearance_fee = noraml_goods_weight * normal_goods_template.clearance 
        const special_goods_clearance_fee = special_goods_weight * special_goods_template.clearance

        const normal_goods_quantity = normal_goods.reduce((acc, item) => acc + item.numberOfItems, 0)
        const special_goods_quantity = special_goods.reduce((acc, item) => acc + item.numberOfItems, 0)

        const normal_delivery_window = normal_goods_template.min_duration + " - " + normal_goods_template.max_duration + " " + normal_goods_template.duration_type
        const special_delivery_window = special_goods_template.min_duration + " - " + special_goods_template.max_duration + " " + special_goods_template.duration_type


        const total_price = normal_goods_price + special_goods_price + normal_goods_clearance_fee / moneyRatesData.currency_two + special_goods_clearance_fee / moneyRatesData.currency_two

        console.log({
            normal_goods_price,
            normal_goods_quantity,
            normal_goods_clearance_fee,
            normal_delivery_window,
        })

        console.log({
            special_goods_price,
            special_goods_quantity,
            special_goods_clearance_fee,
            special_delivery_window,
        }) 

        console.log(total_price.toFixed(2))

        const quotation : QuotationState = {
            goods: [
                {
                    itemName: "normal_goods",
                    price: normal_goods_price.toFixed(2),
                    clearanceFee: normal_goods_clearance_fee.toFixed(2),
                    expectedDeliveryWindow: normal_delivery_window,
                    quantity: normal_goods_quantity
                },
                {   
                    itemName: "special_goods",
                    price: special_goods_price.toFixed(2),
                    clearanceFee: special_goods_clearance_fee.toFixed(2),
                    expectedDeliveryWindow: special_delivery_window,
                    quantity: special_goods_quantity
                },
            ],
            totalPrice: total_price.toFixed(2)     
        }

        return quotation

    }
    catch(err){
        toast.error("Error Getting Air shipping Quotation")
        console.error("Error Getting Air shipping Quotation", err)
    }
}

