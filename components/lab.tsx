"use client";

import { useEffect, useState } from "react";
import {
  getSavedCompounds,
  deleteCompounds,
  toggleFavorite,
} from "@/lib/craft";
import { Compound } from "@/types";
import {
  Keerthi,
  KeerthiTrigger,
  KeerthiContent,
  KeerthiDescription,
  KeerthiHeader,
  KeerthiTitle,
  KeerthiBody,
} from "@/components/ui/keerthi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, RefreshCw, Home, Book } from "lucide-react";
import { soundManager } from "@/lib/sound-manager";
import { SidebarInset } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "./ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function LabPage({ page = false }: { page?: boolean }) {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompounds();
  }, []);

  async function handleFavorite(id: string) {
    await toggleFavorite(id);
    loadCompounds();
  }

  const loadCompounds = async () => {
    setIsLoading(true);
    try {
      const saved = await getSavedCompounds();
      setCompounds(saved.sort((a, b) => b.timestamp - a.timestamp));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompounds();
  }, []);

  const handleReload = () => {
    loadCompounds();
    soundManager.playSparkle();
  };

  const handleDelete = (id: string) => {
    deleteCompounds(id);
    loadCompounds();
    soundManager.playPop();
  };

  const handleToggleFavorite = (id: string) => {
    const compound = compounds.find((i) => i.id === id);
    toggleFavorite(id);
    loadCompounds();

    if (compound?.isFavorite) {
      soundManager.playDrop();
    } else {
      soundManager.playBubble();
    }
  };

  const handleFilterChange = (v: "all" | "favorites") => {
    setFilter(v);
    soundManager.playClick();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const filteredCompounds = compounds.filter((compound) =>
    filter === "favorites" ? compound.isFavorite : true
  );

  return (
    <SidebarInset
      className={cn(
        "m-2 rounded-xl border bg-transparent shadow-sm flex-col h-[calc(100vh-3.75rem)]",
        page ? "flex" : "hidden xl:flex"
      )}
    >
      <ScrollArea className="h-full [&>div>div::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-transparent backdrop-blur rounded-t-xl transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            {page ? (
              <Link href="/" onClick={() => soundManager.playPing()}>
                <Home className="w-6 h-6 text-muted-foreground -ml-1" />
              </Link>
            ) : (
              <Book className="w-4 h-4 -ml-1" />
            )}
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-base font-medium">Lab</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 overflow-x-hidden md:overflow-visible">
          <div className="overflow-hidden relative">
            <div className="space-y-6 p-4 pt-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Your Lab
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredCompounds.length}{" "}
                    {filteredCompounds.length === 1 ? "compound" : "compounds"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filter} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Compounds</SelectItem>
                      <SelectItem value="favorites">Favorites</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleReload}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>

              <div
                className={cn(
                  "grid gap-4",
                  page
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 2xl:grid-cols-2"
                )}
              >
                {filteredCompounds.map((compound) => (
                  <Card
                    key={compound.id}
                    className="border bg-transparent backdrop-blur"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-semibold">
                          {compound.name} ({compound.formula})
                        </CardTitle>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleFavorite(compound.id)}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                compound.isFavorite
                                  ? "fill-current text-red-500"
                                  : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(compound.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-sm">
                        {compound.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <Button
                        size="sm"
                        onClick={() => setSelectedCompound(compound)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedCompound && (
                <KeerthiDialog
                  compound={selectedCompound}
                  onClose={() => setSelectedCompound(null)}
                />
              )}

              {filteredCompounds.length === 0 && (
                <div className="text-center py-48">
                  <p className="text-muted-foreground">
                    {filter === "favorites"
                      ? "No favorite Compounds yet"
                      : "No Compounds yet"}
                  </p>
                </div>
              )}

              <div className="mt-8 mb-24 p-6 rounded-lg border bg-transparent backdrop-blur">
                <h3 className="text-lg font-semibold mb-2">Stats</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Total Compounds: {compounds.length}</p>
                  <p>
                    Favorites: {compounds.filter((i) => i.isFavorite).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </ScrollArea>
    </SidebarInset>
  );
}

function KeerthiDialog({
  compound,
  onClose,
}: {
  compound: Compound;
  onClose: () => void;
}) {
  return (
    <Keerthi open={!!compound} onOpenChange={onClose}>
      <KeerthiContent className="max-w-2xl">
        <KeerthiHeader>
          <KeerthiTitle>
            {compound.name} ({compound.formula})
          </KeerthiTitle>
          <KeerthiDescription>{compound.description}</KeerthiDescription>
        </KeerthiHeader>

        <div className="space-y-2 mt-4 text-sm">
          {compound.appearance && (
            <p>
              <strong>Appearance:</strong> {compound.appearance}
            </p>
          )}
          {compound.color && (
            <p>
              <strong>Color:</strong> {compound.color}
            </p>
          )}
          {compound.stateAtRoomTemp && (
            <p>
              <strong>State at Room Temperature:</strong>{" "}
              {compound.stateAtRoomTemp}
            </p>
          )}
          {compound.density && (
            <p>
              <strong>Density:</strong> {compound.density}
            </p>
          )}
          {compound.meltingPoint && (
            <p>
              <strong>Melting Point:</strong> {compound.meltingPoint}
            </p>
          )}
          {compound.boilingPoint && (
            <p>
              <strong>Boiling Point:</strong> {compound.boilingPoint}
            </p>
          )}
          {compound.reactivity && (
            <p>
              <strong>Reactivity:</strong> {compound.reactivity}
            </p>
          )}
          {compound.toxicity && (
            <p>
              <strong>Toxicity:</strong> {compound.toxicity}
            </p>
          )}
          {compound.hazards && (
            <p>
              <strong>Hazards:</strong> {compound.hazards}
            </p>
          )}
          {compound.flammability && (
            <p>
              <strong>Flammability:</strong> {compound.flammability}
            </p>
          )}
          {compound.uses && compound.uses.length > 0 && (
            <p>
              <strong>Uses:</strong> {compound.uses.join(", ")}
            </p>
          )}
          {compound.discoveredBy && (
            <p>
              <strong>Discovered By:</strong> {compound.discoveredBy}
            </p>
          )}
          {compound.discoveryYear && (
            <p>
              <strong>Discovery Year:</strong> {compound.discoveryYear}
            </p>
          )}
        </div>

        <Button className="mt-4 w-full" onClick={onClose}>
          Close
        </Button>
      </KeerthiContent>
    </Keerthi>
  );
}
