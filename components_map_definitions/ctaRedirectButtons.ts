import type { CTARedirectButton } from "@/components/base/CTARedirectButton";
import { BsBoxArrowInDown, BsBoxArrowUp } from "react-icons/bs";
import { FaBox, FaShippingFast } from "react-icons/fa";
import { FaMapLocationDot, FaUserPlus, FaUserTag } from "react-icons/fa6";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { LuPackagePlus } from "react-icons/lu";
import { MdLocalShipping, MdPayment, MdVerified } from "react-icons/md";

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

export const profileCtaButtonsProps: CTARedirectButton[] = [
    {
        title: "Add Package",
        icon: LuPackagePlus,
        path: "/base/add_package"
    },
    {
        title: "Waiting To Be Stored",
        icon: BsBoxArrowInDown,
        path: "/base/waiting_to_be_stored"
    },
    {
        title: "Request Mail",
        icon: FaShippingFast,
        path: "/base/request_mail"
    },
    {
        title: "Waiting to be released",
        icon: BsBoxArrowUp,
        path: "/"
    },
    {
        title: "Signed For",
        icon: MdLocalShipping,
        path: "/"
    },
    {
        title: "Order Payment",
        icon: MdPayment,
        path: "/"
    },
]

export const profileMenuCtaButtonsProps: CTARedirectButton[] = [
    {
        title: "Package Claim",
        path: "/base/profile",
        icon: LuPackagePlus
    },
    {
        title: "Warehouse Address",
        path: "/base/profile",
        icon: FaMapLocationDot
    },
    {
        title: "Edit profile",
        path: "/base/profile",
        icon: FaUserPlus
    }
]