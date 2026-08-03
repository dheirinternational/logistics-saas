"use client"

import { ShopCatalogFormModal } from "@/components/admin/shop_catalog/ShopCatalogFormModal"
import { Table } from "@/components/admin/table/Table"
import { DHEIRConfirmDialog } from "@/components/ui/DHEIRConfirmDialog"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import type { ShopCatalogItem } from "@/lib/shop/shopCatalog"
import { toast } from "@/lib/ui/toast"
import type { ProductCategory } from "@/types/entityTypeDef"
import { createColumnHelper } from "@tanstack/react-table"
import { IconLayoutGrid, IconPlus } from "@tabler/icons-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"

const columnHelper = createColumnHelper<ShopCatalogItem>()

export default function ShopCatalogAdminPage() {
  const [items, setItems] = useState<ShopCatalogItem[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalItem, setModalItem] = useState<ShopCatalogItem | null | undefined>(undefined)
  const [itemToDelete, setItemToDelete] = useState<ShopCatalogItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCatalog = useCallback(async () => {
    setLoading(true)
    try {
      const [catalogRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/shop-catalog", { credentials: "include" }),
        fetch("/api/products/categories", { credentials: "include" }),
      ])

      const catalogJson = await catalogRes.json()
      const categoriesJson = await categoriesRes.json()

      if (!catalogRes.ok) {
        toast.error(catalogJson.message || "Could not load shop catalog")
        setError(catalogJson.message || "Could not load shop catalog")
        return
      }

      setItems(catalogJson.data ?? [])
      setCategories(categoriesJson.data ?? [])
      setError(null)
    } catch {
      toast.error("Could not load shop catalog")
      setError("Could not load shop catalog")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  const confirmDelete = async () => {
    if (!itemToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/shop-catalog/${itemToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message || "Could not remove catalog item")
        return
      }
      toast.success(result.message || "Catalog item removed")
      setItemToDelete(null)
      fetchCatalog()
    } catch {
      toast.error("Could not remove catalog item")
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "cover",
        header: "Image",
        cell: ({ row }) =>
          row.original.image_url ? (
            <Image
              src={row.original.image_url}
              alt={row.original.image_alt || row.original.title}
              width={56}
              height={40}
              className="admin-catalog-table-thumb"
            />
          ) : (
            "—"
          ),
      }),
      columnHelper.accessor("title", { header: "Title" }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: ({ getValue }) => {
          const text = getValue()
          return text.length > 80 ? `${text.slice(0, 80)}…` : text
        },
      }),
      columnHelper.accessor("category_name", {
        header: "Category link",
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor("sort_order", { header: "Order" }),
      columnHelper.accessor("is_active", {
        header: "Status",
        cell: ({ getValue }) => (getValue() ? "Visible" : "Hidden"),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="admin-table-actions">
            <button
              type="button"
              className="portal-home__table-link"
              onClick={() => setModalItem(row.original)}
            >
              Edit
            </button>
            <button
              type="button"
              className="portal-home__table-link portal-home__table-link--danger"
              onClick={() => setItemToDelete(row.original)}
            >
              Remove
            </button>
          </div>
        ),
      }),
    ],
    []
  )

  return (
    <>
      <div className="portal-home">
        <header className="portal-home__greeting">
          <div>
            <p className="portal-home__greeting-label">Admin</p>
            <h1 className="portal-home__greeting-title">Shop catalog</h1>
            <p className="portal-home__greeting-sub">
              Manage the category cards shown on the landing page and customer shop.
            </p>
          </div>
          <button
            type="button"
            className="portal-home__btn portal-home__btn--primary"
            onClick={() => setModalItem(null)}
          >
            <IconPlus size={18} stroke={1.5} aria-hidden />
            Add catalog item
          </button>
        </header>

        {loading ? (
          <div className="portal-home__panel portal-home__loader">
            <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : (
          <>
            <div className="portal-home__stats" role="list" aria-label="Catalog stats">
              <div className="portal-home__stat-card" role="listitem">
                <span className="portal-home__stat-card-icon" aria-hidden>
                  <IconLayoutGrid size={22} stroke={1.5} />
                </span>
                <span className="portal-home__stat-card-body">
                  <span className="portal-home__stat-card-label">Total</span>
                  <span className="portal-home__stat-card-value">{items.length}</span>
                  <span className="portal-home__stat-card-hint">Catalog cards</span>
                </span>
              </div>
            </div>

            <section className="portal-home__panel" aria-labelledby="shop-catalog-table-heading">
              <div className="portal-home__panel-head">
                <div>
                  <h2 id="shop-catalog-table-heading" className="portal-home__section-title">
                    Catalog items
                  </h2>
                  <p className="portal-home__section-sub">
                    Title, description, and cover image appear on the shop and landing page.
                  </p>
                </div>
              </div>

              {error ? (
                <div className="portal-home__panel-empty">
                  <p className="portal-home__section-sub" style={{ color: "var(--color-dheir-red)" }}>
                    {error}
                  </p>
                </div>
              ) : (
                <Table importedData={items} columnDef={columns} globalFilter="" />
              )}
            </section>
          </>
        )}
      </div>

      {modalItem !== undefined ? (
        <ShopCatalogFormModal
          key={modalItem?.id ?? "new"}
          item={modalItem}
          categories={categories}
          onClose={() => setModalItem(undefined)}
          onSaved={fetchCatalog}
        />
      ) : null}

      <DHEIRConfirmDialog
        open={Boolean(itemToDelete)}
        onClose={() => {
          if (!deleting) setItemToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Remove catalog item?"
        description={
          itemToDelete ? (
            <>
              <strong>{itemToDelete.title}</strong> will be removed from the landing page and
              customer shop. This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Remove"
        cancelLabel="Keep item"
        variant="danger"
        loading={deleting}
      />
    </>
  )
}
