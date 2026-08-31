"use client"

import { IconUser, IconShoppingBag, IconDeviceLaptop, IconBuildingSkyscraper, IconUserPlus, IconBuildingStore } from "@tabler/icons-react"

export function BusinessSolutionsSection() {
  const audiences = [
    {
      title: "Entrepreneurs",
      description: "Individuals looking to start or expand an import-based business.",
      icon: IconUser,
    },
    {
      title: "Retailers",
      description: "Businesses sourcing products for resale.",
      icon: IconShoppingBag,
    },
    {
      title: "Online Sellers",
      description: "E-commerce and social-commerce businesses purchasing inventory internationally.",
      icon: IconDeviceLaptop,
    },
    {
      title: "Established Businesses",
      description: "Companies requiring regular procurement and logistics support.",
      icon: IconBuildingSkyscraper,
    },
    {
      title: "New Importers",
      description: "First-time importers who need guidance through the process.",
      icon: IconUserPlus,
    },
    {
      title: "Commercial Buyers",
      description: "Customers purchasing goods in larger quantities for business, distribution, or commercial use.",
      icon: IconBuildingStore,
    },
  ]

  return (
    <section id="business-solutions" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
            Business Solutions
          </p>
          <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-4xl mt-2">
            Who We Serve
          </h2>
          <p className="mt-4 text-base text-dheir-muted leading-relaxed">
            D_HEIR INTERNATIONAL works with customers at different stages of their business journey, providing practical trade infrastructure.
          </p>
        </div>

        {/* Audience Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {audiences.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex flex-col gap-4 p-6 rounded-2xl bg-dheir-surface">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dheir-blue/10 text-dheir-blue">
                  <Icon size={20} stroke={1.5} />
                </div>
                <h3 className="text-lg font-bold text-dheir-ink">{item.title}</h3>
                <p className="text-xs leading-relaxed text-dheir-muted">{item.description}</p>
              </div>
            )
          })}
        </div>

        {/* For Businesses That Want To Grow */}
        <div className="p-8 md:p-12 rounded-3xl bg-dheir-surface">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Infrastructure for Growth</span>
            <h3 className="font-display text-2xl font-bold text-dheir-ink md:text-3xl mt-2">
              For Businesses That Want To Grow
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-dheir-muted">
              Importation can be more than buying products. For many entrepreneurs, it is the beginning of a business.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium text-dheir-ink">
              <div className="p-4 rounded-xl bg-dheir-page flex flex-col gap-1">
                <span className="font-bold text-dheir-blue">Product</span>
                <span>Becomes Inventory</span>
              </div>
              <div className="p-4 rounded-xl bg-dheir-page flex flex-col gap-1">
                <span className="font-bold text-dheir-blue">Inventory</span>
                <span>Becomes Retail Business</span>
              </div>
              <div className="p-4 rounded-xl bg-dheir-page flex flex-col gap-1">
                <span className="font-bold text-dheir-blue">Reliable Supplier</span>
                <span>Becomes Supply Chain</span>
              </div>
              <div className="p-4 rounded-xl bg-dheir-page flex flex-col gap-1">
                <span className="font-bold text-dheir-blue">Reliable Logistics</span>
                <span>Becomes Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
