import { API_URL } from "./config";

export async function apiGoogleLogin(code: string) {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorCode = data?.data?.errorCode || data?.errorCode;
    if (errorCode === "USER_NOT_REGISTERED") {
      const idToken = data?.data?.idToken || data?.idToken;
      return { registered: false as const, idToken };
    }
    throw new Error(data?.message || "Login failed");
  }

  return { registered: true as const, ...data.data };
}

export async function apiGoogleRegister(idToken: string, marketingAgreed: boolean) {
  const res = await fetch(`${API_URL}/api/auth/google/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, marketingAgreed }),
  });

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  const data = await res.json();
  return data.data;
}

export interface AuthUser {
  pid: string;
  email: string;
  name: string;
  profileImage: string | null;
  role: string;
}

export function saveAuth(data: { accessToken: string; refreshToken: string; user: AuthUser }) {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function isTokenValid(): boolean {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
