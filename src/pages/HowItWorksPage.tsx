import { useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, Sparkles, TrendingUp, Users, Video } from "lucide-react";
import { AchievementIcon } from "../components/AchievementIcon";
import { SEED_CATEGORIES } from "../data/competencies";
import { getAchievementDef } from "../data/achievements";
import { categoryTileClasses } from "../domain/competencyColors";
import { MILESTONE_XP, NEW_COMPETENCY_XP, RECURRING_XP } from "../domain/completion";
import { useCompass } from "../state/CompassProvider";
import { HOW_IT_WORKS_PATH, type HowItWorksLocationState } from "../lib/routes";

const SECTIONS = [
  { id: "your-xp", label: "Your XP" },
  { id: "competency-levels", label: "Competency Levels" },
  { id: "achievements", label: "Achievements" },
  { id: "class-connection", label: "CLASS Connection" },
] as const;

const LEVEL_LADDER: { level: number; xp: string; label: string }[] = [
  { level: 1, xp: "0–30 XP", label: "Getting Started" },
  { level: 2, xp: "31–75 XP", label: "Building Momentum" },
  { level: 3, xp: "76–150 XP", label: "Finding Your Rhythm" },
  { level: 4, xp: "151–250 XP", label: "In the Flow" },
  { level: 5, xp: "250+ XP", label: "Thriving" },
];

const DEMONSTRATION_LADDER: { name: string; detail: string; card: string; dot: string }[] = [
  { name: "Uncharted", detail: "Not yet demonstrated", card: "bg-stone-100 text-stone-800 ring-stone-200", dot: "bg-stone-400" },
  { name: "Aware", detail: "Demonstrated 1 time", card: "bg-sky-50 text-sky-950 ring-sky-200", dot: "bg-sky-500" },
  { name: "Developing", detail: "Demonstrated 3 times", card: "bg-violet-50 text-violet-950 ring-violet-200", dot: "bg-violet-500" },
  { name: "Practicing", detail: "Demonstrated 9 times", card: "bg-amber-50 text-amber-950 ring-amber-200", dot: "bg-amber-500" },
  { name: "Consistent", detail: "Demonstrated 27 times", card: "bg-emerald-50 text-emerald-950 ring-emerald-200", dot: "bg-emerald-500" },
  {
    name: "Mastery",
    detail: "Demonstrated 60 times with no gap longer than 30 days",
    card: "bg-gradient-to-br from-amber-100 to-amber-200/90 text-amber-950 ring-amber-400",
    dot: "bg-gradient-to-br from-amber-500 to-amber-700",
  },
];

function Callout({
  children,
  tone = "amber",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "amber" | "stone";
  className?: string;
}) {
  const ring = tone === "amber" ? "ring-amber-200/80 bg-amber-50/90" : "ring-stone-200 bg-white/90";
  return (
    <aside className={`rounded-2xl p-4 text-sm leading-relaxed text-stone-700 ring-1 ${ring} ${className}`}>
      {children}
    </aside>
  );
}

function AchievementPreviewCard({ id, variant = "default" }: { id: string; variant?: "default" | "collection" }) {
  const def = getAchievementDef(id);
  if (!def) return null;
  const shell =
    variant === "collection"
      ? "bg-gradient-to-b from-amber-50 to-white shadow-md ring-2 ring-amber-400"
      : "bg-white ring-1 ring-amber-200/80 shadow-sm";
  return (
    <div className={`flex flex-col rounded-2xl p-4 ${shell}`}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
        <AchievementIcon icon={def.icon} className="h-8 w-8" />
      </div>
      <p className="mt-3 text-center text-sm font-bold text-stone-900">{def.name}</p>
      <p className="mt-2 text-center text-xs leading-relaxed text-stone-600">{def.description}</p>
    </div>
  );
}

