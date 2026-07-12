import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/environmental/Goals";
import Transactions from "./pages/environmental/Transactions";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Activities from "./pages/social/Activities";
import ActivityDetail from "./pages/social/ActivityDetail";
import Participation from "./pages/social/Participation";
import Challenges from "./pages/gamification/Challenges";
import ChallengeApprovals from "./pages/gamification/ChallengeApprovals";
import Badges from "./pages/gamification/Badges";
import Leaderboard from "./pages/gamification/Leaderboard";
import Policies from "./pages/governance/Policies";
import Audits from "./pages/governance/Audits";
import Compliance from "./pages/governance/Compliance";
import Settings from "./pages/settings/Settings";
import "./styles/theme.css";

// Simple fallback view for routes owned by Developer B (Social/Governance/Gamification)
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: 32 }}>
    <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>{title}</h1>
    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
      This page is currently being built by Developer B. Please check back at the next integration merge.
    </p>
  </div>
);

// Placeholder for Reports (Developer A)
const ReportsPlaceholder = () => (
  <div style={{ padding: 32 }}>
    <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>ESG reports</h1>
    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
      Reports interface configuration is coming in the next frontend phase.
    </p>
  </div>
);

// Router guards to separate guest / authenticated views
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/landing" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return !token ? children : <Navigate to="/" replace />;
};

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Guest Pages (No Sidebar) */}
        <Route path="/landing" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Private Workspace Pages (With Sidebar Layout) */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div style={{ display: "flex", minHeight: "100vh" }}>
                {/* Navigation Sidebar */}
                <Sidebar />
                
                {/* Main Work Area */}
                <main style={{ flex: 1, background: "var(--bg)", minHeight: "100vh" }}>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/" element={<Dashboard />} />

                    {/* Environmental */}
                    <Route path="/environmental/goals" element={<Goals />} />
                    <Route path="/environmental/transactions" element={<Transactions />} />

                    {/* Profile details */}
                    <Route path="/profile" element={<Profile />} />

                    {/* Reports */}
                    <Route path="/reports" element={<ReportsPlaceholder />} />

                    {/* Social (Dev B Placeholders) */}
                    <Route path="/social/activities" element={<Activities />} />
                    <Route path="/social/activities/:activityId" element={<ActivityDetail />} />
                    <Route path="/social/participation" element={<Participation />} />

                    {/* Governance (Dev B Placeholders) */}
                    <Route path="/governance/policies" element={<Policies />} />
                    <Route path="/governance/audits" element={<Audits />} />
                    <Route path="/governance/compliance" element={<Compliance />} />

                    {/* Gamification (Dev B Placeholders) */}
                    <Route path="/gamification/challenges" element={<Challenges />} />
                    <Route path="/gamification/approvals" element={<ChallengeApprovals />} />
                    <Route path="/gamification/badges" element={<Badges />} />
                    <Route path="/gamification/leaderboard" element={<Leaderboard />} />

                    {/* Settings (Dev B Placeholders) */}
                    <Route path="/settings" element={<Settings />} />

                    {/* Catch-all fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
