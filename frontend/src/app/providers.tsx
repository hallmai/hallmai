"use client";

import { I18nProvider } from "@/lib/i18n";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <I18nProvider>{children}</I18nProvider>
    </GoogleOAuthProvider>
  );
}
