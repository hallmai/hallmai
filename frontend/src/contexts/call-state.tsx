"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const CallStateContext = createContext<{
  callActive: boolean;
  setCallActive: (active: boolean) => void;
}>({
  callActive: false,
  setCallActive: () => {},
});

export function CallStateProvider({ children }: { children: ReactNode }) {
  const [callActive, setCallActive] = useState(false);
  return (
    <CallStateContext.Provider value={{ callActive, setCallActive }}>
      {children}
    </CallStateContext.Provider>
  );
}

export function useCallState() {
  return useContext(CallStateContext);
}
