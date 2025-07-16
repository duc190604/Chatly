"use client";
import Taskbar from "@/components/taskbar";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setAccessToken, setRefreshToken, setSession } from "@/redux/features/authSlice";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { RootState } from "@/redux/store";
import Loading from "@/components/loading";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );
  const { data: session } = useSession();
  useEffect(() => {
    if(session?.user && (session?.user.accessToken !== accessToken || session?.user.refreshToken !== refreshToken)) {
      setIsLoading(false);
      dispatch(setSession(session?.user));
    }
  }, [session]);
  return (
    <div className="w-screen h-screen flex">
      {/* <Loading isLoading={isLoading} /> */}
      <div className="shadow-lg">
        <Taskbar />
      </div>
      <div className="bg-white flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
