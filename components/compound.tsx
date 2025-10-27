"use client";

import { useState } from "react";
import {
  Atom,
  Beaker,
  X,
  Search,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconBook } from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Keerthi,
  KeerthiTrigger,
  KeerthiContent,
  KeerthiDescription,
  KeerthiHeader,
  KeerthiTitle,
  KeerthiBody,
} from "@/components/ui/keerthi";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { ELEMENTS } from "@/lib/constants";
import { Compound } from "@/types";
import { generateCompound, saveCompound } from "@/lib/craft";

export function CompoundPage() {
  const [droppedElements, setDroppedElements] = useState<
    { id: string; count: number }[]
  >([]);
  const { toggleSidebar } = useSidebar();
  const [isBrewing, setIsBrewing] = useState(false);
  const [generatedCompound, setGeneratedCompound] = useState<Compound | null>(
    null
  );
  const [dragOver, setDragOver] = useState(false);
  const [showAllElements, setShowAllElements] = useState(false);
  const [showCompoundKeerthi, setShowCompoundKeerthi] = useState(false);
  const [filteredElements, setFilteredElements] = useState(ELEMENTS);

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.setData("elementId", elementId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const elementId = e.dataTransfer.getData("elementId");
    if (elementId) {
      const existing = droppedElements.find((el) => el.id === elementId);
      if (existing) {
        setDroppedElements(
          droppedElements.map((el) =>
            el.id === elementId ? { ...el, count: el.count + 1 } : el
          )
        );
      } else {
        setDroppedElements([...droppedElements, { id: elementId, count: 1 }]);
      }
      setGeneratedCompound(null);
    }
  };

  const updateElementCount = (elementId: string, delta: number) => {
    setDroppedElements(
      droppedElements
        .map((el) => {
          if (el.id === elementId) {
            const newCount = Math.max(1, el.count + delta);
            return { ...el, count: newCount };
          }
          return el;
        })
        .filter((el) => el.count > 0)
    );
    setGeneratedCompound(null);
  };

  const removeElement = (elementId: string) => {
    setDroppedElements(droppedElements.filter((el) => el.id !== elementId));
    setGeneratedCompound(null);
  };

  const brewCompound = async () => {
    if (droppedElements.length < 2) {
      return;
    }

    setIsBrewing(true);

    try {
      const compound = await generateCompound(
        droppedElements.map((el) => ({ id: el.id, count: el.count }))
      );
      setGeneratedCompound(compound);
      setShowCompoundKeerthi(true);
    } catch (error) {
      console.error("Error brewing compound:", error);
    } finally {
      setIsBrewing(false);
    }
  };

  const handleSurpriseBrew = async () => {
    const randomCount = Math.floor(Math.random() * 2) + 2;
    const shuffled = [...ELEMENTS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, randomCount).map((el) => ({
      id: el.id,
      count: Math.floor(Math.random() * 3) + 1,
    }));
    setDroppedElements(selected);
    setGeneratedCompound(null);

    setTimeout(async () => {
      setIsBrewing(true);
      try {
        const compound = await generateCompound(
          selected.map((el) => ({ id: el.id, count: el.count }))
        );
        setGeneratedCompound(compound);
        setShowCompoundKeerthi(true);
      } catch (error) {
        console.error("Error brewing surprise compound:", error);
      } finally {
        setIsBrewing(false);
      }
    }, 500);
  };

  const handleSaveCompound = () => {
    if (generatedCompound) {
      saveCompound(generatedCompound);
      setShowCompoundKeerthi(false);
      setGeneratedCompound(null);
      setDroppedElements([]);
    }
  };

  const getElementById = (id: string) => ELEMENTS.find((el) => el.id === id);

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="floating"
        className="inset-y-11 h-[calc(100vh-2.75rem)] bg-transparent block"
      >
        <SidebarHeader className="pb-4">
          <SidebarMenu>
            <SidebarMenuItem className="block xl:hidden">
              <SidebarMenuButton
                asChild
                tooltip="Lab"
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <Link href="/lab">
                  <IconBook className="size-5!" />
                  <span className="text-base font-semibold">Lab</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Search"
                onClick={toggleSidebar}
                className="data-[slot=sidebar-menu-button]:p-1.5! hidden group-data-[collapsible=icon]:flex"
              >
                <div>
                  <Search className="size-5!" />
                  <span className="text-base font-semibold">Elements</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="sticky top-5 z-10 mx-3 mt-2 group-data-[collapsible=icon]:hidden">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search elements..."
                    className="w-full rounded-xl border bg-background/70 backdrop-blur-md px-4 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-muted-foreground/60 transition-all duration-300"
                    onChange={(e) => {
                      const query = e.target.value.toLowerCase();
                      setFilteredElements(
                        ELEMENTS.filter(
                          (element) =>
                            element.name.toLowerCase().includes(query) ||
                            element.id.toLowerCase().includes(query)
                        )
                      );
                    }}
                  />
                  <Atom className="absolute right-3 top-2.5 size-4 text-muted-foreground/70" />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredElements.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>No elements found</p>
                  </div>
                ) : (
                  filteredElements.map((element) => (
                    <SidebarMenuItem key={element.id}>
                      <SidebarMenuButton
                        tooltip={element.name}
                        className="cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-95 font-medium text-sm hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                        draggable
                        onDragStart={(e) => handleDragStart(e, element.id)}
                        onClick={() => {
                          const existing = droppedElements.find(
                            (el) => el.id === element.id
                          );
                          if (existing) {
                            setDroppedElements(
                              droppedElements.map((el) =>
                                el.id === element.id
                                  ? { ...el, count: el.count + 1 }
                                  : el
                              )
                            );
                          } else {
                            setDroppedElements([
                              ...droppedElements,
                              { id: element.id, count: 1 },
                            ]);
                          }
                          setGeneratedCompound(null);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-md group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6 ${element.color} flex items-center justify-center font-bold text-white text-xs`}
                          >
                            {element.icon}
                          </div>
                          <span className="truncate">{element.name}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="m-2 rounded-xl border bg-transparent shadow-md flex flex-col h-[calc(100vh-3.75rem)]">
        <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-transparent backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) rounded-t-xl">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-base font-medium">Chemixy</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 overflow-x-hidden md:overflow-visible">
          <div className="overflow-hidden relative">
            <div className="flex h-[calc(100vh-7rem)] gap-0 overflow-hidden">
              <div className="flex-1 flex flex-col items-center justify-center translate-y-[-19%] overflow-y-none">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full max-w-3xl mx-auto transition-all duration-300 ${
                    dragOver ? "scale-105" : "scale-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 800 900"
                    className={`w-full h-auto drop-shadow-2xl ${
                      isBrewing ? "animate-pulse" : ""
                    }`}
                  >
                    <defs>
                      <radialGradient id="glowGradient" cx="50%" cy="50%">
                        <stop
                          offset="0%"
                          stopColor="#a855f7"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#ec4899"
                          stopOpacity="0"
                        />
                      </radialGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Shadow */}
                    <ellipse
                      cx="400"
                      cy="850"
                      rx="280"
                      ry="30"
                      fill="#000"
                      opacity="0.3"
                    />

                    {/* Beaker Body */}
                    <path
                      d="M 250 350 L 250 700 Q 250 740, 280 760 L 520 760 Q 550 740, 550 700 L 550 350 Z"
                      fill="url(#glassGradient)"
                      stroke="#94a3b8"
                      strokeWidth="4"
                    />

                    {droppedElements.length > 0 && (
                      <>
                        <path
                          d="M 255 500 L 255 690 Q 255 730, 282 748 L 518 748 Q 545 730, 545 690 L 545 500 Z"
                          fill="url(#liquidGradient)"
                          opacity={isBrewing ? "1" : "0.85"}
                        >
                          {isBrewing && (
                            <animate
                              attributeName="opacity"
                              values="0.85;1;0.85"
                              dur="1s"
                              repeatCount="infinite"
                            />
                          )}
                        </path>
                        <ellipse
                          cx="400"
                          cy="650"
                          rx="150"
                          ry="80"
                          fill="url(#glowGradient)"
                          opacity={isBrewing ? "0.6" : "0.4"}
                        />
                      </>
                    )}

                    {isBrewing && (
                      <>
                        <circle
                          cx="350"
                          cy="620"
                          r="12"
                          fill="#fbbf24"
                          opacity="0.9"
                        >
                          <animate
                            attributeName="cy"
                            values="620;520;420"
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.9;0.5;0"
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="r"
                            values="12;8;4"
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx="400"
                          cy="640"
                          r="10"
                          fill="#f59e0b"
                          opacity="0.9"
                        >
                          <animate
                            attributeName="cy"
                            values="640;540;440"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.9;0.5;0"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="r"
                            values="10;7;3"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx="450"
                          cy="630"
                          r="11"
                          fill="#fbbf24"
                          opacity="0.9"
                        >
                          <animate
                            attributeName="cy"
                            values="630;530;430"
                            dur="2.2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.9;0.5;0"
                            dur="2.2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="r"
                            values="11;7;3"
                            dur="2.2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}

                    {/* Rim */}
                    <ellipse
                      cx="400"
                      cy="350"
                      rx="155"
                      ry="30"
                      fill="#cbd5e1"
                      stroke="#94a3b8"
                      strokeWidth="3"
                    />
                    <ellipse
                      cx="400"
                      cy="345"
                      rx="150"
                      ry="28"
                      fill="#1a202c"
                      stroke="#64748b"
                      strokeWidth="2"
                    />

                    {/* Measurement lines */}
                    <line
                      x1="550"
                      y1="450"
                      x2="530"
                      y2="450"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                    <line
                      x1="550"
                      y1="550"
                      x2="530"
                      y2="550"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                    <line
                      x1="550"
                      y1="650"
                      x2="530"
                      y2="650"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />

                    {/* Base */}
                    <ellipse
                      cx="400"
                      cy="760"
                      rx="140"
                      ry="20"
                      fill="#64748b"
                      opacity="0.6"
                    />
                  </svg>

                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ top: "20%" }}
                  >
                    {droppedElements.length === 0 && !isBrewing && (
                      <div className="text-center bg-background/2 backdrop-blur-xl md:p-8 p-4 rounded-2xl shadow-xl  dark:text-foreground">
                        <Atom className="md:w-16 md:h-16 h-8 w-8 mx-auto mb-4 opacity-50" />
                        <p className="md:text-lg text-xs font-medium">
                          Drop elements into the beaker
                        </p>
                      </div>
                    )}

                    {droppedElements.length > 0 && !isBrewing && (
                      <div className="flex flex-col items-center gap-3 p-6 pointer-events-auto">
                        <div className="flex flex-col gap-2 text-sm">
                          {droppedElements.slice(0, 4).map((el) => {
                            const element = getElementById(el.id);
                            return element ? (
                              <div
                                key={el.id}
                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg bg-background border`}
                              >
                                <button
                                  onClick={() => updateElementCount(el.id, -1)}
                                  className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <div
                                  className={`w-6 h-6 rounded ${element.color} flex items-center justify-center font-bold text-white text-xs`}
                                >
                                  {element.icon}
                                </div>
                                <span className="font-semibold">
                                  {el.count}
                                </span>
                                <button
                                  onClick={() => updateElementCount(el.id, 1)}
                                  className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    removeElement(el.id);
                                    if (droppedElements.length === 1)
                                      setShowAllElements(false);
                                  }}
                                  className="w-5 h-5 rounded bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center ml-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>

                        {droppedElements.length > 4 && (
                          <Keerthi
                            open={showAllElements}
                            onOpenChange={setShowAllElements}
                          >
                            <KeerthiTrigger asChild>
                              <Button
                                variant="secondary"
                                size="lg"
                                className="mt-2 font-medium"
                              >
                                View All Elements
                              </Button>
                            </KeerthiTrigger>

                            <KeerthiContent className="pb-12">
                              <KeerthiHeader>
                                <KeerthiTitle>All Elements</KeerthiTitle>
                                <KeerthiDescription>
                                  Adjust quantities or remove elements
                                </KeerthiDescription>
                              </KeerthiHeader>
                              <KeerthiBody>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {droppedElements.map((el) => {
                                    const element = getElementById(el.id);
                                    return element ? (
                                      <div
                                        key={el.id}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg bg-background border`}
                                      >
                                        <button
                                          onClick={() =>
                                            updateElementCount(el.id, -1)
                                          }
                                          className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <div
                                          className={`w-6 h-6 rounded ${element.color} flex items-center justify-center font-bold text-white text-xs`}
                                        >
                                          {element.icon}
                                        </div>
                                        <span className="font-semibold">
                                          {el.count}
                                        </span>
                                        <button
                                          onClick={() =>
                                            updateElementCount(el.id, 1)
                                          }
                                          className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            removeElement(el.id);
                                            if (droppedElements.length === 1)
                                              setShowAllElements(false);
                                          }}
                                          className="w-5 h-5 rounded bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center ml-1"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              </KeerthiBody>
                            </KeerthiContent>
                          </Keerthi>
                        )}
                      </div>
                    )}

                    {isBrewing && (
                      <div className="text-center bg-transparent backdrop-blur-sm p-10 rounded-2xl shadow-2xl">
                        <Atom className="w-20 h-20 mx-auto mb-4 animate-spin text-violet-500" />
                        <p className="text-2xl font-semibold">
                          Creating compound...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={brewCompound}
                    disabled={droppedElements.length < 2 || isBrewing}
                    size="lg"
                    className="font-semibold px-8"
                  >
                    <Beaker className="w-5 h-5 mr-2" />
                    Create Compound
                  </Button>

                  <Button
                    onClick={handleSurpriseBrew}
                    disabled={isBrewing}
                    size="lg"
                    variant="outline"
                    className="font-semibold px-8"
                  >
                    <Atom className="w-5 h-5 mr-2" />
                    Random Mix
                  </Button>
                </div>

                {generatedCompound?.name === "keerthi" ? (
                  <Keerthi
                    open={showCompoundKeerthi}
                    onOpenChange={setShowCompoundKeerthi}
                  >
                    <KeerthiContent className="border border-zinc-700">
                      <KeerthiHeader>
                        <KeerthiTitle className="text-red-400 flex items-center gap-2">
                          ⚠️ Experiment Failed
                        </KeerthiTitle>
                        <KeerthiDescription className="">
                          A proper compound couldn’t be formed with the elements
                          you chose.
                        </KeerthiDescription>
                      </KeerthiHeader>
                      <Button
                        onClick={() => {
                          setShowCompoundKeerthi(false);
                          setGeneratedCompound(null);
                          setDroppedElements([]);
                        }}
                        variant="outline"
                      >
                        Discard
                      </Button>
                    </KeerthiContent>
                  </Keerthi>
                ) : (
                  <Keerthi
                    open={showCompoundKeerthi}
                    onOpenChange={setShowCompoundKeerthi}
                  >
                    <KeerthiContent className="max-w-3xl pb-12">
                      <KeerthiHeader>
                        <KeerthiTitle className="text-2xl font-bold">
                          {generatedCompound?.name}
                        </KeerthiTitle>
                        <KeerthiDescription className="text-sm text-foreground/70">
                          {generatedCompound?.formula}
                        </KeerthiDescription>
                      </KeerthiHeader>

                      {generatedCompound && (
                        <KeerthiBody className="overflow-y-auto">
                          <div className="space-y-4">
                            <p className="text-sm">
                              {generatedCompound.description}
                            </p>

                            <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                              <h3 className="font-semibold mb-3">
                                Physical Properties
                              </h3>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {generatedCompound.molecularWeight && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Molecular Weight:
                                    </span>{" "}
                                    {generatedCompound.molecularWeight}
                                  </div>
                                )}
                                {generatedCompound.density && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Density:
                                    </span>{" "}
                                    {generatedCompound.density}
                                  </div>
                                )}
                                {generatedCompound.meltingPoint && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Melting Point:
                                    </span>{" "}
                                    {generatedCompound.meltingPoint}
                                  </div>
                                )}
                                {generatedCompound.boilingPoint && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Boiling Point:
                                    </span>{" "}
                                    {generatedCompound.boilingPoint}
                                  </div>
                                )}
                                {generatedCompound.stateAtRoomTemp && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      State:
                                    </span>{" "}
                                    {generatedCompound.stateAtRoomTemp}
                                  </div>
                                )}
                                {generatedCompound.appearance && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Appearance:
                                    </span>{" "}
                                    {generatedCompound.appearance}
                                  </div>
                                )}
                                {generatedCompound.color && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Color:
                                    </span>{" "}
                                    {generatedCompound.color}
                                  </div>
                                )}
                                {generatedCompound.odor && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Odor:
                                    </span>{" "}
                                    {generatedCompound.odor}
                                  </div>
                                )}
                                {generatedCompound.solubility && (
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">
                                      Solubility:
                                    </span>{" "}
                                    {generatedCompound.solubility}
                                  </div>
                                )}
                                {generatedCompound.pH && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      pH:
                                    </span>{" "}
                                    {generatedCompound.pH}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Chemical Properties */}
                            {(generatedCompound.reactivity ||
                              generatedCompound.stability ||
                              generatedCompound.toxicity ||
                              generatedCompound.flammability) && (
                              <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                                <h3 className="font-semibold mb-3">
                                  Chemical Properties
                                </h3>
                                <div className="space-y-2 text-sm">
                                  {generatedCompound.reactivity && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Reactivity:
                                      </span>{" "}
                                      {generatedCompound.reactivity}
                                    </div>
                                  )}
                                  {generatedCompound.stability && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Stability:
                                      </span>{" "}
                                      {generatedCompound.stability}
                                    </div>
                                  )}
                                  {generatedCompound.toxicity && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Toxicity:
                                      </span>{" "}
                                      {generatedCompound.toxicity}
                                    </div>
                                  )}
                                  {generatedCompound.flammability && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Flammability:
                                      </span>{" "}
                                      {generatedCompound.flammability}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Safety Information */}
                            {generatedCompound.hazards && (
                              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-2 text-destructive">
                                  Safety Information
                                </h3>
                                <p className="text-sm">
                                  {generatedCompound.hazards}
                                </p>
                              </div>
                            )}

                            {/* Discovery Info */}
                            {(generatedCompound.discoveredBy ||
                              generatedCompound.discoveryYear) && (
                              <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                                <h3 className="font-semibold mb-3">
                                  Discovery
                                </h3>
                                <div className="space-y-2 text-sm">
                                  {generatedCompound.discoveredBy && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Discovered by:
                                      </span>{" "}
                                      {generatedCompound.discoveredBy}
                                    </div>
                                  )}
                                  {generatedCompound.discoveryYear && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Year:
                                      </span>{" "}
                                      {generatedCompound.discoveryYear}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Category / Classification */}
                            {generatedCompound.category && (
                              <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                                <h3 className="font-semibold mb-3">
                                  Classification
                                </h3>
                                <p className="text-sm">
                                  {generatedCompound.category}
                                </p>
                              </div>
                            )}

                            {/* Isomers */}
                            {generatedCompound.isomers &&
                              generatedCompound.isomers.length > 0 && (
                                <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                                  <h3 className="font-semibold mb-2">
                                    Possible Isomers
                                  </h3>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Different structures with the same molecular
                                    formula:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {generatedCompound.isomers.map(
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
                            {generatedCompound.uses &&
                              generatedCompound.uses.length > 0 && (
                                <div className="bg-muted/30 rounded-lg p-4 border dark:border-none">
                                  <h3 className="font-semibold mb-2">
                                    Common Uses
                                  </h3>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    {generatedCompound.uses.map(
                                      (use: string, i: number) => (
                                        <li key={i}>{use}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Elements */}
                            <div className="flex flex-wrap gap-2">
                              {generatedCompound.elements.map((el) => {
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

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleSaveCompound}
                                className="font-semibold"
                                variant="default"
                              >
                                Add to Lab
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowCompoundKeerthi(false);
                                  setGeneratedCompound(null);
                                  setDroppedElements([]);
                                }}
                                variant="outline"
                              >
                                Discard
                              </Button>
                            </div>
                          </div>
                        </KeerthiBody>
                      )}
                    </KeerthiContent>
                  </Keerthi>
                )}
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
