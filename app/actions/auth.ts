"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies } from "@/app/lib/auth-cookies";

export async function logout() {
  await clearAuthCookies();
  redirect("/auth");
}
