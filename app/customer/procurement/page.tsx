import { IconClipboardList } from "@tabler/icons-react"

export default function CustomerProcurementPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-full bg-dheir-surface flex items-center justify-center text-dheir-blue mb-4 shadow-[var(--shadow-dheir-soft)]" style={{ backgroundColor: "var(--color-dheir-surface)", color: "var(--color-dheir-blue)" }}>
        <IconClipboardList size={32} stroke={1.5} />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-dheir-ink md:text-3xl" style={{ color: "var(--color-dheir-ink)" }}>
        Procurement Portal
      </h1>
      <p className="mt-3 max-w-md text-sm text-dheir-muted md:text-base" style={{ color: "var(--color-dheir-muted)" }}>
        Sourcing and buying directly from Chinese suppliers like 1688, Taobao, and Alibaba is coming soon.
      </p>
    </div>
  )
}
