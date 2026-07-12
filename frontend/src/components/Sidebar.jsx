import { NavLink } from "react-router-dom";
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
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">EcoSphere</div>
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
    </nav>
  );
}
