import React from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { Footer } from "@/components/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
