import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { ELEMENTS } from "@/lib/constants";

const ELEMENTS_MAP = Object.fromEntries(ELEMENTS.map((e) => [e.id, e.name]));

const CompoundSchema = z.object({
  formula: z.string(),
  name: z.string(),
  description: z.string(),
  molecularWeight: z.string(),
  stateAtRoomTemp: z.enum(["solid", "liquid", "gas"]),
  meltingPoint: z.string(),
  boilingPoint: z.string(),
  density: z.string(),
  solubility: z.string(),
  appearance: z.string(),
  color: z.string(),
  odor: z.string(),
  pH: z.string(),
  reactivity: z.string(),
  toxicity: z.string(),
  hazards: z.string(),
  stability: z.string(),
  flammability: z.string(),
  uses: z.array(z.string()).min(1),
  isomers: z.array(z.string()).optional(),
  discoveredBy: z.string(),
  discoveryYear: z.number(),
  category: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { elements } = await req.json();

    if (
      !elements ||
      !Array.isArray(elements) ||
      elements.length < 2 ||
      !elements.every(
        (el) => el.id && ELEMENTS_MAP[el.id] && typeof el.count === "number",
      )
    ) {
      return NextResponse.json(
        { error: "At least 2 valid elements with counts are required." },
        { status: 400 },
      );
    }

    const elementDetails = elements
      .map((el) => `${ELEMENTS_MAP[el.id]} (x${el.count})`)
      .join(", ");

    const prompt = `
You are a professional chemist and data scientist.
Ensure all fields match the schema and include at least one valid value in all of the schema.
Your task: determine if a **real, scientifically valid compound** can be formed using **only** these elements and exact counts:
${elementDetails}.

Rules:
- You must **strictly** use only the given element counts — no extra or fewer atoms are allowed.
- If the number of atoms doesn’t match a known stable compound in real-world chemistry, 
  you must output "keerthi" for all text fields, and for options that dont take a string value keep anything else..
- DO NOT guess or assume alternate atom counts.
- Example:
  - Input: Hydrogen (x2), Oxygen (x1) → Output: Water (H₂O)
  - Input: Hydrogen (x1), Oxygen (x2) → Output: "keerthi"
  - Input: Carbon (x1), Oxygen (x2) → Output: Carbon Dioxide (CO₂)


Schema to follow:
- formula (string)
- name (string)
- description (string)
- molecularWeight (string)
- stateAtRoomTemp (solid/liquid/gas)
- meltingPoint (string)
- boilingPoint (string)
- density (string)
- solubility (string)
- appearance (string)
- color (string)
- odor (string)
- pH (string)
- reactivity (string)
- toxicity (string)
- hazards (string)
- stability (string)
- flammability (string)
- uses (array of up to 3 strings)
- isomers (array of strings, if applicable)
- discoveredBy (string)
- discoveryYear (number)
- category (string)

You MUST fill **every single field**.
If the compound does **not** exist, respond with: "keerthi" for all the strings, and for options that dont take a string value keep anything else.
`;

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: CompoundSchema,
      prompt,
      temperature: 0.4,
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Error generating compound:", error);
    return NextResponse.json(
      {
        formula: "H2O",
        name: "Water",
        description: "A stable compound formed from hydrogen and oxygen.",
        molecularWeight: "18.015 g/mol",
        stateAtRoomTemp: "liquid",
        meltingPoint: "0°C",
        boilingPoint: "100°C",
        density: "1 g/cm³",
        solubility: "Miscible with most polar solvents",
        appearance: "Clear, colorless liquid",
        color: "Colorless",
        odor: "Odorless",
        pH: "7",
        reactivity: "Stable under normal conditions",
        toxicity: "Non-toxic",
        hazards: "None under normal conditions",
        stability: "Very stable",
        flammability: "Non-flammable",
        uses: ["Drinking", "Cleaning", "Solvent"],
        isomers: [],
        discoveredBy: "Cavendish & Lavoisier",
        discoveryYear: 1783,
        category: "oxide",
      },
      { status: 500 },
    );
  }
}
