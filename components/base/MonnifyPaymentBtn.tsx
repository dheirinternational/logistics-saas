"use client"


export default function MonnifyPayButton({transactionRef} : {transactionRef: string}){
    
    const handlePayment = async() => {
        console.log("Heyy")
        console.log(transactionRef)
        const res = await fetch("/api/monnify/initialize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: 5000,
                customerName: "John Doe",
                customerEmail: "john@example.com",
                transactionRef
            })
        })
        console.log(res)

        const result = await res.json()
        console.log(result)

        if (!res.ok) {
            console.log("PAYMENT ERROR:", result.message);
            return;
        }

        window.location.href = result.data.checkoutUrl
    }

    return <button onClick={handlePayment} className="bg-accent-blue text-white text-[10px] opacity-80 px-3 py-2 rounded">
        Pay Now
    </button>

}