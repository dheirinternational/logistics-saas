import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import { ShippingType } from "./miscallaneous"
import { PackageStatus, ProductStatus, ProductVisibility, ShipmentStatus } from "./statusTypes"

export type User = {
    id: string // unique
    first_name: string
    last_name: string
    email: string // unique
    role: string
    phone: string // unique
    profile_img: string
    created_at: string
}

export type Admin = {
    id: string // u
    user_id: string // Fk -> Users(id)
}

export type Staff = {
    id: string // unique
    user_id: string // FK -> Users(id)
    position: string | null
    // department_id: string | null
    status: null
}

export type Customer = {
    id: string
    user_id: string // FK -> Users(id)
    code: string // unique e.g KRC2530 
}

export type Shipment = {
    id: number // unique
    tracking_number: string // unique
    customer_code: string // FK -> Customer(code)
    origin_warehouse_id: string // FK -> Warehouse(id)
    destination_warehouse_id: string  // FK -> Warehouse(id) 
    status: ShipmentStatus
    channel: ShippingType
    shipping_note: string
    total_cost: number
    payment_time: "before" | "after"
    created_at: string
}

export type Package = {
    id: number // unique
    incoming_package_id: string  // FK -> IncomingPackage(id)
    package_name: string
    user_id: number  // Fk -> Users(id)
    customer_code: string // Fk -> Customers(code)
    warehouse_id: string // Fk -> Warehouses(id)
    weight: number
    condition: "good" | "damaged"
    status: PackageStatus
    received_at: string
    stored_at: string
    created_at: string    
}

export type Warehouse = {
    id: number  // unique
    name: string 
    recipient_name: null | string
    phone: null | string
    country: string
    province? : string | null
    city: string
    district?: string | null
    street: string | null
    building: string | null 
    postal_code: string 
    created_at: string
    capacity: string
    manager_id: string  // (FK -> staff)
    type: ShippingType | "local"
}

export type Address = {
    id: string  // u
    recipient_name: null | string
    phone: null | string
    country: string
    province? : string | null
    city: string
    district?: string | null
    street: string | null
    building: string | null 
    postal_code: string 
    created_at: string
}

export type Payment = {
    id: string // unique
    shipment_id: string // (FK -> Shipments(id))
    customer_code: string  // (Fk -> Customers(id))
    amount: number
    payment_method: "bank_transfer" | "card" | "cash"
    status: "successful" | "pending" | "failed"
    transaction_ref: string
    paid_at: string
    created_at: string
}

export type StaffAssignment = {
    id: string
    staff_id: string  // Fk -> Staffs(id)
    shipment_id: string  // Fk -> Shipments(id)
    role: string
    assigned_at: string
}


export type IncomingPackage = {
    id: number // u
    user_id: number 
    customer_code: string  // Fk -> Customer(code)
    incoming_tracking_number: string
    warehouse_id: string
    status: "expected" | "received" | "cancelled" | "stored" 
    declared_item_name: string
    declared_item_quantity: number
    declared_item_weight: number 
    created_at: string
}

export type ShippingRequest = {
    id: string // u
    user_id: string  // Fk -> Users(id)
    customer_code: string //  Fk -> Customers(code)
    package_ids: string[]
    channel: ShippingType
    status: "pending" | "accepted"
    wrapping: "bubble" | "normal"
    created_at: string
    payment_time: "before" | "after"
    shipping_note: string
}

// Processed means it's been converted to processed






// DEAL WITH THIS LATER

export type TrackingEvent = {
    id: string // unique
    shipment_id: string // (Fk -> shipment)
    status: string
    location: string
    timestamp: string
    notes: string
}

export type Carrier = {
    id: string
    name: string
    contact_info: string
    tracking_api: string
}

export type PricingRule = {
    id: string // unique
    base_price: number
    price_per_kg: number
    price_per_km: number
    region: string
    carrier_id: string // (FK -> shipment)
}

export type Notification = {
    id: string // unique
    user_id: string // (Fk -> User)
    title: string
    message: string
    read: boolean
    created_at: string
}

export type ActivityLog = {
    id: string // unique
    user_id: string // (FK -> User)
    action: string
    entity: string
    entity_id: string
    time_stamp: string
}

export type Country = {
    id: string // unique
    iso: string // unique 
    name: string 
    created_at: Timestamp
}

export type Product = {
    id: string // unique
    slug: string // unique
    name: string
    description?: string
    category_id?: string
    price: number
    discount_price?: number | null
    cost_price?: number
    stock_quantity: number
    low_stock_threshold: number
    weight: number
    length: number
    width: number
    height: number
    status: ProductStatus
    visibility: ProductVisibility
    is_featured: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string 
}

export type ProductCategory = {
    id: string, // unique
    name: string,
    slug: string, // unique
    created_at: string
}

export type ProductImage = {
    id: string // unique
    product_id: string // (FK -> Proudtc)
    image_url: string // unique
    alt_text: string
    created_at: string
}
