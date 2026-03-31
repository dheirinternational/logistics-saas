import type { CTARedirectButton } from "@/components/base/CTARedirectButton";
import { BsBoxArrowInDown, BsBoxArrowUp } from "react-icons/bs";
import { FaBox, FaShippingFast, FaUserEdit } from "react-icons/fa";
import { FaMapLocationDot, FaUserPlus, FaUserTag } from "react-icons/fa6";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { LuPackagePlus } from "react-icons/lu";
import { MdLocalShipping, MdPayment, MdPending, MdPendingActions, MdVerified } from "react-icons/md";

export const ctaButtonsProps: CTARedirectButton[] = [
    {
        title: "Request Mail",
        icon: FaShippingFast,
        path: "/base/request_mail"
    },
    {
        title: "Warehouse Address",
        icon: FaMapLocationDot,
        path: "/base/warehouse_address"
    },
    {
        title: "Pending Payments",
        icon: MdPendingActions,
        path: "/base/pending_payments"
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
        path: "/base/waiting_to_be_released"
    },
    {
        title: "Signed For",
        icon: MdLocalShipping,
        path: "/base/orders_shipped"
    },
    {
        title: "Order Payment",
        icon: MdPayment,
        path: "/base/shipments_payments"
    },
]

export const profileMenuCtaButtonsProps: CTARedirectButton[] = [
    // {
    //     title: "Package Claim",
    //     path: "/base/profile",
    //     icon: LuPackagePlus
    // },
    {
        title: "Warehouse Address",
        path: "/base/warehouse_address",
        icon: FaMapLocationDot
    },
    {
        title: "Edit profile",
        path: "/base/edit_profile",
        icon: FaUserEdit
    }
]

export const adminProfileMenuCtaButtonsProps: CTARedirectButton[] = [

    {
        title: "Edit profile",
        path: "/admin/edit_profile",
        icon: FaUserEdit
    }
]