import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardCheck,
  Compass,
  Crown,
  Flame,
  Medal,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  Video,
} from "lucide-react";
import type { AchievementIconKey } from "../data/achievements";

const MAP: Record<AchievementIconKey, LucideIcon> = {
  crown: Crown,
  star: Star,
  trophy: Trophy,
  medal: Medal,
  spark: Sparkles,
  video: Video,
  library: BookOpen,
  flame: Flame,
  shield: Shield,
  rotate: RotateCcw,
  userCheck: UserCheck,
  clipboard: ClipboardCheck,
  compass: Compass,
};

export function AchievementIcon({
  icon,
  className,
  strokeWidth = 2,
}: {
  icon: AchievementIconKey;
  className?: string;
  strokeWidth?: number;
}) {
  const I = MAP[icon] ?? Star;
  return <I className={className} strokeWidth={strokeWidth} aria-hidden />;
}
