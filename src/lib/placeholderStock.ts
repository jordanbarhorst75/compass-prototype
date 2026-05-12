/**
 * Task card hero JPEGs in `/public/placeholders/` — preschool / early-childhood / pre-K
 * learning environments (classroom corners, play areas, materials, small-group moments).
 * Sourced from Unsplash under the Unsplash License (https://unsplash.com/license); cropped
 * to 800×450 for 16:9 cards. Add or remove entries here when files in that folder change.
 */
export const PLACEHOLDER_STOCK_FILENAMES = [
  "bbc-creative-1w20Cysy1cg-unsplash.jpg",
  "catherine-breslin-Fs70sYdZAVU-unsplash.jpg",
  "cdc-gsRi9cWCIB0-unsplash (2).jpg",
  "compagnons-TJxotQTUr8o-unsplash.jpg",
  "gautam-arora-OVDtgUhUPBY-unsplash.jpg",
  "la-rel-easter-KuCGlBXjH_o-unsplash.jpg",
  "lucas-alexander-sJuDgtkUyYs-unsplash.jpg",
  "tanaphong-toochinda-GagC07wVvck-unsplash.jpg",
] as const;

/** Deterministic “random” pick so the same salt always maps to the same image (stable demos). */
export function stockPlaceholderUrl(salt: number): string {
  const files = PLACEHOLDER_STOCK_FILENAMES as readonly string[];
  const name = files[Math.abs(salt) % files.length]!;
  return `/placeholders/${encodeURIComponent(name)}`;
}
