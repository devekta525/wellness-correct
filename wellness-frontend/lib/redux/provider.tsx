"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ReactNode, useEffect } from "react";
import { loadUserFromToken } from "./features/authSlice";

export function ReduxProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Load user from token on app start
    store.dispatch(loadUserFromToken());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
