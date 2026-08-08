"use client"

import { useState } from "react"
import { IconClipboardCheck, IconSearch, IconBuildingFactory2, IconHistory } from "@tabler/icons-react"
import { PortalProcurementBuyForMe } from "./PortalProcurementBuyForMe"
import { PortalProcurementSourcing } from "./PortalProcurementSourcing"
import { PortalProcurementVerification } from "./PortalProcurementVerification"
import { PortalProcurementOrderList } from "./PortalProcurementOrderList"

export type ProcurementTab = "procurement" | "sourcing" | "verification" | "orders"

export function PortalProcurementHub() {
  const [activeTab, setActiveTab] = useState<ProcurementTab>("procurement")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
    setActiveTab("orders")
  }

  const tabs: { id: ProcurementTab; label: string; icon: any }[] = [
    { id: "procurement", label: "Buy For Me (Links)", icon: IconClipboardCheck },
    { id: "sourcing", label: "Sourcing & Find", icon: IconSearch },
    { id: "verification", label: "Factory Verification", icon: IconBuildingFactory2 },
    { id: "orders", label: "My Requests & Chat", icon: IconHistory },
  ]

  return (
    <div className="portal-packages">
      <header className="portal-packages__header">
        <div className="portal-packages__header-row">
          <div>
            <h1 className="portal-packages__title">Procurement & Sourcing</h1>
            <p className="portal-packages__description">
              Buy directly from 1688, Taobao, and Alibaba, source custom products, or audit Chinese factories.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "12px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--color-dheir-border)",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: isActive ? "var(--color-dheir-blue)" : "var(--color-dheir-surface)",
                color: isActive ? "#ffffff" : "var(--color-dheir-ink)",
                transition: "all 150ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={18} stroke={1.5} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "procurement" && <PortalProcurementBuyForMe onSuccess={handleCreated} />}
      {activeTab === "sourcing" && <PortalProcurementSourcing onSuccess={handleCreated} />}
      {activeTab === "verification" && <PortalProcurementVerification onSuccess={handleCreated} />}
      {activeTab === "orders" && <PortalProcurementOrderList refreshKey={refreshTrigger} />}
    </div>
  )
}
