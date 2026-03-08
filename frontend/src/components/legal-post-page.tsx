"use client";

import AppShell from "@/components/app-shell";
import { fetchLatestPost, PostData } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LegalPostPageProps {
  category: string;
  defaultTitle: string;
}

export default function LegalPostPage({ category, defaultTitle }: LegalPostPageProps) {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPost(category).then((p) => { setPost(p); setLoading(false); });
  }, [category]);

  return (
    <AppShell>
      <header className="flex items-center px-5 h-14 border-b border-stone-200/40">
        <Link href="/auth/register" className="text-[14px] text-[#E8725C] font-medium">&larr; 돌아가기</Link>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold text-stone-800 mb-6">{post?.title ?? defaultTitle}</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="size-6 animate-spin rounded-full border-2 border-[#E8725C] border-t-transparent" />
          </div>
        ) : !post ? (
          <p className="py-20 text-center text-stone-400">준비 중입니다</p>
        ) : (
          <div className="prose prose-sm prose-stone whitespace-pre-line text-[14px] leading-relaxed text-stone-600">
            {post.content}
          </div>
        )}
      </div>
    </AppShell>
  );
}
