import {Admin, Staff, Customer, TrackingEvent, Carrier, PricingRule, Notification, ActivityLog, ProductImage } from "./entityTypeDef";

// Dummy data for testing frontend

// export const dummyUsers: User[] = [
//   {
//     id: "u1",
//     first_name: "John",
//     last_name: "Doe",
//     email: "john.doe@example.com",
//     role: "customer",
//     phone: "+1234567890",
//     created_at: "2023-01-15T10:00:00Z"
//   },
//   {
//     id: "u2",
//     first_name: "Jane",
//     last_name: "Smith",
//     email: "jane.smith@example.com",
//     role: "staff",
//     phone: "+0987654321",
//     created_at: "2023-02-20T14:30:00Z"
//   },
//   {
//     id: "u3",
//     first_name: "Admin",
//     last_name: "User",
//     email: "admin@example.com",
//     role: "admin",
//     phone: "+1122334455",
//     created_at: "2023-01-01T00:00:00Z"
//   }
// ];

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

// export const dummyNotifications: Notification[] = [
//   {
//     id: "n1",
//     user_id: "u1",
//     title: "Package Received",
//     message: "Your package has been received at the warehouse.",
//     read: false,
//     created_at: "2023-04-15T10:00:00Z"
//   }
// ];

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



export const dummyProductImages: ProductImage[] = [
  {
    id: "pi1",
    product_id: 0,
    image_url: "https://picsum.photos/400/300?random=1",
    alt_text: "Smartphone case image",
    created_at: "2023-03-01T10:00:00Z"
  },
  {
    id: "pi2",
    product_id: 1,
    image_url: "https://picsum.photos/400/300?random=2",
    alt_text: "Smartphone case side view",
    created_at: "2023-03-01T10:05:00Z"
  },
  {
    id: "pi3",
    product_id: 2,
    image_url: "https://picsum.photos/400/300?random=3",
    alt_text: "Smartphone case in use",
    created_at: "2023-03-01T10:10:00Z"
  },
  {
    id: "pi4",
    product_id: 3,
    image_url: "https://picsum.photos/400/300?random=4",
    alt_text: "Smartphone case packaging",
    created_at: "2023-03-01T10:15:00Z"
  },
  {
    id: "pi5",
    product_id: 4,
    image_url: "https://picsum.photos/400/300?random=5",
    alt_text: "Wireless earbuds image",
    created_at: "2023-03-02T10:00:00Z"
  },
  {
    id: "pi6",
    product_id: 5,
    image_url: "https://picsum.photos/400/300?random=6",
    alt_text: "Laptop stand image",
    created_at: "2023-03-03T10:00:00Z"
  },
  {
    id: "pi7",
    product_id: 6,
    image_url: "https://picsum.photos/400/300?random=7",
    alt_text: "USB cable image",
    created_at: "2023-03-04T10:00:00Z"
  },
  {
    id: "pi8",
    product_id: 7,
    image_url: "https://picsum.photos/400/300?random=8",
    alt_text: "Power bank image",
    created_at: "2023-03-05T10:00:00Z"
  },
  {
    id: "pi9",
    product_id: 8,
    image_url: "https://picsum.photos/400/300?random=9",
    alt_text: "Bluetooth speaker image",
    created_at: "2023-03-06T10:00:00Z"
  },
  {
    id: "pi10",
    product_id: 9,
    image_url: "https://picsum.photos/400/300?random=10",
    alt_text: "Mouse pad image",
    created_at: "2023-03-07T10:00:00Z"
  },
  {
    id: "pi11",
    product_id: 10,
    image_url: "https://picsum.photos/400/300?random=11",
    alt_text: "Mechanical keyboard image",
    created_at: "2023-03-08T10:00:00Z"
  },
  {
    id: "pi12",
    product_id: 11,
    image_url: "https://picsum.photos/400/300?random=12",
    alt_text: "27-inch monitor image",
    created_at: "2023-03-09T10:00:00Z"
  },
  {
    id: "pi13",
    product_id: 12,
    image_url: "https://picsum.photos/400/300?random=13",
    alt_text: "Over-ear headphones image",
    created_at: "2023-03-10T10:00:00Z"
  },
  {
    id: "pi14",
    product_id: 13,
    image_url: "https://picsum.photos/400/300?random=14",
    alt_text: "10-inch tablet image",
    created_at: "2023-03-11T10:00:00Z"
  },
  {
    id: "pi15",
    product_id: 14,
    image_url: "https://picsum.photos/400/300?random=15",
    alt_text: "Smartwatch image",
    created_at: "2023-03-12T10:00:00Z"
  },
  {
    id: "pi16",
    product_id: 15,
    image_url: "https://picsum.photos/400/300?random=16",
    alt_text: "Wall charger image",
    created_at: "2023-03-13T10:00:00Z"
  },
  {
    id: "pi17",
    product_id: 16,
    image_url: "https://picsum.photos/400/300?random=17",
    alt_text: "HD webcam image",
    created_at: "2023-03-14T10:00:00Z"
  },
  {
    id: "pi18",
    product_id: 17,
    image_url: "https://picsum.photos/400/300?random=18",
    alt_text: "USB microphone image",
    created_at: "2023-03-15T10:00:00Z"
  },
  {
    id: "pi19",
    product_id: 18,
    image_url: "https://picsum.photos/400/300?random=19",
    alt_text: "WiFi router image",
    created_at: "2023-03-16T10:00:00Z"
  }
];