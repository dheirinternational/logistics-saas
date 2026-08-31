"use client"

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Tell Us What You Need",
      description: "Send us product details, quantity, specifications, images, or any available information about your intended purchase.",
    },
    {
      num: "02",
      title: "Sourcing & Procurement",
      description: "We assist with supplier identification, communication, negotiation, and procurement coordination according to selected services.",
    },
    {
      num: "03",
      title: "Arrival at China Warehouse",
      description: "Purchased goods are coordinated for delivery to our designated receiving location in China.",
    },
    {
      num: "04",
      title: "Cargo Processing",
      description: "Goods are received, checked, consolidated, repacked, measured, and prepared for shipment.",
    },
    {
      num: "05",
      title: "Shipping to Nigeria",
      description: "The appropriate shipping method (Sea, Air, or Express) is selected based on shipment requirements.",
    },
    {
      num: "06",
      title: "Clearing & Delivery",
      description: "Upon arrival in Nigeria, we coordinate the applicable clearing, customs, and delivery process.",
    },
    {
      num: "07",
      title: "You Receive Your Goods",
      description: "Your shipment completes its connected journey from overseas supplier directly to your destination.",
    },
  ]

  return (
    <section id="how-it-works" className="marketing-section py-16 md:py-24 bg-dheir-surface">
      <div className="marketing-container">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
            Simple Process
          </p>
          <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-4xl mt-2">
            How It Works
          </h2>
          <p className="mt-4 text-base text-dheir-muted leading-relaxed">
            Seven straightforward steps connecting your order from international suppliers to your door in Nigeria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className={`flex flex-col gap-4 p-6 rounded-2xl bg-dheir-page ${
                idx === steps.length - 1 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-dheir-blue">{step.num}</span>
                <span className="text-xs font-semibold text-dheir-muted uppercase tracking-wider">Step</span>
              </div>
              <h3 className="text-lg font-bold text-dheir-ink">{step.title}</h3>
              <p className="text-xs leading-relaxed text-dheir-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
