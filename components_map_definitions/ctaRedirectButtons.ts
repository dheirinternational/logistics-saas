import type { CTARedirectButton } from "@/components/base/CTARedirectButton";
import { FaShippingFast } from "react-icons/fa";

export const ctaButtonsProps: CTARedirectButton[] = [
    {
        title: "Request Mail",
        icon: FaShippingFast,
        path: "/"
    }
]