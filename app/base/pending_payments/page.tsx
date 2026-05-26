"use client"

import InputComponent from "@/components/admin/shipments/InputComponent"
import MonnifyPaymentButton from "@/components/base/MonnifyPaymentBtn"
import { Payment, User } from "@/types/entityTypeDef"
import { PaymentStatus } from "@/types/statusTypes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaChevronLeft, FaUser } from "react-icons/fa"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function PendingPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(false)

  const router = useRouter()
  type Filter = {
    tracking_id: string
    status: PaymentStatus | ""
  }

  const [filterValues, setFilterValues] = useState<Filter>({
    tracking_id: "",
    status: "",
  })

  const fetchPayments = async () => {
    setIsDataLoading(true)
    try {
      const userRes = await fetch("/api/users/my-data")
      const userData = await userRes.json()
      if (!userRes.ok) {
        toast.error(userData.message)
      }

      const res = await fetch("/api/payments/user")
      const result = await res.json()

      if (!res.ok) {
        console.error("Error Fetching Payments", result)
        return
      }

      setPayments(result.data.filter((payment: Payment) => payment.status === "pending"))
      setUser(userData.data)
    } catch (err) {
      console.error("Error Fetching Payments", err)
      toast.error("Error Fetching Payments")
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const data = payments.filter((x) =>
    x.shipment_tracking_number
      .toLowerCase()
      .includes(filterValues.tracking_id.toLowerCase())
  )

  const customerName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
    : ""

  return (
    <div className="w-full h-full">
      <div className="p-body h-14 bg-accent-blue flex text-white items-center justify-between">
        <button
          className="flex gap-2 flex-1 justify-start"
          onClick={() => {
            router.back()
          }}
        >
          <span className="text-xs font-semibold">Go Back</span>
        </button>
        <h1 className="font-semibold text-xs">Pending Payments</h1>
        <Link href={"/base/profile"} className="flex-1 flex justify-end">
          <FaUser />
        </Link>
      </div>

      <div className="bg-white p-4 flex flex-col gap-2 w-full">
        <div className="flex items-center text-xs gap-1">
          <InputComponent
            name="tracking_id"
            type="text"
            state={filterValues}
            setState={setFilterValues}
            placeHolder="Tracking Number Id..."
          />
          <button className="h-full px-4 py-2 bg-accent-red text-white rounded">
            Search
          </button>
        </div>
      </div>

      <div className="bg-light p-4 min-h-150 space-y-2 w-full">
        {isDataLoading ? (
          <div className="flex justify-center py-5">
            <BeatLoader color="#f26430" size={15} />
          </div>
        ) : (
          <>
            {payments.length < 1 && (
              <p className="text-xs italic">...No pending Payments</p>
            )}

            {data.map((payment) => (
              <PaymentCard
                payment={payment}
                userEmail={user?.email || ""}
                customerName={customerName}
                key={payment.shipment_tracking_number}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

const PaymentCard = ({
  payment,
  userEmail,
  customerName,
}: {
  payment: Payment
  userEmail: string
  customerName: string
}) => {
  return (
    <div className="border border-dark/20 p-4 py-3 space-y-2 rounded">
      <div className="flex items-center justify-between">
        <p className="border border-dark/20 px-4 py-2 rounded-full text-xs w-fit bg-accent-red/10">
          {payment.shipment_tracking_number}
        </p>
        <div className="bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit">
          <span className="text-[10px] text-accent-blue block">{payment.status}</span>
        </div>
      </div>

      <div className="text-xs flex items-end justify-between">
        <div className="flex-col flex gap-1 border border-dark/20 rounded p-3 w-40 ">
          <p className="whitespace-nowrap">Amount: ₦ {payment.amount}</p>
          <p className="whitespace-nowrap">{payment.created_at.slice(0, 10)}</p>
        </div>
        <MonnifyPaymentButton
          amount={payment.amount}
          customerEmail={userEmail}
          customerName={customerName || userEmail}
          paymentReference={payment.transaction_ref}
        />
      </div>
    </div>
  )
}
