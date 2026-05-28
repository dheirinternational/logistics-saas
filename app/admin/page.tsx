"use client"

// import PendingAlerts from '@/components/admin/PendingAlerts'
import { AdminAnnouncementModal } from "@/components/admin/AdminAnnouncementModal"
import { DheirConfirmDialog } from "@/components/ui/DheirConfirmDialog"
import Link from "next/link"
// import RecentActivity from '@/components/admin/RecentActivity'
// import RecentShipmentCard from '@/components/admin/RecentShipmentCard'
// import RevenueSnapshot from '@/components/admin/RevenueSnapshot'
import { buttonsProps } from '@/components_map_definitions/quickActionsBtns'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { IconChecks, IconLoader2, IconPackage, IconTruck } from "@tabler/icons-react"
// import { GrDeliver } from 'react-icons/gr'
import { toast } from "@/lib/ui/toast"


type ShipmentCount = {
    total_active_count: number,
    processing: number,
    shipped: number,
    in_transit: number,
    delivered: number 
}


const Page: NextPage = () => {


    // Arrays
    const [announcements, setAnnouncements] = useState<{id: number, title: string, message: string}[]>([])

    
    // Selected Objects
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"create" | "edit">("create")
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<{id: number, title: string, message: string} | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<{id: number, title: string} | null>(null)
    const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false)

    // Counts
    const [shipmentCounts, setShipmentCounts] = useState<ShipmentCount | null>(null)

    

    // DELETE Announcement
    const deleteAnnouncement = async (id: number) => {
        setIsDeletingAnnouncement(true)
        try{
            const res = await fetch("/api/announcements", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({id})
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
            fetchAnnouncements()

        }
        catch(err){
            toast.error("ERR:: Deleting announcement")
            console.error("ERR:: Deleting announcement", err)
        }
        finally{
            setIsDeletingAnnouncement(false)
        }
    }

    // FETCH Announcements 
    const fetchAnnouncements = async () => {
        try{
            const res = await fetch('/api/announcements', {
                credentials: "include"
            })
            const result = await res.json()
            if(!res.ok){
                toast.error(result.message ?? "Failed to fetch announcements")
                setAnnouncements([])
                return
            }

            setAnnouncements(Array.isArray(result.data) ? result.data : [])
        }
        catch(err){
            console.error("ERR:: Fetching Announcement Data", err)
            toast.error("ERR:: Fetching Announcement Data")
            setAnnouncements([])
        }
    }
    


    // Fetch Active shipments records and existing announcements
    useEffect(() => {
        const fetchActiveShipmentRecords = async () => {
            try{
                const shipmentCountRes = await fetch(`/api/shipments/count`)
                const shipmentCountResult = await shipmentCountRes.json()
                
                console.log(shipmentCountResult)
                setShipmentCounts(shipmentCountResult.data)
    
            }
            catch(err){
                console.error("ERR:: Fetching shipment result count", err)
                toast.error("ERR:: Fetching shipment result count")
            }
        }

   
        fetchActiveShipmentRecords()
        fetchAnnouncements()

    }, [])
    
    


  return (
    <div className="portal-home">
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Admin</p>
          <h1 className="portal-home__greeting-title">Dashboard</h1>
          <p className="portal-home__greeting-sub">
            View shipments summary and manage announcements
          </p>
        </div>
      </header>

      <div className="portal-home__stats" role="list" aria-label="Shipment stats">
        <Link href="/admin/shipments" className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconLoader2 size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Processing</span>
            <span className="portal-home__stat-card-value">
              {shipmentCounts?.processing || 0}
            </span>
            <span className="portal-home__stat-card-hint">In queue</span>
          </span>
        </Link>

        <Link href="/admin/orders" className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconPackage size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Shipped</span>
            <span className="portal-home__stat-card-value">
              {shipmentCounts?.shipped || 0}
            </span>
            <span className="portal-home__stat-card-hint">Outbound</span>
          </span>
        </Link>

        <Link href="/admin/shipments" className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconTruck size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">In transit</span>
            <span className="portal-home__stat-card-value">
              {shipmentCounts?.in_transit || 0}
            </span>
            <span className="portal-home__stat-card-hint">On the way</span>
          </span>
        </Link>

        <Link href="/admin/shipments/accepted_shipments" className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconChecks size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Delivered</span>
            <span className="portal-home__stat-card-value">
              {shipmentCounts?.delivered || 0}
            </span>
            <span className="portal-home__stat-card-hint">Completed</span>
          </span>
        </Link>
      </div>

      <div className="portal-home__split portal-home__split--actions">
        {/* Announcements */}
        <section className="portal-home__panel" aria-labelledby="admin-announcements-heading">
          <div className="portal-home__panel-head">
            <div>
              <h2 id="admin-announcements-heading" className="portal-home__section-title">
                Announcements
              </h2>
              <p className="portal-home__section-sub">
                Keep customers updated with important shipping messages.
              </p>
            </div>
            <div className="admin-dashboard__panel-actions">
              <button
                type="button"
                className="portal-home__btn portal-home__btn--secondary"
                onClick={() => {
                  setSelectedAnnouncement(null)
                  setModalMode("create")
                  setModalOpen(true)
                }}
              >
                Create
              </button>
              <Link href="/admin/announcements" className="portal-home__text-link">
                View all
              </Link>
            </div>
          </div>

          {announcements.length === 0 ? (
            <div className="portal-home__panel-empty">
              <p className="portal-home__section-sub">
                No announcements yet. Create one to update customers.
              </p>
            </div>
          ) : (
            <div className="portal-home__table-wrap">
              <table className="portal-home__table" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col" style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <button
                          type="button"
                          className="portal-home__table-link"
                          style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
                          onClick={() => {
                            setSelectedAnnouncement(a)
                            setModalMode("edit")
                            setModalOpen(true)
                          }}
                        >
                          {a.title}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-dashboard__delete"
                          onClick={() => setDeleteTarget({ id: a.id, title: a.title })}
                          disabled={isDeletingAnnouncement}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <AdminAnnouncementModal
          open={modalOpen}
          mode={modalMode}
          announcement={selectedAnnouncement}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            fetchAnnouncements()
          }}
        />

        <DheirConfirmDialog
          open={Boolean(deleteTarget)}
          onClose={() => {
            if (!isDeletingAnnouncement) setDeleteTarget(null)
          }}
          onConfirm={async () => {
            if (!deleteTarget) return
            await deleteAnnouncement(deleteTarget.id)
            setDeleteTarget(null)
          }}
          title="Delete announcement?"
          description={
            deleteTarget ? (
              <p className="dheir-dialog__text">
                This will permanently delete “{deleteTarget.title}”.
              </p>
            ) : null
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          loading={isDeletingAnnouncement}
        />

        {/* Quick Actions */}
        <section className="portal-home__panel" aria-labelledby="admin-quick-actions-heading">
          <div className="portal-home__panel-head">
            <div>
              <h2 id="admin-quick-actions-heading" className="portal-home__section-title">
                Quick actions
              </h2>
              <p className="portal-home__section-sub">
                Common admin tools for shipments, users, and orders.
              </p>
            </div>
          </div>

          <div className="portal-home__action-grid portal-home__action-grid--cols-3 admin-dashboard__quick-actions">
            {buttonsProps.map((button, i) => {
              const Icon = button.icon
              return (
                <Link
                  key={i}
                  href={button.link}
                  className="portal-home__action-card admin-dashboard__action-card"
                >
                  <span className="portal-home__action-icon" aria-hidden>
                    <Icon size={22} stroke={1.5} />
                  </span>
                  <span className="portal-home__action-label">
                    {button.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Page