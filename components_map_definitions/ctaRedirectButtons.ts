import type { CTARedirectButton } from "@/components/base/CTARedirectButton";
import { FaBox, FaShippingFast } from "react-icons/fa";
import { FaMapLocationDot, FaUserPlus, FaUserTag } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";

export const ctaButtonsProps: CTARedirectButton[] = [
    {
        title: "Request Mail",
        icon: FaShippingFast,
        path: "/"
    },
    {
        title: "Warehouse Address",
        icon: FaMapLocationDot,
        path: "/"
    },
    {
        title: "Inspection and Verification",
        icon: MdVerified,
        path: "/"
    },
    {
        title: "All Packages",
        icon: FaBox,
        path: "/"
    },
    {
        title: "New User Ordering Process",
        icon: FaUserTag,
        path: "/"
    },
]