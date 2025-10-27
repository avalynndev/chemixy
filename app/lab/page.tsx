"use client";

import { LabPage } from "@/components/lab";

export default function Lab() {
  return (
    <>
      <main className="overflow-x-hidden md:overflow-visible">
        <div className="relative overflow-hidden">
          <div
            className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-[0.25]"
            style={{
              backgroundImage: "url('/bg.jpg')",
              backgroundAttachment: "fixed",
            }}
          />
        </div>
        <div className="pointer-events-none"></div>
      </main>
      <LabPage page />
    </>
  );
}
