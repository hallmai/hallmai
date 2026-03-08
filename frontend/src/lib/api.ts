import { clearAuth, getAccessToken } from "./auth";
import { API_URL } from "./config";

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
  return res;
}

export interface PostData {
  pid: string;
  category: string;
  title: string;
  content: string;
  createdAt: string;
}

export async function fetchLatestPost(category: string): Promise<PostData | null> {
  const res = await apiFetch(`/api/posts/latest?category=${category}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.post ?? null;
}

export interface LinkedDevice {
  pid: string;
  deviceUuid: string;
  nickname: string | null;
  linkedAt: string;
}

export async function fetchLinkedDevices(): Promise<LinkedDevice[]> {
  const res = await apiFetch(`/api/device/linked`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data?.devices ?? [];
}

export interface StoryCardData {
  pid: string;
  type: string;
  cardedAt: string;
  data: {
    topic: string;
    quote: string;
    vibe: "warm" | "calm" | "quiet";
  };
  createdAt: string;
}

export async function fetchStoryCards(devicePid: string): Promise<StoryCardData[]> {
  const res = await apiFetch(`/api/story-cards/${devicePid}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data?.cards ?? [];
}

export async function linkDevice(code: string, nickname?: string) {
  const res = await apiFetch(`/api/device/link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, nickname }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.data?.message || data?.message || "연결 실패");
  }
  const data = await res.json();
  return data.data;
}
