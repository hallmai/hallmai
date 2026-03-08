"use client";

import { clearAuth, isTokenValid } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isTokenValid()) {
      router.push("/dashboard");
    } else {
      clearAuth();
      router.push("/call");
    }
  }, [router]);

  return null;
}
