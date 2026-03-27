import { User, Admin, Staff, Customer, Shipment, Package, Warehouse, Address, Payment, StaffAssignment, IncomingPackage, ShippingRequest, TrackingEvent, Carrier, PricingRule, Notification, ActivityLog, Country, Product, ProductCategory, ProductImage } from "./entityTypeDef";
import { ShippingType } from "./miscallaneous";
import { ProductStatus, ProductVisibility } from "./statusTypes";

// Dummy data for testing frontend

export const dummyUsers: User[] = [
  {
    id: "u1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "hashed_password_1",
    role: "customer",
    phone: "+1234567890",
    created_at: "2023-01-15T10:00:00Z"
  },
  {
    id: "u2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    password: "hashed_password_2",
    role: "staff",
    phone: "+0987654321",
    created_at: "2023-02-20T14:30:00Z"
  },
  {
    id: "u3",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "hashed_password_3",
    role: "admin",
    phone: "+1122334455",
    created_at: "2023-01-01T00:00:00Z"
  }
];

export const dummyAdmins: Admin[] = [
  {
    id: "a1",
    user_id: "u3"
  }
];

export const dummyStaff: Staff[] = [
  {
    id: "s1",
    userId: "u2",
    position: "Warehouse Manager",
    status: null
  }
];

export const dummyCustomers: Customer[] = [
  {
    id: "c1",
    userId: "u1",
    code: "KRC2530"
  }
];

export const dummyAddresses: Address[] = [
  {
    id: "addr1",
    recipentName: "John Doe",
    phone: "+1234567890",
    country: "Nigeria",
    province: "Lagos",
    city: "Lagos",
    district: "Ikeja",
    street: "Allen Avenue",
    building: "Block 5",
    postalCode: "100001",
    created_at: "2023-01-15T10:00:00Z"
  },
  {
    id: "addr2",
    recipentName: null,
    phone: null,
    country: "China",
    province: "Guangdong",
    city: "Shenzhen",
    district: null,
    street: "Huaqiangbei",
    building: null,
    postalCode: "518000",
    created_at: "2023-03-10T12:00:00Z"
  }
];

export const dummyWarehouses: Warehouse[] = [
  {
    id: "w1",
    name: "Lagos Warehouse",
    location: "addr1",
    capacity: "5000",
    managerId: "s1",
    type: "local",
    phone: "+2345678901"
  },
  {
    id: "w2",
    name: "Shenzhen Warehouse",
    location: "addr2",
    capacity: "10000",
    managerId: "s1",
    type: "air",
    phone: "+861234567890"
  }
];

export const dummyShipments: Shipment[] = [
  {
    id: "sh1",
    trackingNumber: "TRK123456789",
    customerCode: "KRC2530",
    originWarehouseId: "w2",
    destinationWarehouseId: "w1",
    status: "in_transit",
    shippingMethod: "air",
    totalCost: 150.00,
    createdAt: "2023-05-01T08:00:00Z"
  }
];

export const dummyPackages: Package[] = [
  {
    id: "p1",
    incoming_package_id: "ip1",
    userId: "u1",
    customerCode: "KRC2530",
    warehouseId: "w2",
    actualWeight: 2.5,
    photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    condition: "good",
    status: "stored",
    shipmentId: null,
    createdAt: "2023-04-15T10:00:00Z"
  }
];

export const dummyPayments: Payment[] = [
  {
    id: "pay1",
    shipmentId: "sh1",
    customerCode: "KRC2530",
    amount: 150.00,
    paymentMethod: "bank_transfer",
    status: "successful",
    transactionRef: "TXN987654321",
    paidAt: "2023-05-02T09:00:00Z",
    createdAt: "2023-05-01T08:00:00Z"
  }
];

export const dummyStaffAssignments: StaffAssignment[] = [
  {
    id: "sa1",
    staffId: "s1",
    shipmentId: "sh1",
    role: "handler",
    assignedAt: "2023-05-01T08:00:00Z"
  }
];

export const dummyIncomingPackages: IncomingPackage[] = [
  {
    id: "ip1",
    userId: "u1",
    customerCode: "KRC2530",
    incomingTrackingNumber: "INC123456",
    warehouseId: "w2",
    status: "received",
    declaredItemName: "Electronics",
    declaredItemQuantity: 1,
    declaredItemWeight: 2.5,
    createdAt: "2023-04-10T12:00:00Z"
  }
];

export const dummyShippingRequests: ShippingRequest[] = [
  {
    id: "sr1",
    user_id: "u1",
    customerCode: "KRC2530",
    packageIds: ["p1"],
    method: "air",
    status: "approved",
    createdAt: "2023-04-20T14:00:00Z"
  }
];

export const dummyTrackingEvents: TrackingEvent[] = [
  {
    id: "te1",
    shipmentId: "sh1",
    status: "shipped",
    location: "Shenzhen Warehouse",
    timestamp: "2023-05-01T08:00:00Z",
    notes: "Package shipped from origin warehouse"
  },
  {
    id: "te2",
    shipmentId: "sh1",
    status: "in_transit",
    location: "In flight to Nigeria",
    timestamp: "2023-05-02T06:00:00Z",
    notes: "Package in transit"
  }
];

export const dummyCarriers: Carrier[] = [
  {
    id: "car1",
    name: "FastAir Shipping",
    contactInfo: "+1234567890",
    trackingApi: "https://api.fastair.com/track"
  }
];

export const dummyPricingRules: PricingRule[] = [
  {
    id: "pr1",
    basePrice: 50.00,
    pricePerKg: 10.00,
    pricePerKm: 0.5,
    region: "China to Nigeria",
    carrierId: "car1"
  }
];

export const dummyNotifications: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    title: "Package Received",
    message: "Your package has been received at the warehouse.",
    read: false,
    createdAt: "2023-04-15T10:00:00Z"
  }
];

export const dummyActivityLogs: ActivityLog[] = [
  {
    id: "al1",
    userId: "u1",
    action: "created",
    entity: "package",
    entityId: "p1",
    timeStamp: "2023-04-15T10:00:00Z"
  }
];

export const dummyCountries: Country[] = [
  {
    id: "cn1",
    name: "Nigeria",
    country: "NG"
  },
  {
    id: "cn2",
    name: "China",
    country: "CN"
  }
];

export const dummyProductCategories: ProductCategory[] = [
  {
    id: "pc1",
    name: "Electronics",
    slug: "electronics",
    created_at: "2023-01-01T00:00:00Z"
  }
];

export const dummyProducts: Product[] = [
  {
    id: "prod1",
    slug: "smartphone-case",
    name: "Smartphone Case",
    description: "Protective case for smartphones",
    categoryId: "pc1",
    price: 25.00,
    discountPrice: 20.00,
    costPrice: 15.00,
    stock_quantity: 100,
    low_stock_threshold: 10,
    weight: 0.2,
    length: 15,
    width: 8,
    height: 1,
    status: "active",
    visibility: "public",
    isFeatured: "true",
    createdBy: "u3",
    updatedBy: "u3",
    createdAt: "2023-03-01T10:00:00Z",
    updatedAt: "2023-03-01T10:00:00Z"
  }
];

export const dummyProductImages: ProductImage[] = [
  {
    id: "pi1",
    productId: "prod1",
    imageUrl: "https://example.com/product1.jpg",
    altText: "Smartphone case image",
    createdAt: "2023-03-01T10:00:00Z"
  }
];