export function HowItWorksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { competencies } = useCompass();
  const from = (location.state as HowItWorksLocationState | null)?.from;

  const scrollTo = useCallback((id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goBack = () => {
    if (from && typeof from === "string" && from !== HOW_IT_WORKS_PATH) navigate(from);
    else navigate(-1);
  };

  const grouped = SEED_CATEGORIES.map((cat) => ({
    cat,
    items: competencies.filter((c) => c.categoryId === cat.id),
  }));

  const tier1Examples = ["inclusive_community_aware", "inclusive_community_practicing", "inclusive_community_mastery"] as const;
  const tier2Examples = ["connected", "deep_roots", "full_spectrum"] as const;
  const tier3Examples = ["bronze_lens", "curious", "showing_up"] as const;

  return (
    <div className="h-full min-h-0 scroll-smooth overflow-y-auto bg-[#f9f6f0] pb-28 text-stone-800">
      <div className="border-b border-amber-900/5 bg-[#f9f6f0]/95 px-4 pb-3 pt-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1 rounded-full py-1.5 text-sm font-semibold text-amber-900/90 transition hover:bg-amber-100/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <p className="mt-2 text-sm font-medium text-amber-900/70">A gentle guide</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">How your growth shows up in Compass</h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-stone-600">
          Compass celebrates what you are building—curiosity, practice, and care—without turning your journey into a judgment. Here is how the pieces fit together.
        </p>
      </div>

      <div className="sticky top-0 z-20 border-b border-amber-900/5 bg-[#f9f6f0]/95 px-2 py-2 backdrop-blur-md">
        <nav aria-label="On this page" className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className="shrink-0 whitespace-nowrap rounded-full border border-amber-900/10 bg-white/80 px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 sm:text-sm"
            >
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-prose space-y-16 px-4 py-10">
        {/* Section 1 */}
        <section id="section-your-xp" className="scroll-mt-32">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Your XP — Every step counts</h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-stone-600">
            <p>
              Every time you complete an activity on Compass — watching a video, uploading an Instant Insights clip, reading a reflection, finishing a task your coach assigned — you earn XP.
            </p>
            <p>
              XP is a simple running total of your engagement. It doesn&apos;t measure how good a teacher you are. It measures how much you&apos;re investing in your own growth.
            </p>
          </div>

          <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-amber-900/60">Activity XP</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-100 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">First time on a competency</p>
              <p className="mt-2 flex items-baseline gap-1.5 text-lg font-bold text-stone-900">
                <span aria-hidden>🪙</span>+{NEW_COMPETENCY_XP} XP
              </p>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">Complete any task the first time it earns a competency for you.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-100 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Returning to a competency</p>
              <p className="mt-2 flex items-baseline gap-1.5 text-lg font-bold text-stone-900">
                <span aria-hidden>🪙</span>+{RECURRING_XP} XP
              </p>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">Complete any task when you&apos;re already building that competency.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-100 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Engagement milestone</p>
              <p className="mt-2 flex items-baseline gap-1.5 text-lg font-bold text-stone-900">
                <span aria-hidden>🪙</span>+{MILESTONE_XP} XP
              </p>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">Extra recognition when you hit upload milestones along the way.</p>
            </div>
          </div>

          <h3 className="mt-10 text-sm font-bold uppercase tracking-wide text-amber-900/60">Educator level</h3>
          <p className="mt-2 text-sm text-stone-600">Your level moves with total XP — a staircase of small wins.</p>
          <ol className="relative mt-6 space-y-0 pl-0">
            {LEVEL_LADDER.map((row, i) => (
              <li key={row.level} className="relative flex gap-4 pb-6 last:pb-0">
                {i < LEVEL_LADDER.length - 1 && (
                  <span className="absolute left-[1.15rem] top-10 bottom-0 w-px bg-gradient-to-b from-amber-300/80 to-amber-100" aria-hidden />
                )}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-950 ring-2 ring-white shadow-sm">
                  {row.level}
                </div>
                <div className="min-w-0 flex-1 rounded-2xl bg-white/90 p-4 ring-1 ring-amber-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{row.xp}</p>
                  <p className="mt-1 text-base font-bold text-stone-900">{row.label}</p>
                </div>
              </li>
            ))}
          </ol>
          <Callout tone="amber">
            <p className="font-medium text-stone-800">
              Your Educator Level reflects your overall engagement across Compass. The higher your level, the more you&apos;ve invested in your own growth — and that investment shows up in your classroom.
            </p>
          </Callout>
        </section>

        {/* Section 2 */}
        <section id="section-competency-levels" className="scroll-mt-32">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Competency Levels — Growth you can see</h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-stone-600">
            <p>
              Compass tracks your growth across 10 educator competencies — specific, observable behaviors that reflect great teaching practice. Each one has its own progression, independent of the others. You might be deep into one competency while just beginning another. That&apos;s exactly how learning works.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {DEMONSTRATION_LADDER.map((row) => (
              <div key={row.name} className={`flex gap-3 rounded-2xl p-4 ring-1 ${row.card}`}>
                <div className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${row.dot}`} aria-hidden />
                <div>
                  <p className="text-base font-bold text-stone-900">{row.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <Callout tone="amber" className="mt-8">
            <p className="font-medium text-stone-800">
              Every time Compass identifies a competency in your Instant Insights video, you&apos;re logged an informal observation score, your coach notes it in a session, or you engage with a learning resource — that counts as a demonstration. Keep going.
            </p>
          </Callout>

          <div className="mt-10 rounded-2xl border border-dashed border-stone-300/80 bg-stone-100/40 p-4">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-stone-500">Illustrative preview</p>
            <div className="pointer-events-none mt-4 select-none opacity-[0.55] grayscale-[0.15]">
              <div className="space-y-6">
                {grouped.map(({ cat, items }) => (
                  <div key={cat.id}>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">{cat.label}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {items.map((c) => (
                        <div
                          key={c.id}
                          className={`rounded-xl px-2 py-3 text-center text-[10px] font-bold leading-tight ring-1 ${categoryTileClasses(c.color)}`}
                        >
                          {c.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-stone-600">
              <Link
                to="/profile"
                className="font-semibold text-amber-900 underline-offset-4 hover:underline"
              >
                See your competency map on your profile
              </Link>
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="section-achievements" className="scroll-mt-32">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Achievements — Milestones worth celebrating</h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-stone-600">
            <p>
              As you grow, Compass recognizes your progress with achievements. Some celebrate individual competency milestones. Some celebrate the bigger picture — the breadth and depth of your practice across all areas. A few are secret, revealed only when you earn them.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-900/60">Tier 1 — Competency milestones</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Earned each time a competency reaches a new level. You&apos;ll earn up to 50 of these as you progress through all 10 competencies.
              </p>
              <p className="mt-2 text-xs font-medium text-stone-500">Examples along Inclusive Community:</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {tier1Examples.map((id) => (
                  <AchievementPreviewCard key={id} id={id} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-900/60">Tier 2 — Collection achievements</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Earned when your growth spans multiple competencies. These are the big ones — they tell the story of who you&apos;re becoming as an educator.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {tier2Examples.map((id) => (
                  <AchievementPreviewCard key={id} id={id} variant="collection" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-900/60">Tier 3 — Engagement achievements</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Earned for showing up consistently. Every upload, every resource, every session — it adds up.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {tier3Examples.map((id) => (
                  <AchievementPreviewCard key={id} id={id} />
                ))}
              </div>
            </div>
          </div>

          <Callout tone="stone" className="mt-10">
            <p className="flex items-start gap-2 text-stone-800">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              <span>
                A few achievements are secret — you won&apos;t see them until you&apos;ve earned them. Keep going and find out what they are.
              </span>
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <div className="flex h-24 w-20 flex-col items-center justify-center rounded-2xl bg-stone-200/80 text-lg font-black text-stone-500 ring-1 ring-stone-300/80">
                ???
              </div>
              <div className="flex h-24 w-20 flex-col items-center justify-center rounded-2xl bg-stone-200/80 text-lg font-black text-stone-500 ring-1 ring-stone-300/80">
                ???
              </div>
            </div>
          </Callout>
        </section>

        {/* Section 4 — CLASS (careful wording) */}
        <section id="section-class-connection" className="scroll-mt-32 pb-8">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">The bigger picture — How this connects to CLASS</h2>

          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-stone-600">
            <p>
              CLASS observations have always been the gold standard for understanding what&apos;s happening in your classroom. A formal observation is still a snapshot — one moment in time.
            </p>
            <p>
              What happens between those snapshots is where growth actually lives. Every video you upload. Every strategy you try. Every conversation with your coach. Every resource you watch at 9pm because you&apos;re thinking about a child who needs something different.
            </p>
            <p>Compass is built to make that in-between growth visible.</p>
            <p>
              When you engage consistently — earning competencies, completing tasks, deepening your practice — you&apos;re doing the kind of work that often appears when your teaching is observed through CLASS later on. We&apos;re here to trace that journey so that when your next formal observation arrives, there is a record of what led up to it.
            </p>
          </div>

          <div className="mt-10 rounded-3xl bg-white/80 p-5 ring-1 ring-amber-100/80 shadow-sm">
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center text-center sm:max-w-[7rem]">
                <span className="rounded-full bg-stone-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Formal observation</span>
                <p className="mt-2 text-xs font-semibold text-stone-700">Where you started</p>
              </div>

              <div className="relative flex flex-1 flex-wrap items-center justify-center gap-4 py-4 sm:py-0">
                <span className="absolute left-[8%] right-[8%] top-1/2 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-stone-200 via-amber-100 to-amber-200 sm:block" aria-hidden />
                <div className="relative z-[1] flex flex-wrap items-center justify-center gap-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 ring-2 ring-white shadow-md" title="Video">
                    <Video className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-800 ring-2 ring-white shadow-md" title="Learning resource">
                    <BookOpen className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900 ring-2 ring-white shadow-md" title="Coaching">
                    <Users className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 ring-2 ring-white shadow-md" title="Practice">
                    <Sparkles className="h-6 w-6" aria-hidden />
                  </span>
                </div>
              </div>

              <div className="relative flex flex-col items-center text-center sm:max-w-[7rem]">
                <span className="relative rounded-full bg-gradient-to-r from-amber-600 to-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                  Formal observation
                  <TrendingUp className="absolute -right-5 -top-4 h-6 w-6 text-amber-500 sm:-right-6" aria-hidden />
                </span>
                <p className="mt-2 text-xs font-semibold text-stone-700">Where you&apos;re going</p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm italic text-stone-600">Your growth between observations is the story Compass tells.</p>
          </div>

          <Callout tone="amber" className="mt-10">
            <p className="text-[15px] leading-relaxed text-stone-800">
              Compass is a professional growth tool, not a judgment of your practice. Your competency levels and XP are for your own reflection and development — they are separate from what appears on a formal CLASS observation summary, and they are not shared with people who conduct those formal visits.
            </p>
          </Callout>

          <p className="mt-8 text-[15px] leading-relaxed text-stone-600">
            We believe that educators who invest in their own growth — who reflect, practice, and keep learning — become the teachers their students need. Compass is here to support that journey, every step of the way.
          </p>
        </section>
      </div>
    </div>
  );
}
