"use client"

export function WhyDheirSection() {
  const whyPoints = [
    {
      title: "One Journey, Multiple Solutions",
      description: "Instead of leaving customers to coordinate every stage independently, we help connect procurement and logistics into a more organized process.",
    },
    {
      title: "Practical Importation Support",
      description: "We understand that international trade involves more than purchasing a product. Shipping, cargo handling, documentation, customs, and delivery all matter.",
    },
    {
      title: "Customer-Centric Approach",
      description: "Every shipment is different. Product type, quantity, volume, urgency, budget, and destination can influence the best logistics solution.",
    },
    {
      title: "Transparency",
      description: "We believe customers should understand what they are paying for and why. Clear communication, defined processes, and proper cost considerations.",
    },
    {
      title: "Business-Focused Solutions",
      description: "Designed for individuals, entrepreneurs, and businesses building sustainable, long-term international supply chains.",
    },
  ]

  const coreValues = [
    {
      title: "Integrity",
      description: "We believe trust is the foundation of every successful business relationship.",
    },
    {
      title: "Transparency",
      description: "We communicate clearly about services, processes, costs, and expectations.",
    },
    {
      title: "Reliability",
      description: "We understand that customers are trusting us with their money, products, and business plans.",
    },
    {
      title: "Professionalism",
      description: "Every shipment and customer interaction should be handled with structure and accountability.",
    },
    {
      title: "Continuous Improvement",
      description: "We continue to improve our processes, partnerships, and customer experience as international trade evolves.",
    },
  ]

  const differenceSteps = [
    "Sourcing",
    "Procurement",
    "Supplier Coordination",
    "Cargo Handling",
    "International Shipping",
    "Customs & Clearing",
    "Delivery",
  ]

  return (
    <section id="why-dheir" className="marketing-section py-16 md:py-24 bg-dheir-surface">
      <div className="marketing-container">
        {/* Why D_HEIR */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
            Why Choose Us
          </p>
          <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-4xl mt-2">
            Why D_HEIR International?
          </h2>
          <p className="mt-4 text-base text-dheir-muted leading-relaxed">
            Connecting opportunity, procurement, and logistics into one seamless, trusted experience.
          </p>
        </div>

        {/* Why Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {whyPoints.map((point) => (
            <div key={point.title} className="flex flex-col gap-3 p-6 rounded-2xl bg-dheir-page">
              <h3 className="text-base font-bold text-dheir-ink">{point.title}</h3>
              <p className="text-xs leading-relaxed text-dheir-muted">{point.description}</p>
            </div>
          ))}
        </div>

        {/* Vision, Mission & Core Values */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-dheir-page flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Our Vision</span>
            <p className="text-sm font-medium text-dheir-ink leading-relaxed">
              To become a trusted international procurement and logistics brand connecting African businesses and consumers to global markets.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-dheir-page flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Our Mission</span>
            <p className="text-sm font-medium text-dheir-ink leading-relaxed">
              To provide accessible, transparent, and dependable procurement and logistics solutions that help individuals and businesses successfully participate in international trade.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-dheir-page flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">Our Value</span>
            <p className="text-sm font-medium text-dheir-ink leading-relaxed">
              A business in Nigeria should be able to discover opportunities in China without having to build an entire overseas operation from scratch.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h3 className="text-xl font-bold text-dheir-ink mb-8">Our Core Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {coreValues.map((val) => (
              <div key={val.title} className="p-5 rounded-xl bg-dheir-page flex flex-col gap-2">
                <h4 className="text-sm font-bold text-dheir-blue">{val.title}</h4>
                <p className="text-xs text-dheir-muted leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The D_HEIR Difference & Our Promise */}
        <div className="p-8 md:p-12 rounded-3xl bg-dheir-page">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-dheir-blue">The D_HEIR Difference</span>
            <h3 className="font-display text-2xl font-bold text-dheir-ink md:text-3xl mt-2 mb-4">
              One connected journey. One trusted partner.
            </h3>
            <p className="text-sm text-dheir-muted leading-relaxed mb-6">
              What we promise is to approach the process with clarity, communication, professionalism, and accountability. Because your shipment is not just cargo; it represents your money, your business, and your next opportunity.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-dheir-ink bg-dheir-surface p-4 rounded-xl">
              {differenceSteps.map((step, idx) => (
                <span key={step} className="flex items-center gap-2">
                  <span>{step}</span>
                  {idx < differenceSteps.length - 1 && <span className="text-dheir-blue">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
