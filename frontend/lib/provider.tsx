"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import QueryProvider from "@/lib/queryProvider";
import SessionSyncer from "./sessionSyncer";
import { SocketProvider } from "@/context/SocketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SessionSyncer/>
          <QueryProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </QueryProvider>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}
