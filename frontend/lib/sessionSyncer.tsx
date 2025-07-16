"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setSession } from "@/redux/features/authSlice";
import { RootState } from "@/redux/store";
import { signOut } from "next-auth/react";
import { logout } from "@/redux/features/authSlice";
export default function SessionSyncer() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
const { user, accessToken, refreshToken } = useSelector(
  (state: RootState) => state.auth
);
  useEffect(() => {
    if (status === "authenticated" && session?.user  &&
      (session?.user.accessToken !== accessToken ||
        session?.user.refreshToken !== refreshToken)) {
      dispatch(setSession(session.user));
    }
    if(session?.error=="refresh token failed"){
      sessionStorage.clear();
      signOut({ callbackUrl: "/auth/login" });      
    }
  }, [session, status]);

  return null; // Không render gì, chỉ đồng bộ session
}
