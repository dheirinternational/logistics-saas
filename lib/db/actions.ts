"use server"

import { clearSession, getSession } from "./session"
import { redirect } from "next/navigation"

export async function logoutAction() {
  await clearSession()
  redirect("/auth/login")
}

export async function getUserSession(){
  await getSession()
}