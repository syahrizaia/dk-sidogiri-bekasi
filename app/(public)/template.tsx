"use client";

import React from "react";

export default function PublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-transition flex flex-col flex-1 w-full">
      {children}
    </div>
  );
}
