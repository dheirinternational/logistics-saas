"use server"

import { deleteSession } from "./session"

export async function logoutAction() {
  await deleteSession()
}
