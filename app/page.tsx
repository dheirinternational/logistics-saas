"use client"

import { useUserStore } from "@/store/userStore";
import { redirect } from "next/navigation";

export default function Home() {
  const { role } = useUserStore()

  if(role === "customer"){
    redirect('/base')
  }

  if(role === "admin"){
    redirect('/admin')
  }

  return 
}
