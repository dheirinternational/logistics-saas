import AddProduct from "@/components/admin/marketplace/AddProduct"
import Link from "next/link"
import { NextPage } from "next"

const Page: NextPage = () => {
    return (
        <div className="portal-home">
            <header className="portal-home__greeting">
                <div>
                    <p className="portal-home__greeting-label">Admin</p>
                    <h1 className="portal-home__greeting-title">Add product</h1>
                    <p className="portal-home__greeting-sub">Add product to marketplace inventory.</p>
                </div>
                <Link href="/admin/marketplace" className="portal-home__btn portal-home__btn--secondary">
                    Back to marketplace
                </Link>
            </header>

            <section className="portal-home__panel" aria-label="Add product form">
                <AddProduct />
            </section>
        </div>
    )
}

export default Page
