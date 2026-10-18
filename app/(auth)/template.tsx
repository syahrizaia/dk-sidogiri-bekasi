"use client";

import React from "react";

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-transition flex flex-col flex-1 w-full justify-center">
      {children}
    </div>
  );
}
