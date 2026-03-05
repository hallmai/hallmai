import MobileLayout from "@/components/mobile-layout";

export default function Home() {
  return (
    <MobileLayout>
      <div className="px-5 py-4 space-y-6">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <h3 className="font-medium">Content {i + 1}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Scrollable content area
            </p>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
