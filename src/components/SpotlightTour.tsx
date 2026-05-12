import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { LearningBucket } from "../domain/types";
import type { GuideTourId } from "../domain/guideTour";
import { useCompass } from "../state/CompassProvider";

export type SpotlightTourStep = {
  title: string;
  body: string;
  emoji: string;
  bucket?: LearningBucket;
  targetSelector?: string;
};

const PAD = 10;
const MAX_TOOLTIP_W = 380;

type SpotlightTourProps = {
  tourId: GuideTourId;
  rootRef: RefObject<HTMLElement | null>;
  steps: readonly SpotlightTourStep[];
  /** When step 0 has no `targetSelector` or `bucket`, spotlight this selector inside `rootRef`. */
  initialTargetSelector?: string;
  /** Longer tooltip body from this step index (matches board tour UX). */
  longBodyFromStep?: number;
  /** Primary button on the last step (default: "Done"). */
  lastStepPrimaryLabel?: string;
  /** Notify parent so it can switch tabs / layout before measuring (e.g. Profile). */
  onStepChange?: (step: number) => void;
};

export function SpotlightTour({
  tourId,
  rootRef,
  steps,
  initialTargetSelector,
  longBodyFromStep = 5,
  lastStepPrimaryLabel = "Done",
  onStepChange,
}: SpotlightTourProps) {
  const { activeTour, endGuideTour, finishOnboarding, skipOnboarding, onboardingComplete } = useCompass();
  const isActive = activeTour === tourId;

  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isActive) setStep(0);
  }, [isActive]);

  const measure = useCallback(() => {
    if (!isActive) return;
    const root = rootRef.current;
    if (!root) {
      setRect(null);
      return;
    }
    const frame = steps[step];
    if (!frame) {
      setRect(null);
      return;
    }
    let el: Element | null = null;
    if (frame.targetSelector) {
      el = root.querySelector(frame.targetSelector);
    } else if (step === 0 && initialTargetSelector) {
      el = root.querySelector(initialTargetSelector);
    } else if (frame.bucket) {
      el = root.querySelector(`[data-tour-column="${frame.bucket}"]`);
    }
    const html = el instanceof HTMLElement ? el : null;
    setRect(html?.getBoundingClientRect() ?? null);
  }, [isActive, step, rootRef, steps, initialTargetSelector]);

  useEffect(() => {
    if (!isActive) return;
    onStepChange?.(step);
    const t = window.setTimeout(() => {
      measure();
    }, 0);
    return () => clearTimeout(t);
  }, [isActive, step, onStepChange, measure]);

  useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const raf = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure, rootRef]);

  useEffect(() => {
    if (!isActive) return;
    const frame = steps[step];
    if (!frame) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let el: Element | null = null;
    if (frame.targetSelector) {
      el = rootRef.current?.querySelector(frame.targetSelector) ?? null;
    } else if (step === 0 && initialTargetSelector) {
      el = rootRef.current?.querySelector(initialTargetSelector) ?? null;
    } else if (frame.bucket) {
      el = rootRef.current?.querySelector(`[data-tour-column="${frame.bucket}"]`) ?? null;
    }
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
  }, [isActive, step, rootRef, steps, initialTargetSelector]);

  useEffect(() => {
    if (!isActive) return;
    primaryRef.current?.focus();
  }, [isActive, step]);

  const dismissTour = useCallback(() => {
    if (tourId === "board" && !onboardingComplete) {
      skipOnboarding();
    } else {
      endGuideTour();
    }
  }, [tourId, onboardingComplete, skipOnboarding, endGuideTour]);

  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, dismissTour]);

  if (!isActive) return null;

  const frame = steps[step]!;
  const isLast = step === steps.length - 1;
  const titleId = `${tourId}-tour-title`;

  const goNext = () => {
    if (isLast) {
      if (tourId === "board" && !onboardingComplete) {
        finishOnboarding();
      } else {
        endGuideTour();
      }
    } else {
      setStep((i) => i + 1);
    }
  };

  const primaryLabel = isLast
    ? tourId === "board" && !onboardingComplete
      ? "Go to my board"
      : lastStepPrimaryLabel
    : "Next";

  const tooltipStyle = (): CSSProperties => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tw = Math.min(MAX_TOOLTIP_W, vw - 32);
    const longBody = step >= longBodyFromStep;
    const estH = longBody ? 340 : 280;

    if (!rect) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: tw,
      };
    }
    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.min(Math.max(16, left), vw - tw - 16);
    const gap = 12;
    let top = rect.bottom + gap;
    if (top + estH > vh - 16) {
      top = rect.top - gap - estH;
    }
    top = Math.min(Math.max(16, top), vh - estH - 16);
    return { left, top, width: tw };
  };

  return (
    <>
      <AnimatePresence>
        {rect && (
          <motion.div
            key={`spot-${tourId}-${step}-${Math.round(rect.top)}-${Math.round(rect.left)}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            className="pointer-events-none fixed z-[47] rounded-2xl ring-2 ring-amber-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.58)]"
            style={{
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${tourId}-${step}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[48] max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-stone-200 bg-[var(--color-compass-surface)] p-5 shadow-2xl"
          style={tooltipStyle()}
        >
          <button
            type="button"
            onClick={dismissTour}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            aria-label="Exit tour"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          <div className="flex items-start gap-3 pr-10">
            <span className="text-3xl" aria-hidden>
              {frame.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p id={titleId} className="text-lg font-semibold leading-snug text-stone-900">
                {frame.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{frame.body}</p>
            </div>
          </div>

          <div className="mt-5 flex max-w-full flex-wrap justify-center gap-1.5" aria-label="Tour progress">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${i === step ? "bg-amber-600" : "bg-stone-300"}`}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={dismissTour}
              className="order-2 text-sm font-medium text-stone-500 underline-offset-4 hover:text-stone-800 hover:underline sm:order-1"
            >
              Exit tour
            </button>
            <button
              ref={primaryRef}
              type="button"
              onClick={goNext}
              className="order-1 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 sm:order-2"
            >
              {primaryLabel}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
