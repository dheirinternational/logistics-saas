import { ProductStatus, ProductVisibility } from "./statusTypes"

export type User = {
    id: string // unique
    firstName: string
    lastName: string
    email: string // unique
    password: string
    role: string
    phone: string // unique
    created_at: string
}

export type Admin = {
    id: string // u
    user_id: string // Fk -> Users(id)
}

export type Staff = {
    id: string // unique
    userId: string // FK -> Users(id)
    position: string | null
    // department_id: string | null
    status: null
}

export type Customer = {
    id: string
    userId: string // FK -> Users(id)
    code: string // unique e.g KRC2530 
}

export type Shipment = {
    id: string // unique
    trackingNumber: string // unique
    customerCode: string // FK -> Customer(code)
    originWarehouseId: string // FK -> Warehouse(id)
    destinationWarehouseId: string  // FK -> Warehouse(id) 
    status: "shipped" | "in_transit" | "arrived_nigeria" | "pending_payment" | "delivered"
    shippingMethod: "air" | "sea"

    totalCost: number
    createdAt: string
}

export type Package = {
    id: string // unique
    incoming_package_id: string  // FK -> IncomingPackage(id)
    userId: string  // Fk -> Users(id)
    customerCode: string // Fk -> Customers(code)
    warehouseId: string // Fk -> Warehouses(id)
    actualWeight: number
    length?: number
    width?: number
    height?: number
    photos?: string[]
    condition?: "good" | "damaged"
    status: "stored" | "ready_to_ship" | "assigned_to_shipment"
    shipmentId: null | string  // FK -> Shipments(id)
    createdAt: string
}

export type Warehouse = {
    id: string // unique
    name: string 
    location: string  // FK -> Address(id)
    capacity: string
    managerId: string  // (FK -> staff)
    type: "air" | "sea" | "local"
    phone: string
}

export type Address = {
    id: string  // u
    recipentName: null | string
    phone: null | string
    country: string
    province? : string | null
    city: string
    district?: string | null
    street: string | null
    building: string | null 
    postalCode: string 
    created_at: string
}

export type Payment = {
    id: string // unique
    shipmentId: string // (FK -> Shipments(id))
    customerCode: string  // (Fk -> Customers(id))
    amount: number
    paymentMethod: "bank_transfer" | "card" | "cash"
    status: "successful" | "pending" | "failed"
    transactionRef: string
    paidAt: string
    createdAt: string
}

export type StaffAssignment = {
    id: string
    staffId: string  // Fk -> Staffs(id)
    shipmentId: string  // Fk -> Shipments(id)
    role: string
    assignedAt: string
}


export type IncomingPackage = {
    id: string // u
    userId: string 
    customerCode: string  // Fk -> Customer(code)
    incomingTrackingNumber: string
    warehouseId: string
    status: "expected" | "received" | "processed" | "cancelled" 
    declaredItemName: string
    declaredItemQuantity: number
    declaredItemWeight: number 
    createdAt: string
}

export type ShippingRequest = {
    id: string // u
    user_id: string  // Fk -> Users(id)
    customerCode: string //  Fk -> Customers(code)
    packageIds: string[]
    method: "air" | "sea"
    status: "peding" | "approved"
    createdAt: string
}

// Processed means it's been converted to processed






// DEAL WITH THIS LATER

export type TrackingEvent = {
    id: string // unique
    shipmentId: string // (Fk -> shipment)
    status: string
    location: string
    timestamp: string
    notes: string
}

export type Carrier = {
    id: string
    name: string
    contactInfo: string
    trackingApi: string
}

export type PricingRule = {
    id: string // unique
    basePrice: number
    pricePerKg: number
    pricePerKm: number
    region: string
    carrierId: string // (FK -> shipment)
}

export type Notification = {
    id: string // unique
    userId: string // (Fk -> User)
    title: string
    message: string
    read: boolean
    createdAt: string
}

export type ActivityLog = {
    id: string // unique
    userId: string // (FK -> User)
    action: string
    entity: string
    entityId: string
    timeStamp: string
}

export type Country = {
    id: string // unique
    name: string 
    country: string 
}

export type Product = {
    id: string // unique
    slug: string // unique
    name: string
    description?: string
    categoryId?: string
    price: number
    discountPrice?: number
    costPrice?: number
    stock_quantity: number
    low_stock_threshold: number
    weight: number
    length: number
    width: number
    height: number
    status: ProductStatus
    visibility: ProductVisibility
    isFeatured: string
    createdBy: string
    updatedBy: string
    createdAt: string
    updatedAt: string 
}

export type ProductCategory = {
    id: string, // unique
    name: string,
    slug: string, // unique
    created_at: string
}

export type ProductImage = {
    id: string // unique
    productId: string // (FK -> Proudtc)
    imageUrl: string // unique
    altText: string
    createdAt: string
}
