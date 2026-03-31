import { User, Admin, Staff, Customer, Shipment, Package, Warehouse, Address, Payment, StaffAssignment, IncomingPackage, ShippingRequest, TrackingEvent, Carrier, PricingRule, Notification, ActivityLog, Country, Product, ProductCategory, ProductImage } from "./entityTypeDef";
import { ShippingType } from "./miscallaneous";
import { ProductStatus, ProductVisibility } from "./statusTypes";

// Dummy data for testing frontend

export const dummyUsers: User[] = [
  {
    id: "u1",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    role: "customer",
    phone: "+1234567890",
    created_at: "2023-01-15T10:00:00Z"
  },
  {
    id: "u2",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    role: "staff",
    phone: "+0987654321",
    created_at: "2023-02-20T14:30:00Z"
  },
  {
    id: "u3",
    first_name: "Admin",
    last_name: "User",
    email: "admin@example.com",
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
    user_id: "u2",
    position: "Warehouse Manager",
    status: null
  }
];

export const dummyCustomers: Customer[] = [
  {
    id: "c1",
    user_id: "u1",
    code: "KRC2530"
  }
];

export const dummyAddresses: Address[] = [
  {
    id: "addr1",
    recipient_name: "John Doe",
    phone: "+1234567890",
    country: "Nigeria",
    province: "Lagos",
    city: "Lagos",
    district: "Ikeja",
    street: "Allen Avenue",
    building: "Block 5",
    postal_code: "100001",
    created_at: "2023-01-15T10:00:00Z"
  },
  {
    id: "addr2",
    recipient_name: null,
    phone: null,
    country: "China",
    province: "Guangdong",
    city: "Shenzhen",
    district: null,
    street: "Huaqiangbei",
    building: null,
    postal_code: "518000",
    created_at: "2023-03-10T12:00:00Z"
  }
];

// export const dummyWarehouses: Warehouse[] = [
//   {
//     id: "w1",
//     name: "Lagos Warehouse",
//     location: "addr1",
//     capacity: "5000",
//     manager_id: "s1",
//     type: "local",
//     phone: "+2345678901"
//   },
//   {
//     id: "w2",
//     name: "Shenzhen Warehouse",
//     location: "addr2",
//     capacity: "10000",
//     manager_id: "s1",
//     type: "air",
//     phone: "+861234567890"
//   }
// ];

export const dummyShipments: Shipment[] = [
  {
    id: "sh1",
    tracking_number: "TRK123456789",
    customer_code: "KRC2530",
    origin_warehouse_id: "w2",
    destination_warehouse_id: "w1",
    status: "in_transit",
    shipping_method: "air",
    total_cost: 150.00,
    created_at: "2023-05-01T08:00:00Z"
  }
];

export const dummyPackages: Package[] = [
  {
    id: "p1",
    package_name: "Electronics",
    incoming_package_id: "ip1",
    user_id: "u1",
    customer_code: "KRC2530",
    warehouse_id: "w2",
    actual_weight: 2.5,
    photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    condition: "good",
    status: "stored",
    shipment_id: null,
    created_at: "2023-04-15T10:00:00Z"
  },
  {
    id: "p2",
    package_name: "Clothing",
    incoming_package_id: "ip2",
    user_id: "u2",
    customer_code: "KRC2531",
    warehouse_id: "w1",
    actual_weight: 1.2,
    photos: ["https://example.com/photo3.jpg", "https://example.com/photo4.jpg"],
    condition: "good",
    status: "stored",
    shipment_id: null,
    created_at: "2023-04-16T11:30:00Z"
  },
  {
    id: "p3",
    package_name: "Books",
    incoming_package_id: "ip3",
    user_id: "u3",
    customer_code: "KRC2532",
    warehouse_id: "w3",
    actual_weight: 3.0,
    photos: ["https://example.com/photo5.jpg"],
    condition: "good",
    status: "stored",
    shipment_id: null,
    created_at: "2023-04-17T09:15:00Z"
  },
  {
    id: "p4",
    package_name: "Cosmetics",
    incoming_package_id: "ip4",
    user_id: "u1",
    customer_code: "KRC2530",
    warehouse_id: "w2",
    actual_weight: 0.8,
    photos: ["https://example.com/photo6.jpg", "https://example.com/photo7.jpg"],
    condition: "good",
    status: "stored",
    shipment_id: null,
    created_at: "2023-04-18T14:45:00Z"
  },
  {
    id: "p5",
    package_name: "Shoes",
    incoming_package_id: "ip5",
    user_id: "u4",
    customer_code: "KRC2533",
    warehouse_id: "w1",
    actual_weight: 2.0,
    photos: ["https://example.com/photo8.jpg"],
    condition: "good",
    status: "stored",
    shipment_id: null,
    created_at: "2023-04-19T16:20:00Z"
  },
  {
    id: "p6",
    package_name: "Accessories",
    incoming_package_id: "ip6",
    user_id: "u2",
    customer_code: "KRC2531",
    warehouse_id: "w3",
    actual_weight: 1.5,
    photos: ["https://example.com/photo9.jpg", "https://example.com/photo10.jpg"],
    condition: "good",
    status: "stored",
    shipment_id: null,
    created_at: "2023-04-20T12:10:00Z"
  }
];

