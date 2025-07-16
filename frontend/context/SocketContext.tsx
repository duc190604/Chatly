"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { refreshAccessToken } from "@/lib/utils";

const SocketContext = createContext<{
  socket: Socket | null;
}>({
  socket: null,
});
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isRefreshingRef = useRef(false);
  const currentTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Nếu không có accessToken, ngắt kết nối
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      currentTokenRef.current = null;
      return;
    }

    // Nếu chưa có socket, tạo mới
    if (!socketRef.current) {
      createSocket(accessToken);
      return;
    }

    // Nếu có token mới, chỉ cập nhật auth
    if (currentTokenRef.current !== accessToken) {
      socketRef.current.auth = { token: accessToken };
      currentTokenRef.current = accessToken;

      // Nếu đang connected, disconnect rồi connect lại với token mới
      if (socketRef.current.connected) {
        setSocket(null);
        socketRef.current.disconnect();
        socketRef.current.connect();
      }
    }
  }, [accessToken]);

  const createSocket = (token: string) => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    currentTokenRef.current = token;

    newSocket.on("connect", () => {
      isRefreshingRef.current = false;
      setSocket(newSocket);
    });

    newSocket.on("connect_status", async (res) => {
      if (res?.error?.type === "Unauthorized" && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        setSocket(null);

        try {
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            newSocket.auth = { token: newToken };
            currentTokenRef.current = newToken;
            newSocket.disconnect();
            newSocket.connect();
          }
        } catch (error) {
          isRefreshingRef.current = false;
        }
      }
      if (res.status === "success") {
      }
    });

    newSocket.on("disconnect", (reason) => {
      setSocket(null);
      // if (reason === "io server disconnect") {
      //   // Server ngắt kết nối, thử reconnect
      //   newSocket.connect();
      // }
    });

    newSocket.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
      isRefreshingRef.current = false;
    });
  };

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
