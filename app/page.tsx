"use client"

import CTARedirectButton from "@/components/base/CTARedirectButton";
import { ctaButtonsProps } from "@/components_map_definitions/ctaRedirectButtons";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaShippingFast } from "react-icons/fa";

export default function Home() {
  const { role } = useUserStore()

  if(role === "admin"){
    redirect('/admin')
    return null
  }

  return(
    <div className="min-h-dvh h-dvh ">
      {/* Carasol */}
      <div className="bg-accent-blue h-50 relative">
        
      </div>

      <div className="p-body bg-yellow-50/10">
        {ctaButtonsProps.map( (button, i) => 
        <CTARedirectButton key={i} {...button} /> 
        )}
      </div>
    </div>
  )
}