export const dummyPayments: Payment[] = [
  {
    id: "pay1",
    shipment_id: "sh1",
    customer_code: "KRC2530",
    amount: 150.00,
    payment_method: "bank_transfer",
    status: "successful",
    transaction_ref: "TXN987654321",
    paid_at: "2023-05-02T09:00:00Z",
    created_at: "2023-05-01T08:00:00Z"
  }
];

export const dummyStaffAssignments: StaffAssignment[] = [
  {
    id: "sa1",
    staff_id: "s1",
    shipment_id: "sh1",
    role: "handler",
    assigned_at: "2023-05-01T08:00:00Z"
  }
];

export const dummyIncomingPackages: IncomingPackage[] = [
  {
    id: "ip1",
    user_id: "u1",
    customer_code: "KRC2530",
    incoming_tracking_number: "INC123456",
    warehouse_id: "w2",
    status: "received",
    declared_item_name: "Electronics",
    declared_item_quantity: 1,
    declared_item_weight: 2.5,
    created_at: "2023-04-10T12:00:00Z"
  }
];

export const dummyShippingRequests: ShippingRequest[] = [
  {
    id: "sr1",
    user_id: "u1",
    customer_code: "KRC2530",
    package_ids: ["p1"],
    method: "air",
    status: "approved",
    created_at: "2023-04-20T14:00:00Z"
  }
];

export const dummyTrackingEvents: TrackingEvent[] = [
  {
    id: "te1",
    shipment_id: "sh1",
    status: "shipped",
    location: "Shenzhen Warehouse",
    timestamp: "2023-05-01T08:00:00Z",
    notes: "Package shipped from origin warehouse"
  },
  {
    id: "te2",
    shipment_id: "sh1",
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
    contact_info: "+1234567890",
    tracking_api: "https://api.fastair.com/track"
  }
];

export const dummyPricingRules: PricingRule[] = [
  {
    id: "pr1",
    base_price: 50.00,
    price_per_kg: 10.00,
    price_per_km: 0.5,
    region: "China to Nigeria",
    carrier_id: "car1"
  }
];

export const dummyNotifications: Notification[] = [
  {
    id: "n1",
    user_id: "u1",
    title: "Package Received",
    message: "Your package has been received at the warehouse.",
    read: false,
    created_at: "2023-04-15T10:00:00Z"
  }
];

export const dummyActivityLogs: ActivityLog[] = [
  {
    id: "al1",
    user_id: "u1",
    action: "created",
    entity: "package",
    entity_id: "p1",
    time_stamp: "2023-04-15T10:00:00Z"
  }
];

