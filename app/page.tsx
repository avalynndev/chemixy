import { CompoundPage } from "@/components/compound";

export default function Home() {
  return (
    <>
      <main className="overflow-x-hidden md:overflow-visible">
        <div className="relative overflow-hidden">
          <div
            className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-[0.10]"
            style={{
              backgroundImage: "url('/bg.webp')",
              backgroundAttachment: "fixed",
            }}
          />
        </div>
        <div className="pointer-events-none"></div>
      </main>
      <CompoundPage />
    </>
  );
}
