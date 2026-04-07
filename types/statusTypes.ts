export type ProductStatus = 
    | "draft"
    | "active"
    | "inactive"
    | "out_of_stock"
    | "archived";

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