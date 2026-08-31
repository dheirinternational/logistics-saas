"use client"

import { IconShip, IconPlane, IconTruck, IconBoxSeam, IconPackage, IconFileCheck, IconMapPin } from "@tabler/icons-react"

export function CargoLogisticsSection() {
  const shippingMethods = [
    {
      title: "Sea Freight",
      description: "Suitable for larger and heavier commercial shipments where cost efficiency is important.",
      icon: IconShip,
    },
    {
      title: "Air Freight",
      description: "Suitable for customers who need a faster transportation option for eligible goods.",
      icon: IconPlane,
    },
    {
      title: "Express Shipping",
      description: "Designed for smaller and time-sensitive shipments where speed is a priority.",
      icon: IconTruck,
    },
  ]

  const consolidationAudience = [
    "Small and medium-sized businesses",
    "New importers",
    "Retailers & online sellers",
    "Customers testing new products",
    "Customers with smaller cargo volumes",
  ]

  const handlingActivities = [
    "Cargo receiving",
    "Shipment identification",
    "Cargo consolidation",
    "Repacking & protection",
    "Measurement & CBM calculation",
    "Shipment documentation & dispatch",
  ]

  const clearingSupport = [
    "Customs-related coordination",
    "Clearing arrangements",
    "Cargo documentation",
    "Port-related logistics",
    "Delivery coordination",
  ]

  return (
    <section id="cargo-logistics" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
            D_HEIR Cargo & Logistics
          </p>
          <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-4xl mt-2">
            Your cargo. Our coordination.
          </h2>
          <p className="mt-4 text-base text-dheir-muted leading-relaxed">
            D_HEIR CARGO & LOGISTICS is the logistics arm of D_HEIR INTERNATIONAL, focused on the movement and coordination of goods from China to Nigeria.
          </p>
        </div>

        {/* 03. China to Nigeria Shipping Options */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Service 03</span>
            <h3 className="text-2xl font-bold text-dheir-ink">China-to-Nigeria Shipping</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingMethods.map((method) => {
              const Icon = method.icon
              return (
                <div key={method.title} className="flex flex-col gap-4 p-6 rounded-2xl bg-dheir-surface">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dheir-blue/10 text-dheir-blue">
                    <Icon size={22} stroke={1.5} />
                  </div>
                  <h4 className="text-lg font-bold text-dheir-ink">{method.title}</h4>
                  <p className="text-sm text-dheir-muted leading-relaxed">{method.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 04 & 05: Consolidation & Handling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* 04. Consolidation */}
          <div className="flex flex-col gap-5 p-8 rounded-2xl bg-dheir-surface">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Service 04</span>
            <h3 className="text-xl font-bold text-dheir-ink">Cargo Consolidation & Groupage</h3>
            <p className="text-sm text-dheir-muted leading-relaxed">
              Customers with smaller shipments do not always need to book an entire container. Our consolidation approach allows compatible shipments to be grouped together, helping customers access international shipping without carrying the cost of a full container.
            </p>
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-dheir-ink mb-3">Particularly useful for:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {consolidationAudience.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-dheir-ink font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-dheir-blue" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 05. Handling & Repacking */}
          <div className="flex flex-col gap-5 p-8 rounded-2xl bg-dheir-surface">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Service 05</span>
            <h3 className="text-xl font-bold text-dheir-ink">Cargo Handling & Repacking</h3>
            <p className="text-sm text-dheir-muted leading-relaxed">
              Proper cargo preparation makes a significant difference in international logistics. We ensure goods are properly inspected, measured, and protected before they begin their journey to Nigeria.
            </p>
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-dheir-ink mb-3">Activities covered:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {handlingActivities.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-dheir-ink font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-dheir-blue" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 06 & 07: Customs & Last Mile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 06. Customs */}
          <div className="flex flex-col gap-5 p-8 rounded-2xl bg-dheir-surface">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Service 06</span>
            <h3 className="text-xl font-bold text-dheir-ink">Customs & Clearing Support</h3>
            <p className="text-sm text-dheir-muted leading-relaxed">
              We coordinate with relevant logistics and clearing partners to facilitate the movement of cargo through customs and port-related logistics in Nigeria.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {clearingSupport.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-xs text-dheir-ink font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-dheir-blue" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 07. Last Mile */}
          <div className="flex flex-col gap-5 p-8 rounded-2xl bg-dheir-surface">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Service 07</span>
            <h3 className="text-xl font-bold text-dheir-ink">Last-Mile Delivery</h3>
            <p className="text-sm text-dheir-muted leading-relaxed">
              Getting cargo into Nigeria is only part of the journey. We coordinate delivery solutions designed to move goods from point of arrival to your final destination.
            </p>
            <div className="pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-dheir-ink mb-3">Connected Logistics Journey:</p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-dheir-blue bg-dheir-page p-4 rounded-xl">
                <span>Supplier</span>
                <span>&rarr;</span>
                <span>China Warehouse</span>
                <span>&rarr;</span>
                <span>Shipping</span>
                <span>&rarr;</span>
                <span>Nigeria</span>
                <span>&rarr;</span>
                <span>Customer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
