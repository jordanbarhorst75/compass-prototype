import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CompassProvider } from "./state/CompassProvider";
import { BottomNav } from "./components/BottomNav";
import { TopBar } from "./components/TopBar";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { CelebrationOverlay } from "./components/CelebrationOverlay";
import { BoardPage } from "./pages/BoardPage";
import { ActivityPage } from "./pages/ActivityPage";
import { JourneyPage } from "./pages/JourneyPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DemoToolsPage } from "./pages/DemoToolsPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { DevCelebrationsPage } from "./pages/DevCelebrationsPage";

function Shell() {
  const location = useLocation();
  const hideNav = location.pathname === "/activity";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--color-compass-bg)]">
      {!hideNav && <TopBar />}
      <main className={`min-h-0 flex-1 overflow-hidden ${hideNav ? "" : "pb-20"}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/journey" element={<JourneyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/demo-tools" element={<DemoToolsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/dev/celebrations" element={<DevCelebrationsPage />} />
          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </main>
      {!hideNav && <BottomNav />}
      <OnboardingFlow />
      <CelebrationOverlay />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CompassProvider>
        <Shell />
      </CompassProvider>
    </BrowserRouter>
  );
}
