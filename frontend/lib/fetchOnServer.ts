import { sign } from "crypto";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { json } from "stream/consumers";

export async function fetchOnServer<T extends { ok: boolean; error?: any }>(
  fetchFn: () => Promise<T>,
): Promise<T> {
  try {
    const res= await fetchFn();  
    if(res.error) {
      const error= res?.error;
    throw error;
    } else {
      return res
    }
  } catch (error: any) {
    if (error?.status === 401) {
      signOut({ callbackUrl: "/auth/login" });
      sessionStorage.clear();
      toast.error("Session expired. Please log in again.");
    }
    throw error
  }
}
