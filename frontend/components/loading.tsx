"use client";
import React from "react";

export default function Loading({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-8 h-8">
          <div className="w-8 h-8 border-4 border-gray-200 rounded-full"></div>
          <div className="w-8 h-8 border-4 border-blue-400 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
        <p className="mt-1 text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
