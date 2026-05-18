import { getMonnifyToken } from "./auth";

type InitializePaymentParams = {
    amount: number
    customerName: string
    customerEmail: string
    metadata?: {
        type: "shipment" | "order"
    }
    transactionRef: string
}

export async function initializePayment({amount, customerName, customerEmail, transactionRef}: InitializePaymentParams){
    const token = await getMonnifyToken()
    console.log(transactionRef)


    const res = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `application/json` 
        },
        body: JSON.stringify({
            amount,
            customerName,
            customerEmail,
            paymentReference: transactionRef,
            paymentDescription: "Order",
            currencyCode: "NGN",
            contractCode: process.env.MONNIFY_CONTRACT_CODE,
            redirectUrl: "https://0fd6-102-89-68-207.ngrok-free.app/base/payment/success",
            paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
            onComplete(response) {
                console.log(response, "REDIRECTTTTTTTTTTTTTTTTTTTT")
            }
        })
    })

    if (!res.ok) {
        console.log(await res.json())
        throw new Error("Failed to initialize payment")
    }

    const data = await res.json()
    console.log(data.responseBody)

    return data.responseBody;
}