export const calculateShippingFee = async (weight: number, number_of_items: number, shipping_method: string, wrapping_type?: string, payment_method?: string) => {


    if (weight <= 0 ) {
        throw new Error("Invalid input: Weight must be greater than 0 ");
    }

    try{
        const res = await fetch(`${process.env.BASE_URL}/api/shipments/calculate-fee`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            }
            , body: JSON.stringify({
                weight,
                number_of_items,
                shipping_method,
                wrapping_type,
                payment_method
            })
        })
        const result = await res.json()


        if(!res.ok){
            throw new Error(result.message || "Failed to calculate shipping fee")
        }


        return result.data

    }
    catch(err){
        console.error("Error calculating shipping fee", err)
    }
    
}