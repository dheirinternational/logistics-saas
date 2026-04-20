export type ProductStatus = 
    | "active"
    | "inactive"
    | "out_of_stock"

export type ProductVisibility =
    | "public"
    | "private"
    | "hidden";

export type PaymentStatus = 
    | "pending"
    | "paid"
    | "failed"
    | "abandoned"

export type ShipmentStatus = 
    | "processing" 
    | "shipped" 
    | "in_transit" 
    | "arrived" 
    | "out_for_delivery"
    | "delivered"

export type PackageStatus = 
    | "stored"
    | "requested_for"
    | "assigned_to_shipment"
    | "delivered"


export type IncomingPackageStatus = 
    | "expected" 
    | "received" 
    | "cancelled" 
    | "stored"


export type OrderStatus =
  | "Confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";