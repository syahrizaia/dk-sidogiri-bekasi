import React from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { Footer } from "@/components/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col w-full max-w-full overflow-x-clip">
      <PublicNavbar />
      <main className="flex-1 w-full min-w-0 max-w-full overflow-x-clip">{children}</main>
      <Footer />
    </div>
  );
}
