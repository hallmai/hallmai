"use client";

import { useSyncExternalStore } from "react";
import AppShell from "@/components/app-shell";
import FamilyTabs from "@/components/family-tabs";
import { CallStateProvider, useCallState } from "@/contexts/call-state";
import { isTokenValid } from "@/lib/auth";

const subscribeAuth = () => () => {};
const getAuthSnapshot = () => isTokenValid();
const getServerAuthSnapshot = () => false;

function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const { callActive } = useCallState();
  const isLoggedIn = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);

  return (
    <AppShell>
      {children}
      {isLoggedIn && !callActive && <FamilyTabs />}
    </AppShell>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CallStateProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </CallStateProvider>
  );
}
