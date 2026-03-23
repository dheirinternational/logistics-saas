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

export type Staff = {
    id: string //unique
    user_id: string // FK -> User
    position: string | null
    department_id: string | null
    status: null
}

export type Shipment = {
    id: string // unique
    trackingNumber: string // unique
    customerId: string
    originAddressId: string
    destinationAddressId: string
    status: string
    carrierId: string
    warehouseId: string
    totalCost: number
    createdAt: string
}

export type Package = {
    id: string // unique
    shipmentId: string 
    weight: number
    dimension: number
    description: string
    value: string
}

export type Warehouse = {
    id: string // unique
    name: string 
    location: string
    capacity: string
    managerId: string  // (FK -> staff)
}

export type Address = {
    id: string  // unique
    country: string
    state: string
    city: string
    area: string
    street: string
    postalCode: string
}

export type Carrier = {
    id: string
    name: string
    contactInfo: string
    trackingApi: string
}

export type TrackingEvent = {
    id: string // unique
    shipmentId: string // (Fk -> shipment)
    status: string
    location: string
    timestamp: string
    notes: string
}

export type Payment = {
    id: string // unique
    shipmentId: string // (FK -> shipment)
    amount: number
    payment_method: string
    status: string
    transactionRef: string
    paidAt: string
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