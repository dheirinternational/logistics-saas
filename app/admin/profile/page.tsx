import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import { IconChevronRight, IconPencil, IconShield, IconUser } from "@tabler/icons-react"

const Page: NextPage = async() => {

    const session = await getSession()
    const userId = session.user_id

    const data = await pool.query(`
        SELECT u.first_name, u.last_name, u.profile_img, u.role, u.email 
        FROM users u
        WHERE u.id = $1
    `, [userId])
    const userData = data.rows[0]
    const fullName = [userData?.first_name, userData?.last_name].filter(Boolean).join(" ") || "Admin"

    return (
        <div className="portal-home">
            <header className="portal-home__greeting">
                <div>
                    <p className="portal-home__greeting-label">Admin</p>
                    <h1 className="portal-home__greeting-title">Profile</h1>
                    <p className="portal-home__greeting-sub">Manage and edit your user information.</p>
                </div>
            </header>

            <section className="portal-home__panel" aria-label="Admin profile">
                <div className="portal-home__panel-head">
                    <div>
                        <h2 className="portal-home__section-title">Your profile</h2>
                        <p className="portal-home__section-sub">Account details for this admin user.</p>
                    </div>
                </div>

                <div className="portal-account__profile">
                    <div className="portal-account__avatar" aria-hidden>
                        {userData?.profile_img ? (
                            <Image src={userData.profile_img} alt="" fill className="object-cover" sizes="80px" priority />
                        ) : (
                            <IconUser size={36} stroke={1.25} aria-hidden />
                        )}
                    </div>
                    <div className="portal-account__profile-body">
                        <p className="portal-account__name">{fullName}</p>
                        <p className="portal-account__email">{userData?.email || "-"}</p>
                        <p className="portal-account__email" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <IconShield size={16} stroke={1.5} aria-hidden />
                            {userData?.role || "admin"}
                        </p>
                    </div>
                </div>
            </section>

            <section className="portal-home__panel" aria-label="Profile actions">
                <div className="portal-home__panel-head">
                    <div>
                        <h2 className="portal-home__section-title">Actions</h2>
                        <p className="portal-home__section-sub">Update your details.</p>
                    </div>
                </div>

                <ul className="portal-account__links" aria-label="Profile actions">
                    <li>
                        <Link href="/admin/edit_profile" className="portal-account__link">
                            <span className="portal-account__link-icon" aria-hidden>
                                <IconPencil size={22} stroke={1.5} />
                            </span>
                            <span className="portal-account__link-body">
                                <span className="portal-account__link-label">Edit profile</span>
                                <span className="portal-account__link-desc">Update your name, phone, and security settings.</span>
                            </span>
                            <IconChevronRight size={18} stroke={1.5} className="portal-account__link-chevron" aria-hidden />
                        </Link>
                    </li>
                </ul>
            </section>
        </div>
    )
}

export default Page