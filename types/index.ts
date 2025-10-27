export interface Element {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Compound {
  id: string;
  formula: string;
  name: string;
  description: string;
  elements: { id: string; count: number }[];
  timestamp: number;

  molecularWeight?: string;
  stateAtRoomTemp?: "solid" | "liquid" | "gas";
  meltingPoint?: string;
  boilingPoint?: string;
  density?: string;
  solubility?: string;
  appearance?: string;
  color?: string;
  odor?: string;
  pH?: string;

  reactivity?: string;
  toxicity?: string;
  hazards?: string;
  stability?: string;
  flammability?: string;

  uses?: string[];
  isomers?: string[];
  discoveredBy?: string;
  discoveryYear?: number;
  category?: string;

  isFavorite?: string;
}
