"use client"

import AdminProductEditModal from "@/components/admin/marketplace/AdminProductEditModal"
import SearchComponent, { MarketplaceFilterValue } from "@/components/admin/marketplace/SearchComponent"
import { Table } from "@/components/admin/table/Table"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { Product, ProductCategory } from "@/types/entityTypeDef"
import { createColumnHelper } from "@tanstack/react-table"
import {
    IconCircleCheck,
    IconPackage,
    IconShoppingBag,
    IconStar,
} from "@tabler/icons-react"
import Link from "next/link"
import { NextPage } from "next"
import { useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/ui/toast"

const columnHelper = createColumnHelper<Product>()

const Page: NextPage = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<ProductCategory[]>([])
    const [filterValue, setFilterValue] = useState<MarketplaceFilterValue>({
        search: "",
        status: "",
        category: "",
    })
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = async () => {
        setIsDataLoading(true)
        try {
            const [res, resCat] = await Promise.all([
                fetch("/api/products", { credentials: "include" }),
                fetch("/api/products/categories", { credentials: "include" }),
            ])
            const result = await res.json()
            const categori = await resCat.json()

            if (!res.ok) {
                toast.error(result.message)
                setError(result.message)
                return
            }

            setProducts(result.data ?? [])
            setCategories(categori.data ?? [])
        } catch (err) {
            toast.error("ERR:: Fetching Products")
            console.error("ERR:: Fetching Products", err)
        } finally {
            setIsDataLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const categoryOptions = useMemo(
        () =>
            categories.map((x) => ({
                name: `${x.name.charAt(0).toUpperCase()}${x.name.slice(1)}`,
                value: x.id.toString(),
            })),
        [categories]
    )

    const filteredData = useMemo(() => {
        return products
            .filter((product) =>
                filterValue.status ? product.status.toLowerCase() === filterValue.status.toLowerCase() : true
            )
            .filter((product) =>
                filterValue.category ? String(product.category_id) === filterValue.category : true
            )
            .filter((product) => {
                const q = filterValue.search.trim().toLowerCase()
                if (!q) return true
                return product.name?.toLowerCase().includes(q)
            })
    }, [products, filterValue])

    const stats = useMemo(() => {
        const total = products.length
        const active = products.filter((p) => p.status === "active").length
        const inactive = products.filter((p) => p.status === "inactive" || p.status === "out_of_stock").length
        const featured = products.filter((p) => p.is_featured).length
        return { total, active, inactive, featured }
    }, [products])

    const deleteProducts = async (rows: Product[]) => {
        const ids = rows.map((r) => Number(r.id)).filter((x) => Number.isFinite(x))
        if (ids.length === 0) return

        try {
            const results = await Promise.all(
                ids.map((id) =>
                    fetch(`/api/products/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                    })
                )
            )
            const failed = results.filter((r) => !r.ok).length
            if (failed > 0) toast.error(`Could not delete ${failed} product(s)`)
            else toast.success("Deleted")
            await fetchProducts()
        } catch (err) {
            console.error(err)
            toast.error("Could not delete products")
        }
    }

    const productsTableDef = [
        columnHelper.accessor("id", { header: "ID" }),
        columnHelper.accessor("name", { header: "Product name" }),
        columnHelper.accessor("price", {
            header: "Price",
            cell: ({ getValue }) => <span>₦ {getValue()}</span>,
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: ({ getValue }) => {
                const value = getValue()
                return value ? String(value).replace(/_/g, " ") : "-"
            },
        }),
        columnHelper.accessor("weight", {
            header: "Weight",
            cell: ({ getValue }) => <p>{getValue()} kg</p>,
        }),
        columnHelper.accessor("created_at", {
            header: "Added on",
            cell: ({ getValue }) => <p>{new Date(getValue()).toDateString()}</p>,
        }),
        columnHelper.accessor("is_featured", {
            header: "Featured",
            cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <button
                    type="button"
                    className="portal-home__table-link"
                    onClick={() => setSelectedProduct(row.original)}
                >
                    View / edit
                </button>
            ),
        }),
    ]

    return (
        <>
            <div className="portal-home">
                <header className="portal-home__greeting">
                    <div>
                        <p className="portal-home__greeting-label">Admin</p>
                        <h1 className="portal-home__greeting-title">Marketplace</h1>
                        <p className="portal-home__greeting-sub">View all products in inventory.</p>
                    </div>
                    <Link href="/admin/marketplace/add_product" className="portal-home__btn portal-home__btn--primary">
                        Add product
                    </Link>
                </header>

                {isDataLoading ? (
                    <div className="portal-home__panel portal-home__loader">
                        <DheirLoader color="var(--color-dheir-blue)" size={12} />
                    </div>
                ) : (
                    <>
                        <div className="portal-home__stats" role="list" aria-label="Marketplace stats">
                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconShoppingBag size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Total</span>
                                    <span className="portal-home__stat-card-value">{stats.total}</span>
                                    <span className="portal-home__stat-card-hint">All products</span>
                                </span>
                            </div>

                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconCircleCheck size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Active</span>
                                    <span className="portal-home__stat-card-value">{stats.active}</span>
                                    <span className="portal-home__stat-card-hint">Live in store</span>
                                </span>
                            </div>

                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconPackage size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Inactive</span>
                                    <span className="portal-home__stat-card-value">{stats.inactive}</span>
                                    <span className="portal-home__stat-card-hint">Hidden or out of stock</span>
                                </span>
                            </div>

                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconStar size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Featured</span>
                                    <span className="portal-home__stat-card-value">{stats.featured}</span>
                                    <span className="portal-home__stat-card-hint">Highlighted items</span>
                                </span>
                            </div>
                        </div>

                        <section className="portal-home__panel" aria-label="Product filters">
                            <div className="portal-home__panel-head">
                                <div>
                                    <h2 className="portal-home__section-title">Filters</h2>
                                    <p className="portal-home__section-sub">
                                        Search by product name, status, or category.
                                    </p>
                                </div>
                            </div>
                            <SearchComponent
                                filter={filterValue}
                                setFilter={setFilterValue}
                                categories={categoryOptions}
                            />
                        </section>

                        <section className="portal-home__panel" aria-labelledby="products-records-heading">
                            <div className="portal-home__panel-head">
                                <div>
                                    <h2 id="products-records-heading" className="portal-home__section-title">
                                        Products
                                    </h2>
                                    <p className="portal-home__section-sub">A list of all products in the system.</p>
                                </div>
                            </div>

                            {error ? (
                                <div className="portal-home__panel-empty">
                                    <p className="portal-home__section-sub" style={{ color: "var(--color-dheir-red)" }}>
                                        {error}
                                    </p>
                                </div>
                            ) : (
                                <Table
                                    importedData={filteredData}
                                    columnDef={productsTableDef}
                                    globalFilter={filterValue.search}
                                    enableRowSelection
                                    getRowId={(row) => String(row.id)}
                                    onDeleteSelected={deleteProducts}
                                />
                            )}
                        </section>
                    </>
                )}
            </div>

            {selectedProduct ? (
                <AdminProductEditModal
                    key={selectedProduct.id}
                    product={selectedProduct}
                    categories={categories}
                    onClose={() => setSelectedProduct(null)}
                    onSaved={fetchProducts}
                />
            ) : null}
        </>
    )
}

export default Page
