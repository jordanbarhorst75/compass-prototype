import type { TaskSource } from "../domain/types";

const map: Record<
  TaskSource,
  { icon: string; label: string }
> = {
  system: { icon: "✨", label: "Suggested" },
  coach: { icon: "💬", label: "From your coach" },
  admin: { icon: "🎓", label: "From your program" },
  self: { icon: "👤", label: "Your pick" },
};

export function sourceLegendIcon(source: TaskSource): string {
  return map[source].icon;
}

export function sourceLabel(source: TaskSource): string {
  return map[source].label;
}
