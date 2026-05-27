"use client"

import { AirPricingTemplate, SeaPricingTemplate } from "@/types/entityTypeDef"
import { useEffect, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { toast } from "@/lib/ui/toast"
import { IconX } from "@tabler/icons-react"

type DurationType = "days" | "weeks" | "months"


type MoneyExchangeRate = {
    name: string,
    currency_one: number,
    currency_two: number
}


export default function Page(){

    // Money Exchange rate
    const [moneyExchangeRate, setMoneyExhangeRate] = useState<MoneyExchangeRate[]>([])


    // selected values
    const [currency, setCurrency] = useState<"Naira" | "Dollar">("Dollar")
    const [currentSelectedCurrencyValue, setCurrentSelectedCurrencyValue] = useState(0)


    // Loading States
    const [isFetchingMoneyExchangeRates, setIsFetchingMoneyExchangeRates] = useState(true)


    // Fetch Money exchange rates
    useEffect(() => {
        const fetchMoneyExchangeRates = async() => {
            try{
                const res = await fetch(`/api/money-exchange-rate`)
                const result = await res.json()

                if(!res.ok){
                    toast.error(result.message)
                    return
                }   

                console.log(result)

                setMoneyExhangeRate(result.data)
                setCurrentSelectedCurrencyValue(result.data[0].currency_one)
            }
            catch(err: any){
                console.error(err.message, err)
                toast.error(err.message)
            }
            finally{
                setIsFetchingMoneyExchangeRates(false)
            }
        }

        fetchMoneyExchangeRates()
    }, [])



    return (
        <div className="portal-home">
            <header className="portal-home__greeting">
                <div>
                    <p className="portal-home__greeting-label">Admin</p>
                    <h1 className="portal-home__greeting-title">Pricing list</h1>
                    <p className="portal-home__greeting-sub">
                        Manage, edit and update all pricing templates from one control deck.
                    </p>
                </div>
            </header>

            {isFetchingMoneyExchangeRates ? (
                <div className="portal-home__panel portal-home__loader">
                    <DheirLoader color="var(--color-dheir-blue)" size={12} />
                </div>
            ) : (
                <>
                    <section className="portal-home__panel" aria-label="Currency display">
                        <div className="portal-home__panel-head">
        <div>
                                <h2 className="portal-home__section-title">Currency</h2>
                                <p className="portal-home__section-sub">Display values in dollars or naira.</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                            <button
                                type="button"
                                className={`portal-home__btn ${
                                    currency === "Dollar" ? "portal-home__btn--primary" : "portal-home__btn--secondary"
                                }`}
                onClick={() => {
                    setCurrency("Dollar")
                    setCurrentSelectedCurrencyValue(moneyExchangeRate[0].currency_one)
                }}
                >
                    Dollar
                </button>
                            <button
                                type="button"
                                className={`portal-home__btn ${
                                    currency === "Naira" ? "portal-home__btn--primary" : "portal-home__btn--secondary"
                                }`}
                onClick={() => {
                    setCurrency("Naira")
                    setCurrentSelectedCurrencyValue(moneyExchangeRate[0].currency_two)
                }}
                >
                    Naira
                </button>

                            <p className="portal-home__section-sub" style={{ margin: 0, maxWidth: 820 }}>
                                <span style={{ color: "var(--color-dheir-red)", fontWeight: 600, marginRight: 8 }}>
                                    Note:
                                </span>
                                While currency can be changed on the UI, all edits must be made in dollars as that is
                                the standard currency in the database.
                            </p>
                        </div>
                    </section>

                    <section className="portal-home__panel" aria-label="Air shipping template">
                        <div className="portal-home__panel-head">
                            <div>
                                <h2 className="portal-home__section-title">Air shipping template</h2>
                                <p className="portal-home__section-sub">Edit the air pricing rules.</p>
                            </div>
                        </div>
                        <AirTemplateComponent currencyValue={currentSelectedCurrencyValue} />
                    </section>

                    <section className="portal-home__panel" aria-label="Sea shipping template">
                        <div className="portal-home__panel-head">
                            <div>
                                <h2 className="portal-home__section-title">Sea shipping template</h2>
                                <p className="portal-home__section-sub">Edit the sea pricing rules.</p>
                            </div>
                        </div>
                        <SeaTemplateComponent />
                    </section>

                    <section className="portal-home__panel" aria-label="Express shipping template">
                        <div className="portal-home__panel-head">
                            <div>
                                <h2 className="portal-home__section-title">Express shipping template</h2>
                                <p className="portal-home__section-sub">Edit the express pricing rules.</p>
                            </div>
            </div>
                        <ExpressTemplateComponent currencyValue={currentSelectedCurrencyValue} />
                    </section>
                </>
            )}
        </div>
    )
}

function PricingTemplateEditModal({
    title,
    endpoint,
    priceLabel,
    clearanceLabel,
    templateId,
    initialPrice,
    initialClearance,
    initialMinDuration,
    initialMaxDuration,
    initialDurationType,
    onClose,
    onSaved,
}: {
    title: string
    endpoint: string
    priceLabel: string
    clearanceLabel: string
    templateId: number
    initialPrice: number | string | null | undefined
    initialClearance: number | string | null | undefined
    initialMinDuration: number | string | null | undefined
    initialMaxDuration: number | string | null | undefined
    initialDurationType: DurationType | string | null | undefined
    onClose: () => void
    onSaved: () => void
}) {
    const [price, setPrice] = useState<number>(Number(initialPrice ?? 0))
    const [clearance, setClearance] = useState<number>(Number(initialClearance ?? 0))
    const [minDuration, setMinDuration] = useState<number>(Number(initialMinDuration ?? 0))
    const [maxDuration, setMaxDuration] = useState<number>(Number(initialMaxDuration ?? 0))
    const [durationType, setDurationType] = useState<DurationType>(
        (initialDurationType as DurationType) || "days"
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setPrice(Number(initialPrice ?? 0))
    }, [initialPrice])

    useEffect(() => {
        setClearance(Number(initialClearance ?? 0))
    }, [initialClearance])

    useEffect(() => {
        setMinDuration(Number(initialMinDuration ?? 0))
    }, [initialMinDuration])

    useEffect(() => {
        setMaxDuration(Number(initialMaxDuration ?? 0))
    }, [initialMaxDuration])

    useEffect(() => {
        setDurationType((initialDurationType as DurationType) || "days")
    }, [initialDurationType])

    const submit = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: templateId,
                    price,
                    clearance,
                    min_duration: minDuration,
                    max_duration: maxDuration,
                    duration_type: durationType,
                }),
            })
            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message ?? "Failed to update template")
                return
            }

            toast.success(result.message ?? "Template updated")
            onSaved()
        } catch (err) {
            console.error("Network Error", err)
            toast.error("Network Error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="dheir-dialog-backdrop"
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="dheir-dialog pricing-modal" role="dialog" aria-modal="true" aria-label={title}>
                <div className="dheir-dialog__head">
                    <div>
                        <h2 className="dheir-dialog__title">{title}</h2>
                        <p className="admin-modal__subtitle">Edit and save pricing values.</p>
                    </div>
                    <button type="button" className="dheir-dialog__close" onClick={onClose} aria-label="Close">
                        <IconX size={20} stroke={1.5} />
                    </button>
                </div>

                <div className="admin-modal__body" style={{ paddingTop: 10 }}>
                    <div className="admin-modal__form" style={{ gridTemplateColumns: "1fr" }}>
                        <div className="admin-modal__fields" style={{ gridTemplateColumns: "1fr 1fr" }}>
                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">{priceLabel}</span>
                                <input
                                    type="number"
                                    className="dheir-input"
                                    value={Number.isFinite(price) ? price : 0}
                                    onChange={(e) => setPrice(Number(e.currentTarget.value))}
                                    step="0.01"
                                    min={0}
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">{clearanceLabel}</span>
                                <input
                                    type="number"
                                    className="dheir-input"
                                    value={Number.isFinite(clearance) ? clearance : 0}
                                    onChange={(e) => setClearance(Number(e.currentTarget.value))}
                                    step="0.01"
                                    min={0}
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Minimum delivery</span>
                                <input
                                    type="number"
                                    className="dheir-input"
                                    value={Number.isFinite(minDuration) ? minDuration : 0}
                                    onChange={(e) => setMinDuration(Number(e.currentTarget.value))}
                                    min={0}
                                    step={1}
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Maximum delivery</span>
                                <input
                                    type="number"
                                    className="dheir-input"
                                    value={Number.isFinite(maxDuration) ? maxDuration : 0}
                                    onChange={(e) => setMaxDuration(Number(e.currentTarget.value))}
                                    min={0}
                                    step={1}
                                />
                            </label>

                            <label className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                                <span className="portal-packages__field-label">Delivery duration unit</span>
                                <DheirSelect
                                    value={durationType}
                                    onChange={(e) => setDurationType(e.target.value as DurationType)}
                                >
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="months">Months</option>
                                </DheirSelect>
                            </label>
                </div>
                
                        <div className="admin-modal__actions" style={{ marginTop: 10 }}>
                            <button
                                type="button"
                                className="portal-home__btn portal-home__btn--primary"
                                onClick={submit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <DheirLoader color="#fff" size={10} /> : "Save changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}




const AirTemplateComponent = ({ currencyValue }: { currencyValue: number }) => {
    

    // Arrays 
    const [airTemplate, setAirTemplate] = useState<AirPricingTemplate[]>()
    
    
    // Loading States indicators
    const [isFetchingAirTemplate, setIsFetchingAirTemplate] = useState(true)


    // Selectors



    // Fetch Air Templates
    const fetchAirTemplates = async () => {
        setIsFetchingAirTemplate(true)
        try{
            const res = await fetch(`/api/pricing_template/air`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setAirTemplate(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingAirTemplate(false)
        }
    }



    useEffect(() => {
        fetchAirTemplates()
    }, [])


    const [selectedTemplate, setSelectedTemplate] = useState<AirPricingTemplate | null>(null)

    return (
        <>
            <div style={{ display: "grid", gap: 12 }}>
                {isFetchingAirTemplate ? (
                    <div className="portal-home__loader" style={{ minHeight: 120 }}>
                        <DheirLoader color="var(--color-dheir-blue)" size={10} />
                    </div>
                ) : (
                    airTemplate?.map((template, i) => (
                        <AirComp
                            key={i}
                            template={template}
                            currencyValue={currencyValue}
                            onEdit={() => setSelectedTemplate(template)}
                        />
                    ))
                )}
            </div>

            {selectedTemplate ? (
                <PricingTemplateEditModal
                    title={`Edit air template for ${selectedTemplate.name.split("_").join(" ")}`}
                    endpoint="/api/pricing_template/air"
                    priceLabel="Price (USD)"
                    clearanceLabel="Clearance (NGN)"
                    templateId={selectedTemplate.id}
                    initialPrice={selectedTemplate.price}
                    initialClearance={selectedTemplate.clearance}
                    initialMinDuration={selectedTemplate.min_duration}
                    initialMaxDuration={selectedTemplate.max_duration}
                    initialDurationType={selectedTemplate.duration_type}
                    onClose={() => setSelectedTemplate(null)}
                    onSaved={() => {
                        setSelectedTemplate(null)
                        fetchAirTemplates()
                    }}
                />
            ) : null}
        </>
    )
}


const AirComp = ({
    template,
    currencyValue,
    onEdit,
}: {
    template: AirPricingTemplate
    currencyValue: number
    onEdit: () => void
}) => {
    return (
        <div style={{ border: "1px solid var(--color-dheir-border)", borderRadius: 14, padding: 14 }}>
        <div className="flex items-center justify-between">    
            <h3 className="portal-home__section-title" style={{ fontSize: 14, margin: 0, textTransform: "capitalize" }}>
                {`${template.name.split("_").join(" ")}`}
            </h3>
            <button 
            type="button"
            className="portal-home__btn portal-home__btn--secondary"
            onClick={onEdit}
            >
                Edit
            </button>
        </div>
        <div className="portal-home__section-sub" style={{ marginTop: 10 }}>
            <p style={{ margin: 0 }}>
                Price per kg: {currencyValue === 1 ? "$" : "₦"}
                {(template.price * currencyValue).toFixed(2)}
            </p>
            <p style={{ margin: 0 }}>Clearance fee per kg: ₦{template.clearance}</p>
            <p style={{ margin: 0 }}>
                        Minimum expected delivery: {template.min_duration} {template.duration_type}
                    </p>
            <p style={{ margin: 0 }}>
                        Maximum expected delivery: {template.max_duration} {template.duration_type}
                    </p>
        </div>
        
    </div>
    )
}








const SeaTemplateComponent = () => {
    
    const [seaTemplate, setSeaTemplate] = useState<SeaPricingTemplate[]>()
    const [isFetchingSeaTemplate, setIsFetchingSeaTemplate] = useState(true)

        const fetchSeaTemplates = async () => {
        setIsFetchingSeaTemplate(true)
        try{
            const res = await fetch(`/api/pricing_template/sea`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setSeaTemplate(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingSeaTemplate(false)
        }
    }


    useEffect(() => {
        fetchSeaTemplates()
    }, [])


    const [selectedTemplate, setSelectedTemplate] = useState<SeaPricingTemplate | null>(null)

    return (
        <>
            <div style={{ display: "grid", gap: 12 }}>
                {isFetchingSeaTemplate ? (
                    <div className="portal-home__loader" style={{ minHeight: 120 }}>
                        <DheirLoader color="var(--color-dheir-blue)" size={10} />
                    </div>
                ) : (
                    seaTemplate?.map((template, i) => (
                        <SeaTemp key={i} template={template} onEdit={() => setSelectedTemplate(template)} />
                    ))
                )}
            </div>

            {selectedTemplate ? (
                <PricingTemplateEditModal
                    title={`Edit sea template - ${selectedTemplate.name.split("_").join(" ")}`}
                    endpoint="/api/pricing_template/sea"
                    priceLabel="Price (NGN)"
                    clearanceLabel="Clearance (NGN)"
                    templateId={selectedTemplate.id}
                    initialPrice={selectedTemplate.price}
                    initialClearance={selectedTemplate.clearance}
                    initialMinDuration={selectedTemplate.min_duration}
                    initialMaxDuration={selectedTemplate.max_duration}
                    initialDurationType={selectedTemplate.duration_type}
                    onClose={() => setSelectedTemplate(null)}
                    onSaved={() => {
                        setSelectedTemplate(null)
                        fetchSeaTemplates()
                    }}
                />
            ) : null}
        </>
    )
}

const SeaTemp = ({ template, onEdit }: { template: SeaPricingTemplate; onEdit: () => void }) => {
    return (
        <div style={{ border: "1px solid var(--color-dheir-border)", borderRadius: 14, padding: 14 }}>
        <div className="flex items-center justify-between">    
            <h3 className="portal-home__section-title" style={{ fontSize: 14, margin: 0, textTransform: "capitalize" }}>
                {`${template.name.split("_").join(" ")}`}
            </h3>
            <button 
            type="button"
            className="portal-home__btn portal-home__btn--secondary"
            onClick={onEdit}
            >
                Edit
            </button>
        </div>
        <div className="portal-home__section-sub" style={{ marginTop: 10 }}>
            <p style={{ margin: 0 }}>Price per cbm: ₦{template.price}</p>
            <p style={{ margin: 0 }}>Clearance fee per cbm: ₦{template.clearance}</p>
            <p style={{ margin: 0 }}>
                        Minimum expected delivery: {template.min_duration} {template.duration_type}
                    </p>
            <p style={{ margin: 0 }}>
                        Maximum expected delivery: {template.max_duration} {template.duration_type}
            </p>
        </div>
        
    </div>
    )
}











const ExpressTemplateComponent = ({currencyValue} : {currencyValue : number}) => {
    
    const [expressTemplate, setExpressTemplate] = useState<SeaPricingTemplate[]>()
    const [isFetchingExpressTemplate, setIsFetchingExpressTemplate] = useState(true)

        const fetchExpressTemplates = async () => {
        setIsFetchingExpressTemplate(true)
        try{
            const res = await fetch(`/api/pricing_template/express`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setExpressTemplate(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingExpressTemplate(false)
        }
    }


    useEffect(() => {
        fetchExpressTemplates()
    }, [])


    const [selectedTemplate, setSelectedTemplate] = useState<SeaPricingTemplate | null>(null)

    return (
        <>
            <div style={{ display: "grid", gap: 12 }}>
                {isFetchingExpressTemplate ? (
                    <div className="portal-home__loader" style={{ minHeight: 120 }}>
                        <DheirLoader color="var(--color-dheir-blue)" size={10} />
                    </div>
                ) : (
                    expressTemplate?.map((template) => (
                        <ExpressContainer
                            key={template.id}
                            template={template}
                            currencyValue={currencyValue}
                            onEdit={() => setSelectedTemplate(template)}
                        />
                    ))
                )}
            </div>

            {selectedTemplate ? (
                <PricingTemplateEditModal
                    title={`Edit express template - ${selectedTemplate.name.split("_").join(" ")}`}
                    endpoint="/api/pricing_template/express"
                    priceLabel="Price (USD)"
                    clearanceLabel="Clearance (NGN)"
                    templateId={selectedTemplate.id}
                    initialPrice={selectedTemplate.price}
                    initialClearance={selectedTemplate.clearance}
                    initialMinDuration={selectedTemplate.min_duration}
                    initialMaxDuration={selectedTemplate.max_duration}
                    initialDurationType={selectedTemplate.duration_type}
                    onClose={() => setSelectedTemplate(null)}
                    onSaved={() => {
                        setSelectedTemplate(null)
                        fetchExpressTemplates()
                    }}
                />
            ) : null}
        </>
    )
}


const ExpressContainer = ({
    template,
    currencyValue,
    onEdit,
}: {
    template: SeaPricingTemplate
    currencyValue: number
    onEdit: () => void
}) => {
    return (
        <div style={{ border: "1px solid var(--color-dheir-border)", borderRadius: 14, padding: 14 }}>
        <div className="flex items-center justify-between">    
            <h3 className="portal-home__section-title" style={{ fontSize: 14, margin: 0, textTransform: "capitalize" }}>
                {`${template.name.split("_").join(" ")}`}
            </h3>
            <button 
            type="button"
            className="portal-home__btn portal-home__btn--secondary"
            onClick={onEdit}
            >
                Edit
            </button>
        </div>
        <div className="portal-home__section-sub" style={{ marginTop: 10 }}>
            <p style={{ margin: 0 }}>
                Price: {currencyValue === 1 ? "$" : "₦"}
                {(template.price * currencyValue).toFixed(2)}
            </p>
            <p style={{ margin: 0 }}>Clearance fee: ₦{template.clearance}</p>
            <p style={{ margin: 0 }}>
                        Minimum expected delivery: {template.min_duration} {template.duration_type}
                    </p>
            <p style={{ margin: 0 }}>
                        Maximum expected delivery: {template.max_duration} {template.duration_type}
                    </p>
        </div>
        
    </div>
    )
}