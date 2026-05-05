import type { CTARedirectButton } from "@/components/base/CTARedirectButton";
import { BsBoxArrowInDown, BsBoxArrowUp, BsCart3, BsList } from "react-icons/bs";
import { FaBoxes, FaShippingFast, FaUserEdit } from "react-icons/fa";
import { FaMapLocationDot, FaUserTag } from "react-icons/fa6";
import { GrDocument, GrOrderedList } from "react-icons/gr";
import { LiaFirstOrder } from "react-icons/lia";
import { LuPackagePlus } from "react-icons/lu";
import { MdLocalShipping, MdPayment, MdPendingActions} from "react-icons/md";

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

    // {
    //     title: "New User Ordering Process",
    //     icon: FaUserTag,
    //     path: "/in_development"
    // },
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
        title: "All Packages",
        icon: FaBoxes,
        path: "/base/all_packages"
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
        title: "Shipment",
        icon: MdLocalShipping,
        path: "/base/orders_shipped"
    },
    {
        title: "Payment Receipts",
        icon: MdPayment,
        path: "/base/payment_receipts"
    },
    {
        title: "Pending Payments",
        icon: MdPendingActions, 
        path: "/base/pending_payments"
    },
    {
        title: "Orders",
        icon: BsCart3, 
        path: "/base/orders"
    }
]

export const profileMenuCtaButtonsProps: CTARedirectButton[] = [
    {
        title: "Warehouse Address",
        path: "/base/warehouse_address",
        icon: FaMapLocationDot
    },
    {
        title: "My Address",
        path: "/base/my_address",
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