import { Header } from "@/components/admin/Header";
import { SideBar } from "@/components/admin/side_bar/SideBar";
import { DatabaseUnavailableError } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { PortalOcrScannerFloatingButton } from "@/components/admin/ocr/PortalOcrScannerFloatingButton"
import { PortalBarcodeScannerButton } from "@/components/admin/ocr/PortalBarcodeScannerButton"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session
  try {
    session = await getSession()
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return (
        <div className="portal-home" style={{ padding: "2rem", maxWidth: 520 }}>
          <h1 className="portal-home__greeting-title">Database connection issue</h1>
          <p className="portal-home__greeting-sub" style={{ marginTop: "0.75rem" }}>
            The app could not reach Postgres. If you recently set{" "}
            <code>DATABASE_URL_TRANSACTION</code> on Vercel, remove it or use the
            Transaction pooler URI (port <strong>6543</strong>), not Session (
            <strong>5432</strong>). Leaving it unset is fine — we rewrite{" "}
            <code>DATABASE_URL</code> automatically.
          </p>
          <p className="portal-home__greeting-sub" style={{ marginTop: "0.75rem" }}>
            {err.message}
          </p>
          <Link
            href="/admin/marketplace"
            className="portal-home__btn portal-home__btn--primary"
            style={{ marginTop: "1.25rem", display: "inline-flex" }}
          >
            Retry
          </Link>
        </div>
      )
    }
    throw err
  }

  if (!session || session.role !== "admin") {
    redirect("/auth/login")
  }

  return (
    <div className="admin-shell">
      <SideBar />
      <div className="admin-shell__content">
        <Header />
        <main className="admin-shell__main">{children}</main>
      </div>
      <PortalOcrScannerFloatingButton />
      <PortalBarcodeScannerButton />
    </div>
  )
}