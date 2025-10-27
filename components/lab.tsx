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
import { ELEMENTS } from "@/lib/constants";

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
  const getElementById = (id: string) => ELEMENTS.find((el) => el.id === id);

  return (
    <Keerthi open={!!compound} onOpenChange={onClose}>
      <KeerthiContent className="max-w-3xl pb-12">
        <KeerthiHeader>
          <KeerthiTitle className="text-2xl font-bold">
            {compound?.name}
          </KeerthiTitle>
          <KeerthiDescription className="text-sm text-foreground/70">
            {compound?.formula}
          </KeerthiDescription>
        </KeerthiHeader>

        {compound && (
          <KeerthiBody className="overflow-y-auto">
            <div className="space-y-4">
              <p className="text-sm">{compound.description}</p>

              <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                <h3 className="font-semibold mb-3">Physical Properties</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {compound.molecularWeight && (
                    <div>
                      <span className="text-muted-foreground">
                        Molecular Weight:
                      </span>{" "}
                      {compound.molecularWeight}
                    </div>
                  )}
                  {compound.density && (
                    <div>
                      <span className="text-muted-foreground">Density:</span>{" "}
                      {compound.density}
                    </div>
                  )}
                  {compound.meltingPoint && (
                    <div>
                      <span className="text-muted-foreground">
                        Melting Point:
                      </span>{" "}
                      {compound.meltingPoint}
                    </div>
                  )}
                  {compound.boilingPoint && (
                    <div>
                      <span className="text-muted-foreground">
                        Boiling Point:
                      </span>{" "}
                      {compound.boilingPoint}
                    </div>
                  )}
                  {compound.stateAtRoomTemp && (
                    <div>
                      <span className="text-muted-foreground">State:</span>{" "}
                      {compound.stateAtRoomTemp}
                    </div>
                  )}
                  {compound.appearance && (
                    <div>
                      <span className="text-muted-foreground">Appearance:</span>{" "}
                      {compound.appearance}
                    </div>
                  )}
                  {compound.color && (
                    <div>
                      <span className="text-muted-foreground">Color:</span>{" "}
                      {compound.color}
                    </div>
                  )}
                  {compound.odor && (
                    <div>
                      <span className="text-muted-foreground">Odor:</span>{" "}
                      {compound.odor}
                    </div>
                  )}
                  {compound.solubility && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Solubility:</span>{" "}
                      {compound.solubility}
                    </div>
                  )}
                  {compound.pH && (
                    <div>
                      <span className="text-muted-foreground">pH:</span>{" "}
                      {compound.pH}
                    </div>
                  )}
                </div>
              </div>

              {/* Chemical Properties */}
              {(compound.reactivity ||
                compound.stability ||
                compound.toxicity ||
                compound.flammability) && (
                <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                  <h3 className="font-semibold mb-3">Chemical Properties</h3>
                  <div className="space-y-2 text-sm">
                    {compound.reactivity && (
                      <div>
                        <span className="text-muted-foreground">
                          Reactivity:
                        </span>{" "}
                        {compound.reactivity}
                      </div>
                    )}
                    {compound.stability && (
                      <div>
                        <span className="text-muted-foreground">
                          Stability:
                        </span>{" "}
                        {compound.stability}
                      </div>
                    )}
                    {compound.toxicity && (
                      <div>
                        <span className="text-muted-foreground">Toxicity:</span>{" "}
                        {compound.toxicity}
                      </div>
                    )}
                    {compound.flammability && (
                      <div>
                        <span className="text-muted-foreground">
                          Flammability:
                        </span>{" "}
                        {compound.flammability}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Safety Information */}
              {compound.hazards && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-destructive">
                    Safety Information
                  </h3>
                  <p className="text-sm">{compound.hazards}</p>
                </div>
              )}

              {/* Discovery Info */}
              {(compound.discoveredBy ||
                compound.discoveryYear) && (
                <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                  <h3 className="font-semibold mb-3">Discovery</h3>
                  <div className="space-y-2 text-sm">
                    {compound.discoveredBy && (
                      <div>
                        <span className="text-muted-foreground">
                          Discovered by:
                        </span>{" "}
                        {compound.discoveredBy}
                      </div>
                    )}
                    {compound.discoveryYear && (
                      <div>
                        <span className="text-muted-foreground">Year:</span>{" "}
                        {compound.discoveryYear}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category / Classification */}
              {compound.category && (
                <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                  <h3 className="font-semibold mb-3">Classification</h3>
                  <p className="text-sm">{compound.category}</p>
                </div>
              )}

              {/* Isomers */}
              {compound.isomers &&
                compound.isomers.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                    <h3 className="font-semibold mb-2">Possible Isomers</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Different structures with the same molecular formula:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {compound.isomers.map(
                        (isomer: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {isomer}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Uses */}
              {compound.uses && compound.uses.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                  <h3 className="font-semibold mb-2">Common Uses</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {compound.uses.map((use: string, i: number) => (
                      <li key={i}>{use}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Elements */}
              <div className="flex flex-wrap gap-2">
                {compound.elements.map((el) => {
                  const element = getElementById(el.id);
                  return element ? (
                    <Badge key={el.id} variant="outline">
                      <div
                        className={`w-4 h-4 rounded ${element.color} flex items-center justify-center font-bold text-white text-[10px] mr-1`}
                      >
                        {element.icon}
                      </div>
                      {element.name} × {el.count}
                    </Badge>
                  ) : null;
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="mt-4 w-full" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </KeerthiBody>
        )}
      </KeerthiContent>
    </Keerthi>
  );
}
