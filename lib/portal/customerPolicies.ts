export type CustomerPolicySection = {
  title: string
  items: string[]
}

export type CustomerPolicy = {
  title: string
  sections: CustomerPolicySection[]
}

/** China → Nigeria logistics: sea/air timelines and Nigeria waybill. */
export const LOGISTICS_SHIPPING_POLICY: CustomerPolicy = {
  title: "Delivery and Shipping",
  sections: [
    {
      title: "Shipping time",
      items: [
        "The estimated delivery time for sea shipment is 3–4 months. However, delivery timelines may vary depending on the supplier's local dispatch schedule.",
        "Once goods arrive at our warehouse and shipment is processed, international shipping will commence accordingly. While we strive to ensure timely delivery, some factors are beyond our direct control.",
      ],
    },
    {
      title: "Waybill costs",
      items: [
        "For bulk shipments, local waybill charges cannot be determined in advance because they depend on the volumetric weight, actual weight, destination, and the rates of the local delivery provider at the time of waybill.",
        "Any applicable waybill fee will be calculated and communicated upon the arrival of the goods in Nigeria.",
        "If the product purchase includes a waybill promotion or offer, delivery to the nearest terminal or designated pickup location close to your address may be covered. In such cases, no additional waybill fee will be required for that portion of the delivery.",
        "Any special home delivery requests beyond the covered destination may attract additional charges.",
      ],
    },
  ],
}

/** Marketplace shop: local delivery fee at checkout (not international logistics). */
export const SHOP_DELIVERY_POLICY: CustomerPolicy = {
  title: "Shop delivery",
  sections: [
    {
      title: "Delivery fee",
      items: [
        "The delivery fee shown is based on your saved delivery address and zone.",
        "It covers local delivery to your door in Nigeria once your order is ready to dispatch.",
      ],
    },
    {
      title: "Promotions & home delivery",
      items: [
        "If a product purchase includes a waybill promotion or offer, delivery to the nearest terminal or designated pickup location close to your address may be covered.",
        "Special home delivery requests beyond the covered destination may attract additional charges.",
      ],
    },
  ],
}
