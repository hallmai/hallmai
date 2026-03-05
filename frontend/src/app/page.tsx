import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6">
      <h1 className="text-3xl font-black tracking-tight text-stone-800">
        hallmai
      </h1>
      <p className="text-stone-400 text-sm mt-1">
        AI family care companion
      </p>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[240px]">
        <Link
          href="/demo"
          className="block text-center px-6 py-3 bg-coral text-white rounded-2xl font-semibold text-sm"
        >
          Demo Dashboard
        </Link>
        <Link
          href="/demo/call"
          className="block text-center px-6 py-3 bg-stone-800 text-white rounded-2xl font-semibold text-sm"
        >
          Demo Call
        </Link>
        <Link
          href="/demo/settings"
          className="block text-center px-6 py-3 bg-white text-stone-800 rounded-2xl font-semibold text-sm border border-stone-200"
        >
          Demo Settings
        </Link>
      </div>
    </div>
  );
}
