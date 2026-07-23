/**
 * Three.js MeshPhysicalMaterial presets — plain data only.
 * No React / R3F / three imports — consume from the R3F agent.
 *
 * Keys: color (hex), metalness, roughness, envMapIntensity
 * Optional physical props for MeshPhysicalMaterial consumers.
 */

export type MaterialPreset = {
  /** Hex color string, e.g. `#D4AF37` */
  color: string;
  metalness: number;
  roughness: number;
  envMapIntensity: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  /** Optional label for tooling / Storybook */
  label: string;
};

/** Notebook cover — warm, matte leather */
export const notebookLeather: MaterialPreset = {
  label: 'Notebook Leather',
  color: '#4A2309',
  metalness: 0.05,
  roughness: 0.88,
  envMapIntensity: 0.35,
  clearcoat: 0.18,
  clearcoatRoughness: 0.65,
};

/** Brass foil stamp / hardware accent */
export const brassFoil: MaterialPreset = {
  label: 'Brass Foil',
  color: '#D4AF37',
  metalness: 1,
  roughness: 0.22,
  envMapIntensity: 1.25,
  clearcoat: 0.75,
  clearcoatRoughness: 0.2,
};

/** Cream stationery paper stock */
export const paper: MaterialPreset = {
  label: 'Paper',
  color: '#FAF9F5',
  metalness: 0,
  roughness: 0.92,
  envMapIntensity: 0.15,
  clearcoat: 0.04,
  clearcoatRoughness: 0.9,
};

/** Glazed ceramic mug — soft cream body */
export const ceramicMug: MaterialPreset = {
  label: 'Ceramic Mug',
  color: '#F4F1EA',
  metalness: 0.02,
  roughness: 0.28,
  envMapIntensity: 0.55,
  clearcoat: 0.85,
  clearcoatRoughness: 0.12,
};

/** Brushed lamp metal / aluminum fixture */
export const lampMetal: MaterialPreset = {
  label: 'Lamp Metal',
  color: '#B3B3B3',
  metalness: 0.95,
  roughness: 0.28,
  envMapIntensity: 1.1,
  clearcoat: 0.45,
  clearcoatRoughness: 0.35,
};

/** Warm walnut desk surface */
export const woodDesk: MaterialPreset = {
  label: 'Wood Desk',
  color: '#694121',
  metalness: 0.08,
  roughness: 0.62,
  envMapIntensity: 0.4,
  clearcoat: 0.3,
  clearcoatRoughness: 0.45,
};

export const materialPresets = {
  notebookLeather,
  brassFoil,
  paper,
  ceramicMug,
  lampMetal,
  woodDesk,
} as const;

export type MaterialPresetKey = keyof typeof materialPresets;

/** Flat list for iteration / pickers */
export const materialPresetList: readonly MaterialPreset[] = [
  notebookLeather,
  brassFoil,
  paper,
  ceramicMug,
  lampMetal,
  woodDesk,
] as const;
