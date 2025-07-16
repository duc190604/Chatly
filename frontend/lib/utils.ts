import axios from "axios"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axiosInstance from "./axiosInstance";
import { signOut } from "next-auth/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export async function refreshAccessToken(refreshToken: string) {
  try {
  const res = await axiosInstance.post(`/api/auth/refresh-token`,
    {
      refreshToken: refreshToken,
    },
  );
  return res.data.data.accessToken;
  } catch (error) {
    sessionStorage.clear();
    signOut();
    console.error("❌ Failed to refresh token:", error);
  }

}
export const downloadFile = async (url:string, name?:string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = name || "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

