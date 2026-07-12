import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/environmental/Goals";
import Transactions from "./pages/environmental/Transactions";
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

export default function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Navigation Sidebar */}
        <Sidebar />
        
        {/* Main Work Area */}
        <main style={{ flex: 1, background: "var(--bg)", minHeight: "100vh" }}>
          <Routes>
            {/* Dashboard (Dev A) */}
            <Route path="/" element={<Dashboard />} />

            {/* Environmental (Dev A) */}
            <Route path="/environmental/goals" element={<Goals />} />
            <Route path="/environmental/transactions" element={<Transactions />} />

            {/* Reports (Dev A) */}
            <Route path="/reports" element={<ReportsPlaceholder />} />

            {/* Social (Dev B Placeholders) */}
            <Route path="/social/activities" element={<PlaceholderPage title="CSR activities" />} />
            <Route path="/social/participation" element={<PlaceholderPage title="Employee participation" />} />

            {/* Governance (Dev B Placeholders) */}
            <Route path="/governance/policies" element={<PlaceholderPage title="ESG policies" />} />
            <Route path="/governance/audits" element={<PlaceholderPage title="ESG audits" />} />
            <Route path="/governance/compliance" element={<PlaceholderPage title="Compliance issues" />} />

            {/* Gamification (Dev B Placeholders) */}
            <Route path="/gamification/challenges" element={<PlaceholderPage title="Gamified challenges" />} />
            <Route path="/gamification/badges" element={<PlaceholderPage title="Unlocked badges" />} />
            <Route path="/gamification/leaderboard" element={<PlaceholderPage title="Sustainability leaderboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
