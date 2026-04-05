"use server"

import { deleteSession, getSession } from "./session"

export async function logoutAction() {
  await deleteSession()
}

export async function getUserSession(){
  await getSession()
}