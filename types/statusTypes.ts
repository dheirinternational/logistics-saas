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