"use client";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex">
      <div className="bg-white h-full w-1/2">{children}</div>
      <div
        className="h-full w-1/2"
        style={{
          backgroundImage: "url('/images/login5.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
    </div>
  );
}
