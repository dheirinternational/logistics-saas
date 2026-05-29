"use client"

import SearchComponent from '@/components/admin/shipments/SearchComponent'
import { Table } from '@/components/admin/table/Table'
import { usePackageStore } from '@/store/incomingPackagesStore'
import { useEditModalStore } from "@/types/editModalStore"
import { IncomingPackage } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { DheirLoader } from "@/components/ui/DheirLoader"
import { matchesStatusFilter, matchesWarehouseFilter } from "@/lib/admin/tableFilters"
import { toast } from "@/lib/ui/toast"
import { IconBox, IconTruck } from "@tabler/icons-react"

export type SearchProps = {
    search: string,
    status: string,
    warehouse_id: string
}

const columnHelper = createColumnHelper<IncomingPackage>()

const Page: NextPage = () => {

    const {setSelectedPackage, trigger, resetReadOnly} = usePackageStore()
    const { setIsModalActive } = useEditModalStore()
    
    const [incomingPackages, setIncomingPackages] = useState<IncomingPackage[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        warehouse_id: "",
        status: ""
    })


    useEffect(() => {
        const fetchShipmentData = async () => {
            try{
                const res = await fetch("/api/incoming-packages", {
                    method: "GET",
                    credentials: "include"
                })

                const data = await res.json()
                
                if(!res.ok){
                    toast.error(data.message)
                    return
                }

                setIncomingPackages(data.data)
                
            }
            catch(err){
                toast.error("Cannot fetch Shipment Data")
                console.error(err)
            }
            finally{
                setIsDataLoading(false) 
            }
        }

        fetchShipmentData()
    
    }, [trigger])

    const deleteIncomingPackages = async (rows: IncomingPackage[]) => {
        const ids = rows.map((row) => String(row.id))
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`/api/incoming-packages/${id}`, {
              method: "DELETE",
              credentials: "include",
            })
            return { ok: res.ok, id }
          })
        )

        const failed = results.filter((x) => !x.ok)
        if (failed.length > 0) {
          toast.error(`Failed to delete ${failed.length} incoming package(s).`)
          return
        }

        setIncomingPackages((prev) => prev.filter((item) => !ids.includes(String(item.id))))
        toast.success(`${ids.length} incoming package(s) deleted.`)
      } catch (err) {
        console.error(err)
        toast.error("Failed to delete selected incoming packages.")
      }
    }

    // Table Column Def
    const incomingPackageColumnDef = [
        columnHelper.accessor("incoming_tracking_number", {
            header: "Tracking Id",
            cell: ({getValue}) => 
                <p className='max-w-40 w-40 whitespace-nowrap overflow-hidden text-ellipsis'>
                    {getValue()}
                </p>
        }),
        columnHelper.accessor("customer_code", {
            header: "Customer Code",
            cell: ({getValue}) => getValue()
        }),
        columnHelper.accessor("declared_item_name", {
            header: "Item Name",
            cell: ({getValue}) => getValue(),
            enableColumnFilter: false
        }),
        columnHelper.accessor("declared_item_quantity", {
            header: "Quantity",
            cell: ({getValue}) => getValue(),
            enableColumnFilter: false

        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: ({getValue}) => getValue(),
            enableColumnFilter: false
        }),
        columnHelper.accessor("created_at", {
            header: "Created At",
            cell: ({getValue}) => <span>{new Date(getValue()).toDateString()}</span>
        }),
        columnHelper.display({
            header: "Add Product",
            id: "add-product",
            cell: ({ row }) => {
                const item = row.original

                if (!item || typeof item.id === "undefined") {
                    return "heyyyy"
                }

                if (item.status === "stored") return null

                return (
                    <button
                    className='underline'
                    onClick={() => {
                        resetReadOnly()
                        setSelectedPackage({
                            id: 0,
                            incoming_package_id: item.incoming_tracking_number,
                            package_name: item.declared_item_name,
                            user_id: Number(item.user_id),
                            customer_code: item.customer_code,
                            warehouse_id: Number(item.warehouse_id),
                            weight: Number(item.declared_item_weight) || 0,
                            weight_unit: (item as any).declared_item_weight_unit ?? "kg",
                            condition: "good",
                            status: "stored",
                            received_at: "",
                            stored_at: "",
                            created_at: "",
                            amount: item.declared_item_quantity
                        })
                        setIsModalActive()
                    }}
                    >
                        Add
                    </button>
                )
            }
        })
    ]

    const data = incomingPackages.filter(
        (x) =>
            matchesStatusFilter(x.status, filterValues.status) &&
            matchesWarehouseFilter(x.warehouse_id, filterValues.warehouse_id)
    )

  return (
    <div className="portal-home">
      {isDataLoading ? (
        <div className="portal-home__panel portal-home__loader">
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : (
        <>
          <div className="portal-home__stats" role="list" aria-label="Incoming packages stats">
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconTruck size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Expected</span>
                <span className="portal-home__stat-card-value">
                  {incomingPackages.filter((x) => x.status === "expected").length}
                </span>
                <span className="portal-home__stat-card-hint">On the way</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconBox size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Stored</span>
                <span className="portal-home__stat-card-value">
                  {incomingPackages.filter((x) => x.status === "stored").length}
                </span>
                <span className="portal-home__stat-card-hint">At warehouse</span>
              </span>
            </div>
          </div>

          <section className="portal-home__panel" aria-label="Shipment filters">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Filters</h2>
                <p className="portal-home__section-sub">
                  Search by tracking number, customer code, status, or warehouse.
                </p>
              </div>
            </div>
            <SearchComponent state={filterValues} setState={setFilterValues} />
          </section>

          <section className="portal-home__panel" aria-labelledby="shipment-records-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="shipment-records-heading" className="portal-home__section-title">
                  Shipment records
                </h2>
                <p className="portal-home__section-sub">
                  A live overview of incoming shipments in the system.
                </p>
              </div>
            </div>
            {incomingPackages ? (
              <Table
                importedData={data}
                columnDef={incomingPackageColumnDef}
                globalFilter={filterValues.search}
                enableRowSelection
                getRowId={(row) => String(row.id)}
                onDeleteSelected={deleteIncomingPackages}
              />
            ) : null}
          </section>
        </>
      )}
    </div>
  )
}

export default Page