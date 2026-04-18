import {Admin, Staff, Customer, TrackingEvent, Carrier, PricingRule, Notification, ProductImage } from "./entityTypeDef";

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