// export const dummyCountries: Country[] = [
//   {
//     id: "cn1",
//     name: "Nigeria",
//     country: "NG"
//   },
//   {
//     id: "cn2",
//     name: "China",
//     country: "CN"
//   }
// ];

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
    category_id: "pc1",
    price: 25.00,
    discount_price: null,
    cost_price: 15.00,
    stock_quantity: 100,
    low_stock_threshold: 10,
    weight: 0.2,
    length: 15,
    width: 8,
    height: 1,
    status: "active",
    visibility: "public",
    is_featured: "true",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-01T10:00:00Z",
    updated_at: "2023-03-01T10:00:00Z"
  },
  {
    id: "prod2",
    slug: "wireless-earbuds",
    name: "Wireless Earbuds",
    description: "High-quality wireless earbuds with noise cancellation",
    category_id: "pc1",
    price: 80.00,
    discount_price: 70.00,
    cost_price: 50.00,
    stock_quantity: 75,
    low_stock_threshold: 15,
    weight: 0.05,
    length: 5,
    width: 3,
    height: 2,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-02T10:00:00Z",
    updated_at: "2023-03-02T10:00:00Z"
  },
  {
    id: "prod3",
    slug: "laptop-stand",
    name: "Laptop Stand",
    description: "Adjustable laptop stand for better ergonomics",
    category_id: "pc1",
    price: 40.00,
    discount_price: 35.00,
    cost_price: 25.00,
    stock_quantity: 60,
    low_stock_threshold: 12,
    weight: 0.8,
    length: 30,
    width: 20,
    height: 10,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-03T10:00:00Z",
    updated_at: "2023-03-03T10:00:00Z"
  },
  {
    id: "prod4",
    slug: "usb-cable",
    name: "USB Cable",
    description: "Fast charging USB-C cable",
    category_id: "pc1",
    price: 15.00,
    discount_price: 12.00,
    cost_price: 8.00,
    stock_quantity: 200,
    low_stock_threshold: 20,
    weight: 0.1,
    length: 100,
    width: 1,
    height: 1,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-04T10:00:00Z",
    updated_at: "2023-03-04T10:00:00Z"
  },
  {
    id: "prod5",
    slug: "power-bank",
    name: "Power Bank",
    description: "Portable power bank with 10000mAh capacity",
    category_id: "pc1",
    price: 35.00,
    discount_price: 30.00,
    cost_price: 20.00,
    stock_quantity: 90,
    low_stock_threshold: 18,
    weight: 0.3,
    length: 10,
    width: 6,
    height: 2,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-05T10:00:00Z",
    updated_at: "2023-03-05T10:00:00Z"
  },
  {
    id: "prod6",
    slug: "bluetooth-speaker",
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with waterproof design",
    category_id: "pc1",
    price: 60.00,
    discount_price: 55.00,
    cost_price: 40.00,
    stock_quantity: 45,
    low_stock_threshold: 9,
    weight: 0.4,
    length: 8,
    width: 8,
    height: 8,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-06T10:00:00Z",
    updated_at: "2023-03-06T10:00:00Z"
  },
  {
    id: "prod7",
    slug: "mouse-pad",
    name: "Mouse Pad",
    description: "Large gaming mouse pad with anti-slip base",
    category_id: "pc1",
    price: 20.00,
    discount_price: 18.00,
    cost_price: 12.00,
    stock_quantity: 150,
    low_stock_threshold: 25,
    weight: 0.15,
    length: 40,
    width: 30,
    height: 0.5,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-07T10:00:00Z",
    updated_at: "2023-03-07T10:00:00Z"
  },
  {
    id: "prod8",
    slug: "mechanical-keyboard",
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches",
    category_id: "pc1",
    price: 120.00,
    discount_price: 110.00,
    cost_price: 80.00,
    stock_quantity: 30,
    low_stock_threshold: 6,
    weight: 1.2,
    length: 45,
    width: 15,
    height: 4,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-08T10:00:00Z",
    updated_at: "2023-03-08T10:00:00Z"
  },
  {
    id: "prod9",
    slug: "monitor",
    name: "27-inch Monitor",
    description: "4K UHD monitor with IPS panel",
    category_id: "pc1",
    price: 300.00,
    discount_price: 280.00,
    cost_price: 200.00,
    stock_quantity: 20,
    low_stock_threshold: 4,
    weight: 5.0,
    length: 60,
    width: 20,
    height: 40,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-09T10:00:00Z",
    updated_at: "2023-03-09T10:00:00Z"
  },
  {
    id: "prod10",
    slug: "over-ear-headphones",
    name: "Over-Ear Headphones",
    description: "Noise-cancelling over-ear headphones",
    category_id: "pc1",
    price: 150.00,
    discount_price: 140.00,
    cost_price: 100.00,
    stock_quantity: 40,
    low_stock_threshold: 8,
    weight: 0.3,
    length: 20,
    width: 18,
    height: 10,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-10T10:00:00Z",
    updated_at: "2023-03-10T10:00:00Z"
  },
  {
    id: "prod11",
    slug: "tablet",
    name: "10-inch Tablet",
    description: "Android tablet with 128GB storage",
    category_id: "pc1",
    price: 250.00,
    discount_price: 230.00,
    cost_price: 180.00,
    stock_quantity: 25,
    low_stock_threshold: 5,
    weight: 0.5,
    length: 25,
    width: 17,
    height: 1,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-11T10:00:00Z",
    updated_at: "2023-03-11T10:00:00Z"
  },
  {
    id: "prod12",
    slug: "smartwatch",
    name: "Smartwatch",
    description: "Fitness tracking smartwatch with heart rate monitor",
    category_id: "pc1",
    price: 200.00,
    discount_price: 180.00,
    cost_price: 140.00,
    stock_quantity: 35,
    low_stock_threshold: 7,
    weight: 0.08,
    length: 4,
    width: 4,
    height: 1,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-12T10:00:00Z",
    updated_at: "2023-03-12T10:00:00Z"
  },
  {
    id: "prod13",
    slug: "wall-charger",
    name: "Wall Charger",
    description: "Fast wall charger with USB-C and USB-A ports",
    category_id: "pc1",
    price: 25.00,
    discount_price: 22.00,
    cost_price: 15.00,
    stock_quantity: 100,
    low_stock_threshold: 20,
    weight: 0.1,
    length: 5,
    width: 5,
    height: 3,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-13T10:00:00Z",
    updated_at: "2023-03-13T10:00:00Z"
  },
  {
    id: "prod14",
    slug: "webcam",
    name: "HD Webcam",
    description: "1080p HD webcam with auto-focus",
    category_id: "pc1",
    price: 70.00,
    discount_price: 65.00,
    cost_price: 45.00,
    stock_quantity: 50,
    low_stock_threshold: 10,
    weight: 0.2,
    length: 8,
    width: 5,
    height: 3,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-14T10:00:00Z",
    updated_at: "2023-03-14T10:00:00Z"
  },
  {
    id: "prod15",
    slug: "usb-microphone",
    name: "USB Microphone",
    description: "Condenser USB microphone for streaming",
    category_id: "pc1",
    price: 90.00,
    discount_price: 85.00,
    cost_price: 60.00,
    stock_quantity: 40,
    low_stock_threshold: 8,
    weight: 0.6,
    length: 15,
    width: 5,
    height: 5,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-15T10:00:00Z",
    updated_at: "2023-03-15T10:00:00Z"
  },
  {
    id: "prod16",
    slug: "wifi-router",
    name: "WiFi Router",
    description: "Dual-band WiFi router with Gigabit ports",
    category_id: "pc1",
    price: 80.00,
    discount_price: 75.00,
    cost_price: 55.00,
    stock_quantity: 30,
    low_stock_threshold: 6,
    weight: 0.5,
    length: 20,
    width: 15,
    height: 5,
    status: "active",
    visibility: "public",
    is_featured: "false",
    created_by: "u3",
    updated_by: "u3",
    created_at: "2023-03-16T10:00:00Z",
    updated_at: "2023-03-16T10:00:00Z"
  }
];

