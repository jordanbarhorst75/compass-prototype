import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { GuideTourId } from "../domain/guideTour";
import { useCompass } from "../state/CompassProvider";

const TOUR_PATH: Record<GuideTourId, string> = {
  board: "/board",
  journey: "/journey",
  profile: "/profile",
};

/**
 * When a guided tour is active, keep the user on the route where that tour’s spotlight mounts.
 * Tour UI lives on {@link BoardPage}, {@link JourneyPage}, and {@link ProfilePage}.
 */
export function OnboardingFlow() {
  const { activeTour } = useCompass();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!activeTour) return;
    const target = TOUR_PATH[activeTour];
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [activeTour, location.pathname, navigate]);

  return null;
}
