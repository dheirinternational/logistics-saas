"use client"

import { PortalAccountPageHeader } from "@/components/portal/account/PortalAccountPageHeader"
import {
  PortalFormField,
  PortalFormInput,
  PortalFormSelect,
} from "@/components/portal/packages/PortalFormField"
import type { Address } from "@/types/entityTypeDef"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

type AddressState = Omit<Address, "id" | "created_at" | "user_id">

type StateOption = {
  id: number
  name: string
}

const COUNTRIES = ["Nigeria"] as const

export function PortalMyAddressPage() {
  const router = useRouter()
  const [address, setAddress] = useState<AddressState>({
    country: "Nigeria",
    state: "",
    city: "",
    street: "",
    postal_code: "",
  })
  const [states, setStates] = useState<StateOption[]>([])
  const [isAddressExisting, setIsAddressExisting] = useState(false)
  const [isUploadingAddress, setIsUploadingAddress] = useState(false)
  const [isFetchingStates, setIsFetchingStates] = useState(false)
  const [isFetchingAddress, setIsFetchingAddress] = useState(true)

  const addAddress = async () => {
    setIsUploadingAddress(true)
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(address),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message)
        return
      }

      if (data.success) {
        toast.success(data.message)
        router.push("/customer/profile")
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      console.error(err)
      toast.error("Could not save address")
    } finally {
      setIsUploadingAddress(false)
    }
  }

  const updateAddress = async () => {
    setIsUploadingAddress(true)
    try {
      const res = await fetch("/api/addresses/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(address),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message)
        return
      }

      toast.success(data.message)
      router.push("/customer/profile")
    } catch (err) {
      console.error(err)
      toast.error("Could not update address")
    } finally {
      setIsUploadingAddress(false)
    }
  }

  const fetchStates = async () => {
    setIsFetchingStates(true)
    try {
      const res = await fetch("/api/states")
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message)
        return
      }

      setStates(result.data ?? [])
    } catch (err) {
      console.error(err)
      toast.error("Could not load states")
    } finally {
      setIsFetchingStates(false)
    }
  }

  useEffect(() => {
    const fetchAddress = async () => {
      setIsFetchingAddress(true)
      try {
        const res = await fetch("/api/addresses/user", {
          credentials: "include",
        })
        const data = await res.json()

        if (!res.ok) {
          return
        }

        if (data.success && data.data.length > 0) {
          const existing = data.data[0] as AddressState
          setAddress({
            country: existing.country || "Nigeria",
            state: existing.state,
            city: existing.city,
            street: existing.street,
            postal_code: existing.postal_code ?? "",
          })
          setIsAddressExisting(true)
        }
      } catch (err) {
        console.error(err)
        toast.error("Could not load your address")
      } finally {
        setIsFetchingAddress(false)
      }
    }

    fetchAddress()
    fetchStates()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isAddressExisting) {
      updateAddress()
    } else {
      addAddress()
    }
  }

  const loading = isFetchingAddress || isFetchingStates

  if (loading) {
    return (
      <div className="portal-account portal-account--centered">
        <DheirLoader color="var(--color-dheir-blue)" size={12} />
      </div>
    )
  }

  return (
    <div className="portal-account">
      <PortalAccountPageHeader
        title="My address"
        description="Delivery address for shipments and marketplace checkout in Nigeria."
      />

      <form onSubmit={handleSubmit} className="portal-packages__form">
        <section className="portal-account__card">
          <div className="portal-packages__form-grid">
            <PortalFormField label="Country">
              <PortalFormSelect
                name="country"
                required
                value={address.country}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, country: e.target.value }))
                }
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </PortalFormSelect>
            </PortalFormField>

            <PortalFormField label="State">
              <PortalFormSelect
                name="state"
                required
                value={address.state}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, state: e.target.value }))
                }
              >
                <option value="">Select state</option>
                {states.map((state) => (
                  <option key={state.id} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </PortalFormSelect>
            </PortalFormField>
          </div>

          <div className="portal-packages__form-grid">
            <PortalFormField label="City">
              <PortalFormInput
                name="city"
                required
                value={address.city}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </PortalFormField>

            <PortalFormField label="Postal code">
              <PortalFormInput
                name="postal_code"
                value={address.postal_code}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    postal_code: e.target.value,
                  }))
                }
              />
            </PortalFormField>
          </div>

          <PortalFormField
            label="Street address"
            hint="House number, street name, and area"
          >
            <PortalFormInput
              name="street"
              required
              value={address.street}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, street: e.target.value }))
              }
            />
          </PortalFormField>

          <button
            type="submit"
            className="portal-packages__btn-primary portal-packages__btn-primary--block"
            disabled={isUploadingAddress}
          >
            {isUploadingAddress ? (
              <DheirLoader color="#fff" size={8} />
            ) : isAddressExisting ? (
              "Update address"
            ) : (
              "Save address"
            )}
          </button>
        </section>
      </form>
    </div>
  )
}