export const dummyProductImages: ProductImage[] = [
  {
    id: "pi1",
    product_id: "prod1",
    image_url: "https://picsum.photos/400/300?random=1",
    alt_text: "Smartphone case image",
    created_at: "2023-03-01T10:00:00Z"
  },
  {
    id: "pi2",
    product_id: "prod1",
    image_url: "https://picsum.photos/400/300?random=2",
    alt_text: "Smartphone case side view",
    created_at: "2023-03-01T10:05:00Z"
  },
  {
    id: "pi3",
    product_id: "prod1",
    image_url: "https://picsum.photos/400/300?random=3",
    alt_text: "Smartphone case in use",
    created_at: "2023-03-01T10:10:00Z"
  },
  {
    id: "pi4",
    product_id: "prod1",
    image_url: "https://picsum.photos/400/300?random=4",
    alt_text: "Smartphone case packaging",
    created_at: "2023-03-01T10:15:00Z"
  },
  {
    id: "pi5",
    product_id: "prod2",
    image_url: "https://picsum.photos/400/300?random=5",
    alt_text: "Wireless earbuds image",
    created_at: "2023-03-02T10:00:00Z"
  },
  {
    id: "pi6",
    product_id: "prod3",
    image_url: "https://picsum.photos/400/300?random=6",
    alt_text: "Laptop stand image",
    created_at: "2023-03-03T10:00:00Z"
  },
  {
    id: "pi7",
    product_id: "prod4",
    image_url: "https://picsum.photos/400/300?random=7",
    alt_text: "USB cable image",
    created_at: "2023-03-04T10:00:00Z"
  },
  {
    id: "pi8",
    product_id: "prod5",
    image_url: "https://picsum.photos/400/300?random=8",
    alt_text: "Power bank image",
    created_at: "2023-03-05T10:00:00Z"
  },
  {
    id: "pi9",
    product_id: "prod6",
    image_url: "https://picsum.photos/400/300?random=9",
    alt_text: "Bluetooth speaker image",
    created_at: "2023-03-06T10:00:00Z"
  },
  {
    id: "pi10",
    product_id: "prod7",
    image_url: "https://picsum.photos/400/300?random=10",
    alt_text: "Mouse pad image",
    created_at: "2023-03-07T10:00:00Z"
  },
  {
    id: "pi11",
    product_id: "prod8",
    image_url: "https://picsum.photos/400/300?random=11",
    alt_text: "Mechanical keyboard image",
    created_at: "2023-03-08T10:00:00Z"
  },
  {
    id: "pi12",
    product_id: "prod9",
    image_url: "https://picsum.photos/400/300?random=12",
    alt_text: "27-inch monitor image",
    created_at: "2023-03-09T10:00:00Z"
  },
  {
    id: "pi13",
    product_id: "prod10",
    image_url: "https://picsum.photos/400/300?random=13",
    alt_text: "Over-ear headphones image",
    created_at: "2023-03-10T10:00:00Z"
  },
  {
    id: "pi14",
    product_id: "prod11",
    image_url: "https://picsum.photos/400/300?random=14",
    alt_text: "10-inch tablet image",
    created_at: "2023-03-11T10:00:00Z"
  },
  {
    id: "pi15",
    product_id: "prod12",
    image_url: "https://picsum.photos/400/300?random=15",
    alt_text: "Smartwatch image",
    created_at: "2023-03-12T10:00:00Z"
  },
  {
    id: "pi16",
    product_id: "prod13",
    image_url: "https://picsum.photos/400/300?random=16",
    alt_text: "Wall charger image",
    created_at: "2023-03-13T10:00:00Z"
  },
  {
    id: "pi17",
    product_id: "prod14",
    image_url: "https://picsum.photos/400/300?random=17",
    alt_text: "HD webcam image",
    created_at: "2023-03-14T10:00:00Z"
  },
  {
    id: "pi18",
    product_id: "prod15",
    image_url: "https://picsum.photos/400/300?random=18",
    alt_text: "USB microphone image",
    created_at: "2023-03-15T10:00:00Z"
  },
  {
    id: "pi19",
    product_id: "prod16",
    image_url: "https://picsum.photos/400/300?random=19",
    alt_text: "WiFi router image",
    created_at: "2023-03-16T10:00:00Z"
  }
];