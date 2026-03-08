import { getAccessToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PostData {
  pid: string;
  category: string;
  title: string;
  content: string;
  createdAt: string;
}

export async function fetchLatestPost(category: string): Promise<PostData | null> {
  const res = await fetch(`${API_URL}/api/posts/latest?category=${category}`);
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
  const res = await fetch(`${API_URL}/api/device/linked`, {
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_URL}/api/story-cards/${devicePid}`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data?.cards ?? [];
}

export async function linkDevice(code: string, nickname?: string) {
  const res = await fetch(`${API_URL}/api/device/link`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ code, nickname }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.data?.message || data?.message || "연결 실패");
  }
  const data = await res.json();
  return data.data;
}
