import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/lib/actions/auth";

export default async function UsersModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserAction();

  // Modul Manajemen Pengguna HANYA BISA DIAKSES oleh Super Admin
  if (!user || user.role !== "super_admin") {
    redirect("/modules?error=unauthorized");
  }

  return <>{children}</>;
}
