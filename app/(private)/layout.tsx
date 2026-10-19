import React from "react";
import { PrivateSidebar } from "@/components/private-sidebar";
import { Footer } from "@/components/footer";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background/50 w-full max-w-full overflow-x-clip">
      <PrivateSidebar />
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300 w-full min-w-0 max-w-full overflow-x-clip">
        <main className="flex-1 w-full min-w-0 max-w-full pt-16 lg:pt-6 pb-8 overflow-x-clip">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
