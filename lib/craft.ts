import { Compound } from "@/types";

export async function generateCompound(
  elements: { id: string; count: number }[]
): Promise<Compound> {
  try {
    const response = await fetch("/api/compound", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ elements }),
    });

    if (!response.ok) throw new Error("Failed to generate compound");

    const data = await response.json();
    console.log(data);

    return {
      id: `compound-${Date.now()}-${Math.random()}`,
      formula: data.formula,
      name: data.name,
      description: data.description,
      elements,
      timestamp: Date.now(),

      molecularWeight: data.molecularWeight,
      stateAtRoomTemp: data.stateAtRoomTemp,
      meltingPoint: data.meltingPoint,
      boilingPoint: data.boilingPoint,
      density: data.density,
      solubility: data.solubility,
      appearance: data.appearance,
      color: data.color,
      odor: data.odor,
      pH: data.pH,

      reactivity: data.reactivity,
      toxicity: data.toxicity,
      hazards: data.hazards,
      stability: data.stability,
      flammability: data.flammability,

      uses: data.uses,
      isomers: data.isomers,
      discoveredBy: data.discoveredBy,
      discoveryYear: data.discoveryYear,
      category: data.category,
    };
  } catch (error) {
    console.error("Error generating compound:", error);
    return {
      id: `compound-${Date.now()}-${Math.random()}`,
      formula: "null",
      name: "keerthi",
      description: "null",
      elements,
      timestamp: Date.now(),

      molecularWeight: "null",
      stateAtRoomTemp: "solid",
      meltingPoint: "null",
      boilingPoint: "null",
      density: "null",
      solubility: "null",
      appearance: "null",
      color: "null",
      odor: "null",
      pH: "null",
      reactivity: "null",
      toxicity: "null",
      hazards: "null",
      stability: "null",
      flammability: "null",
      uses: ["null", "null", "null"],
      isomers: [],
      discoveredBy: "null",
      discoveryYear: 2008,
      category: "null",
    };
  }
}
