import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const NAV = [
  { to: "/", label: "Dashboard" },
  {
    label: "Environmental",
    children: [
      { to: "/environmental/goals", label: "Goals" },
      { to: "/environmental/transactions", label: "Carbon transactions" },
    ],
  },
  {
    label: "Social",
    children: [
      { to: "/social/activities", label: "CSR activities" },
      { to: "/social/participation", label: "Participation" },
    ],
  },
  {
    label: "Governance",
    children: [
      { to: "/governance/policies", label: "Policies" },
      { to: "/governance/audits", label: "Audits" },
      { to: "/governance/compliance", label: "Compliance issues" },
    ],
  },
  {
    label: "Gamification",
    children: [
      { to: "/gamification/challenges", label: "Challenges" },
      { to: "/gamification/badges", label: "Badges" },
      { to: "/gamification/leaderboard", label: "Leaderboard" },
    ],
  },
  { to: "/reports", label: "Reports" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">EcoSphere</div>
      <div className="sidebar-content">
        {NAV.map((item) =>
          item.children ? (
            <div className="sidebar-group" key={item.label}>
              <div className="sidebar-group-label">{item.label}</div>
              {item.children.map((c) => (
                <NavLink key={c.to} to={c.to} className="sidebar-link">
                  {c.label}
                </NavLink>
              ))}
            </div>
          ) : (
            <NavLink key={item.to} to={item.to} className="sidebar-link sidebar-top">
              {item.label}
            </NavLink>
          )
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div className="sidebar-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 16 }}>
        {/* Dark/Light mode toggle button */}
        <button
          onClick={toggleTheme}
          className="sidebar-link"
          style={{
            background: "none", border: "none", width: "100%", textAlign: "left",
            color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center",
            padding: "10px 14px", marginBottom: 6
          }}
        >
          {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
        </button>

        <NavLink to="/profile" className="sidebar-link">
          👤 Profile Page
        </NavLink>
        
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
            window.location.reload();
          }}
          className="sidebar-link"
          style={{
            background: "none", border: "none", width: "100%", textAlign: "left",
            color: "#FFA8A8", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center",
            padding: "10px 14px"
          }}
        >
          🚪 Sign out
        </button>
      </div>
    </nav>
  );
}
