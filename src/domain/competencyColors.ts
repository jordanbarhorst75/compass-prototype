/** Category accent for competency map (4 bands). */
const CATEGORY_STYLES: Record<string, string> = {
  connect: "bg-sky-100 text-sky-950 ring-sky-300",
  engage: "bg-violet-100 text-violet-950 ring-violet-300",
  inspire: "bg-amber-100 text-amber-950 ring-amber-300",
  whole: "bg-emerald-100 text-emerald-950 ring-emerald-300",
};

export function categoryTileClasses(colorToken: string): string {
  return CATEGORY_STYLES[colorToken] ?? "bg-stone-100 text-stone-800 ring-stone-200";
}

const CATEGORY_DOT: Record<string, string> = {
  connect: "bg-sky-500",
  engage: "bg-violet-500",
  inspire: "bg-amber-500",
  whole: "bg-emerald-500",
};

export function categoryDotClass(colorToken: string): string {
  return CATEGORY_DOT[colorToken] ?? "bg-stone-400";
}

/** Stable palette (~16) — map competency id to index for prototype */
const PALETTE = [
  "bg-rose-100 text-rose-900 ring-rose-200",
  "bg-amber-100 text-amber-900 ring-amber-200",
  "bg-emerald-100 text-emerald-900 ring-emerald-200",
  "bg-sky-100 text-sky-900 ring-sky-200",
  "bg-violet-100 text-violet-900 ring-violet-200",
  "bg-orange-100 text-orange-900 ring-orange-200",
  "bg-teal-100 text-teal-900 ring-teal-200",
  "bg-indigo-100 text-indigo-900 ring-indigo-200",
  "bg-fuchsia-100 text-fuchsia-900 ring-fuchsia-200",
  "bg-lime-100 text-lime-900 ring-lime-200",
  "bg-cyan-100 text-cyan-900 ring-cyan-200",
  "bg-pink-100 text-pink-900 ring-pink-200",
  "bg-yellow-100 text-yellow-900 ring-yellow-200",
  "bg-blue-100 text-blue-900 ring-blue-200",
  "bg-green-100 text-green-900 ring-green-200",
  "bg-purple-100 text-purple-900 ring-purple-200",
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function competencyPillClasses(competencyIdOrColor: string): string {
  if (CATEGORY_STYLES[competencyIdOrColor]) return CATEGORY_STYLES[competencyIdOrColor]!;
  return PALETTE[hashId(competencyIdOrColor) % PALETTE.length] ?? PALETTE[0]!;
}

export function competencyDotColor(competencyId: string): string {
  const colors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-violet-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-fuchsia-500",
    "bg-lime-600",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
  ];
  return colors[hashId(competencyId) % colors.length] ?? "bg-stone-400";
}
