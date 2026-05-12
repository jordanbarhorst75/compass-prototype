import type { TaskSource } from "../domain/types";
import { sourceLabel, sourceLegendIcon } from "../lib/sourceIcons";

export function SourceBadge({ source }: { source: TaskSource }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 ring-1 ring-stone-200/80">
      <span aria-hidden>{sourceLegendIcon(source)}</span>
      {sourceLabel(source)}
    </span>
  );
}
