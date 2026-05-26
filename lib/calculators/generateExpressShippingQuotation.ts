import { MoneyExchangeRate } from "@/app/base/estimate/page"
import { AirPricingTemplate } from "@/types/entityTypeDef"
import { toast } from "react-toastify"


//      {
//       id: 1,
//       name: 'phone',
//       price: '20.50',
//       clearance: '1200.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 2,
//       name: 'laptop',
//       price: '35.80',
//       clearance: '1200.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 3,
//       name: 'tablet_below_1kg',
//       price: '25.50',
//       clearance: '1200.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 4,
//       name: 'tablet_above_1kg',
//       price: '25.50',
//       clearance: '1200.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 5,
//       name: 'items_above_20kg',
//       price: '14.00',
//       clearance: '1600.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     },
//     {
//       id: 6,
//       name: 'items_below_20kg',
//       price: '16.00',
//       clearance: '1600.00',
//       duration_type: 'days',
//       min_duration: 3,
//       max_duration: 5
//     }
//   ]

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


export const generateExpressShippingQuotation = async (itemCart: ItemCartType[]) => {
    
    try{
        const res = await fetch(`/api/pricing_template/express`)
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
        


        const phone: ItemCartType[] = []
        const laptop: ItemCartType[]  = []
        const tablet_below_1kg: ItemCartType[]  = []
        const tablet_above_1kg: ItemCartType[]  = []
        const items_above_20kg: ItemCartType[]  = []
        const items_below_20kg: ItemCartType[]  = []

        itemCart.forEach( item => {
            if(item.name === "phone"){
                phone.push(item)
            }else if(item.name === "laptop"){
                laptop.push(item)
            }else if(item.name === "tablet_below_1kg"){
                tablet_below_1kg.push(item)
            }else if(item.name === "tablet_above_1kg"){
                tablet_above_1kg.push(item)
            }else if(item.name === "items_above_20kg"){
                items_above_20kg.push(item)
            }else if(item.name === "items_below_20kg"){
                items_below_20kg.push(item)
            }
        })

        // Variants Template Assignment
        const phone_template: AirPricingTemplate = result.data[0]
        const laptop_template: AirPricingTemplate = result.data[1]
        const tablet_below_1kg_template: AirPricingTemplate = result.data[2]
        const tablet_above_1kg_template: AirPricingTemplate = result.data[3]
        const items_above_20kg_template: AirPricingTemplate = result.data[4]
        const items_below_20kg_template: AirPricingTemplate = result.data[5]


        // Price Calculation
        const phone_price = phone.reduce((acc, item) => acc + (item.numberOfItems * phone_template.price), 0)
        const laptop_price = laptop.reduce((acc, item) => acc + (item.numberOfItems * laptop_template.price), 0)
        const tablet_below_1kg_price = tablet_below_1kg.reduce((acc, item) => acc + (item.numberOfItems * tablet_below_1kg_template.price), 0)
        const tablet_above_1kg_price = tablet_above_1kg.reduce((acc, item) => acc + (item.numberOfItems * tablet_above_1kg_template.price), 0)
        const items_above_20kg_price = items_above_20kg.reduce((acc, item) => acc + (item.numberOfItems * items_above_20kg_template.price), 0)
        const items_below_20kg_price = items_below_20kg.reduce((acc, item) => acc + (item.numberOfItems * items_below_20kg_template.price), 0)


        //  Clearance Fee Calculation
        const phone_clearance_fee = phone.reduce((acc, item) => acc + (item.numberOfItems * phone_template.clearance), 0)
        const laptop_clearance_fee = laptop.reduce((acc, item) => acc + (item.numberOfItems * laptop_template.clearance), 0)
        const tablet_below_1kg_clearance_fee = tablet_below_1kg.reduce((acc, item) => acc + (item.numberOfItems * tablet_below_1kg_template.clearance), 0)
        const tablet_above_1kg_clearance_fee = tablet_above_1kg.reduce((acc, item) => acc + (item.numberOfItems * tablet_above_1kg_template.clearance), 0)
        const items_above_20kg_clearance_fee = items_above_20kg.reduce((acc, item) => acc + (item.numberOfItems * items_above_20kg_template.clearance), 0)
        const items_below_20kg_clearance_fee = items_below_20kg.reduce((acc, item) => acc + (item.numberOfItems * items_below_20kg_template.clearance), 0)
        

        //  Delivery Window Calculation 

        const phone_delivery_window = phone_template.min_duration + " - " + phone_template.max_duration + " " + phone_template.duration_type    
        const laptop_delivery_window = laptop_template.min_duration + " - " + laptop_template.max_duration + " " + laptop_template.duration_type
        const tablet_below_1kg_delivery_window = tablet_below_1kg_template.min_duration + " - " + tablet_below_1kg_template.max_duration + " " + tablet_below_1kg_template.duration_type
        const tablet_above_1kg_delivery_window = tablet_above_1kg_template.min_duration + " - " + tablet_above_1kg_template.max_duration + " " + tablet_above_1kg_template.duration_type
        const items_above_20kg_delivery_window = items_above_20kg_template.min_duration + " - " + items_above_20kg_template.max_duration + " " + items_above_20kg_template.duration_type
        const items_below_20kg_delivery_window = items_below_20kg_template.min_duration + " - " + items_below_20kg_template.max_duration + " " + items_below_20kg_template.duration_type

        
        const priceSubtotal = phone_price + laptop_price + tablet_below_1kg_price + tablet_above_1kg_price + items_above_20kg_price + items_below_20kg_price + (phone_clearance_fee / moneyRatesData.currency_two) + (laptop_clearance_fee / moneyRatesData.currency_two) + (tablet_below_1kg_clearance_fee / moneyRatesData.currency_two) + (tablet_above_1kg_clearance_fee) / (moneyRatesData.currency_two) + (items_above_20kg_clearance_fee / moneyRatesData.currency_two) + (items_below_20kg_clearance_fee / moneyRatesData.currency_two)

        // Total Price Calculation
        const total_price = priceSubtotal

        // Final Quotation Object Construction

        const quotation : QuotationState = {
            goods: [
                {
                    itemName: "phone",
                    price: phone_price.toFixed(2),
                    clearanceFee: phone_clearance_fee.toFixed(2),
                    expectedDeliveryWindow: phone_delivery_window,
                    quantity: phone.reduce((acc, item) => acc + item.numberOfItems, 0)
                },
                {
                    itemName: "laptop",
                    price: laptop_price.toFixed(2),
                    clearanceFee: laptop_clearance_fee.toFixed(2),
                    expectedDeliveryWindow: laptop_delivery_window,
                    quantity: laptop.reduce((acc, item) => acc + item.numberOfItems, 0) 
                },
                {
                    itemName: "tablet_below_1kg",
                    price: tablet_below_1kg_price.toFixed(2),
                    clearanceFee: tablet_below_1kg_clearance_fee.toFixed(2),
                    expectedDeliveryWindow: tablet_below_1kg_delivery_window,
                    quantity: tablet_below_1kg.reduce((acc, item) => acc + item.numberOfItems, 0) 
                },
                {
                    itemName: "tablet_above_1kg",
                    price: tablet_above_1kg_price.toFixed(2),
                    clearanceFee: tablet_above_1kg_clearance_fee.toFixed(2),
                    expectedDeliveryWindow: tablet_above_1kg_delivery_window,
                    quantity: tablet_above_1kg.reduce((acc, item) => acc + item.numberOfItems, 0)
                },
                {
                    itemName: "items_above_20kg",
                    price: items_above_20kg_price.toFixed(2),
                    clearanceFee: items_above_20kg_clearance_fee.toFixed(2),
                    expectedDeliveryWindow: items_above_20kg_delivery_window,
                    quantity: items_above_20kg.reduce((acc, item) => acc + item.numberOfItems, 0)
                },
                {
                    itemName: "items_below_20kg",
                    price: items_below_20kg_price.toFixed(2),
                    clearanceFee: items_below_20kg_clearance_fee.toFixed(2),
                    expectedDeliveryWindow: items_below_20kg_delivery_window,
                    quantity: items_below_20kg.reduce((acc, item) => acc + item.numberOfItems, 0)
                }
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

