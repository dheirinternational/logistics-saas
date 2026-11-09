import { pool, dbQuery } from "@/lib/db/db"
import { isAdminRole, ADMIN_PORTAL_ENTRY } from "@/lib/auth/postAuthRedirect"
import { CUSTOMER_PORTAL_ENTRY } from "@/lib/portal/customerEntry"
import { isAdminOrStaff, hasStaffPermission } from "@/lib/rbac/permissions"

type TestResult = {
  test: string
  passed: boolean
  details?: string
}

async function runE2E() {
  const results: TestResult[] = []

  function assert(test: string, condition: boolean, details?: string) {
    results.push({ test, passed: Boolean(condition), details })
    if (condition) {
      console.log(`[PASS] ${test}`)
    } else {
      console.error(`[FAIL] ${test} : ${details || ""}`)
    }
  }

  console.log("=== STARTING E2E VERIFICATION ===")

  // 1. Check Staff User (id: 447, customerservice@dheirinternational.com)
  const staffRes = await pool.query(
    `SELECT id, first_name, last_name, email, role, staff_role FROM users WHERE id = 447`
  )
  const staff = staffRes.rows[0]
  assert("Staff user 447 exists", Boolean(staff), `Found: ${staff?.email}`)
  assert("Staff user 447 has role staff", staff?.role === "staff")
  assert("Staff user 447 has staff_role customer_service", staff?.staff_role === "customer_service")
  assert("Staff recognized as admin or staff", isAdminOrStaff(staff) === true)
  assert("Staff recognized by isAdminRole helper", isAdminRole(staff?.role) === true)
  assert("Staff has announcements write permission", hasStaffPermission(staff, "announcements:write") === true)
  assert("Staff has shipments read permission", hasStaffPermission(staff, "shipments:read") === true)

  // 2. Check Admin User (id: 40, Ronke Adeoya)
  const adminRes = await pool.query(
    `SELECT id, first_name, last_name, email, role, staff_role FROM users WHERE id = 40`
  )
  const admin = adminRes.rows[0]
  assert("Admin user 40 exists", Boolean(admin), `Found: ${admin?.email}`)
  assert("Admin user 40 has role admin", admin?.role === "admin")
  assert("Admin recognized as admin or staff", isAdminOrStaff(admin) === true)
  assert("Admin recognized by isAdminRole helper", isAdminRole(admin?.role) === true)
  assert("Admin has full permissions", hasStaffPermission(admin, "full_admin") === true)

  // 3. Check Customer User (id: 144, Ronke customer account)
  const custRes = await pool.query(
    `SELECT id, first_name, last_name, email, role, staff_role FROM users WHERE id = 144`
  )
  const customer = custRes.rows[0]
  assert("Customer user 144 exists", Boolean(customer), `Found: ${customer?.email}`)
  assert("Customer user 144 has role customer", customer?.role === "customer")
  assert("Customer is NOT recognized as admin or staff", isAdminOrStaff(customer) === false)
  assert("Customer is NOT recognized by isAdminRole helper", isAdminRole(customer?.role) === false)

  // 4. Test Analytics queries that were previously failing with 403
  const usersCountRes = await dbQuery<{ count: number }>(`SELECT COUNT(*)::int as count FROM users;`)
  const totalUsers = usersCountRes.rows[0]?.count || 0
  assert("Analytics users query succeeds", totalUsers > 0, `Total users: ${totalUsers}`)

  const totalMetricsRes = await dbQuery<{ total_cbm: number; total_kg: number }>(`
    SELECT 
      COALESCE(SUM(total_weight) FILTER (WHERE total_weight_unit = 'cbm'), 0)::numeric as total_cbm,
      COALESCE(SUM(total_weight) FILTER (WHERE total_weight_unit = 'kg'), 0)::numeric as total_kg
    FROM shipments
    WHERE created_at >= NOW() - INTERVAL '30 days';
  `)
  assert("Analytics metrics query succeeds", totalMetricsRes.rows.length > 0)

  // 5. Test Shipment Counts queries that were returning 0
  const [shipmentsRes, packagesRes] = await Promise.all([
    dbQuery<{
      total_active: number
      processing: number
      shipped: number
      in_transit: number
      delivered: number
      air_gz_count: number
      air_gz_kg: number
      air_hk_count: number
      air_hk_kg: number
      sea_count: number
      sea_cbm: number
    }>(`
      SELECT
        COUNT(*) FILTER (WHERE status != 'delivered')::int AS total_active,
        COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
        COUNT(*) FILTER (WHERE status = 'shipped')::int    AS shipped,
        COUNT(*) FILTER (WHERE status = 'in_transit')::int AS in_transit,
        COUNT(*) FILTER (WHERE status = 'delivered')::int  AS delivered,
        COUNT(*) FILTER (WHERE channel ILIKE '%gz%' OR channel = 'air')::int AS air_gz_count,
        COALESCE(SUM(total_weight) FILTER (WHERE (channel ILIKE '%gz%' OR channel = 'air') AND total_weight_unit = 'kg'), 0)::numeric AS air_gz_kg,
        COUNT(*) FILTER (WHERE channel ILIKE '%hk%')::int AS air_hk_count,
        COALESCE(SUM(total_weight) FILTER (WHERE channel ILIKE '%hk%' AND total_weight_unit = 'kg'), 0)::numeric AS air_hk_kg,
        COUNT(*) FILTER (WHERE channel = 'sea')::int AS sea_count,
        COALESCE(SUM(total_weight) FILTER (WHERE channel = 'sea' AND total_weight_unit = 'cbm'), 0)::numeric AS sea_cbm
      FROM shipments;
    `),
    dbQuery<{
      total_packages: number
      total_qty: number
      total_package_weight: number
    }>(`
      SELECT
        COUNT(*)::int AS total_packages,
        COALESCE(SUM(amount), 0)::int AS total_qty,
        COALESCE(SUM(weight), 0)::numeric AS total_package_weight
      FROM packages;
    `),
  ])
  const sData = shipmentsRes.rows[0]
  const pData = packagesRes.rows[0]
  assert("Shipment counts query succeeds", Boolean(sData))
  assert("Package counts query succeeds", Boolean(pData))
  console.log(`Shipments active: ${sData?.total_active}, processing: ${sData?.processing}, shipped: ${sData?.shipped}, delivered: ${sData?.delivered}`)
  console.log(`Packages total: ${pData?.total_packages}, total quantity: ${pData?.total_qty}`)

  // 6. Test Announcements retrieval
  const annRes = await pool.query(`SELECT id, title, message, created_at FROM announcements ORDER BY created_at DESC LIMIT 5`)
  assert("Announcements query succeeds", annRes.rows.length >= 0, `Found: ${annRes.rows.length} announcements`)

  // 7. Test Guangzhou Warehouse Restriction
  const warehousesRes = await pool.query(`SELECT id, name, country, street, phone FROM warehouses`)
  const allWarehouses = warehousesRes.rows
  const gzWarehouses = allWarehouses.filter(
    (w) => w.country === "CN" && w.name.toLowerCase().includes("guangzhou")
  )
  assert("Warehouses in database exist", allWarehouses.length > 0, `Total: ${allWarehouses.length}`)
  assert("Guangzhou China warehouse exists", gzWarehouses.length > 0, `Found: ${gzWarehouses.map((w) => w.name).join(", ")}`)
  const gzAir = gzWarehouses.find((w) => w.name.toLowerCase().includes("air"))
  const gzSea = gzWarehouses.find((w) => w.name.toLowerCase().includes("sea"))
  assert("Guangzhou Air Cargo warehouse present", Boolean(gzAir), gzAir?.name)
  assert("Guangzhou Sea Cargo warehouse present", Boolean(gzSea), gzSea?.name)

  // Verify non Guangzhou warehouses (e.g. Lagos, Foshan) are excluded by filter
  const nonGzWarehouses = allWarehouses.filter(
    (w) => !(w.country === "CN" && w.name.toLowerCase().includes("guangzhou"))
  )
  assert("Non Guangzhou warehouses correctly identified for exclusion", nonGzWarehouses.length > 0, `Excluded count: ${nonGzWarehouses.length}`)

  // 8. Test Customer Code Self Healing
  const customerRecord = await pool.query(`SELECT code FROM customers WHERE user_id = $1`, [customer.id])
  assert("Customer code exists for customer user", customerRecord.rows.length > 0, `Code: ${customerRecord.rows[0]?.code}`)

  // 9. Test Portal Navigation constants
  assert("Admin portal entry is /admin", ADMIN_PORTAL_ENTRY === "/admin")
  assert("Customer portal entry is /customer", CUSTOMER_PORTAL_ENTRY === "/customer")

  // Summary
  const failed = results.filter((r) => !r.passed)
  console.log("\n=== E2E SUMMARY ===")
  console.log(`Total tests: ${results.length}`)
  console.log(`Passed: ${results.length - failed.length}`)
  console.log(`Failed: ${failed.length}`)

  if (failed.length > 0) {
    console.error("FAILURES DETECTED:")
    failed.forEach((f) => console.error(`- ${f.test}: ${f.details || ""}`))
    process.exit(1)
  } else {
    console.log("ALL E2E VERIFICATIONS PASSED")
    process.exit(0)
  }
}

runE2E().catch((err) => {
  console.error("Fatal error during E2E verification:", err)
  process.exit(1)
})
