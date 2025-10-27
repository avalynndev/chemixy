"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { soundManager } from "@/lib/sound-manager";

export default function Navbar() {
  const [soundEnabled, setSoundEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadSoundState() {
      const enabled = await Promise.resolve(soundManager.isEnabled());
      setSoundEnabled(enabled);
    }

    loadSoundState();
  }, []);

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
  };

  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-3 px-3 py-2 sm:px-2 pt-4">
      <div className="flex min-w-0 flex-1 items-center">
        <div className="mr-1 flex">
          <Link
            className="flex items-center text-sm size-8 w-auto rounded-md py-1.5 border-0"
            href="/"
          >
            <Image src="/icon0.svg" alt="Icon" height="44" width="44" />
            <span className="sr-only">Chemixy</span>
          </Link>
        </div>

        <span className="text-alpha-400 w-4 min-w-4 select-none text-center text-lg block">
          /
        </span>

        <div className="flex min-w-0 flex-1 items-center truncate text-start text-sm font-medium leading-[20px] pl-2">
          <div className="max-w-64 truncate pr-1">Chemixy</div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {soundEnabled !== null && (
          <Button variant="outline" size="icon" onClick={toggleSound}>
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
