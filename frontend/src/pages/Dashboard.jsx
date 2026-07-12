import { useEffect, useState } from "react";
import ScoreCard from "../components/ScoreCard";
import { getDashboardSummary } from "../api/dashboard";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch dashboard data. Make sure the backend server is running.");
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: 40 }} className="fade-in">
        <div style={{
          background: "var(--coral-tint)", color: "var(--coral)",
          padding: "16px 20px", borderRadius: "var(--radius)",
          border: "1px solid var(--border)", fontWeight: 500
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "var(--text-muted)", fontSize: 16 }} className="fade-in">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--forest-light)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <span>Loading Executive Overview...</span>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }} className="fade-in-up">
      
      {/* Top Header Block */}
      <header style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--forest-light)" }}>Platform Dashboard</span>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>Executive overview</h1>
          </div>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, background: "var(--surface)", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: "var(--radius-sm)" }}>
            Reporting Period: Q3 2026
          </span>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ display: "flex", gap: 20, marginBottom: 36 }}>
        <ScoreCard label="Environmental" score={data.environmental_score} tone="forest" />
        <ScoreCard label="Social" score={data.social_score} tone="social" />
        <ScoreCard label="Governance" score={data.governance_score} tone="gov" />
        <ScoreCard label="Overall ESG score" score={data.overall_score} tone="overall" />
      </div>

      {/* Grid Content Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        
        {/* Department Ranking Panel */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow)"
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Department performance</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Weighted Total</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.department_ranking?.map((d, index) => (
              <div key={d.departmentId} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", background: "var(--bg)", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)", transition: "var(--transition)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", background: index === 0 ? "var(--forest-tint)" : "var(--surface-sunken)",
                    color: index === 0 ? "var(--forest-light)" : "var(--text-secondary)", fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Department {d.departmentId}</span>
                </div>
                <span style={{
                  fontWeight: 700, fontSize: 14, color: d.totalScore >= 50 ? "var(--forest-light)" : "var(--text-secondary)",
                  background: "var(--surface)", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)"
                }}>
                  {d.totalScore} / 100
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow)"
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.recent_activity?.length === 0 && (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                No recent activity logs found.
              </div>
            )}
            {data.recent_activity?.map((n) => (
              <div key={n.id} style={{
                padding: "12px 14px", borderLeft: "3px solid var(--forest-light)",
                background: "var(--bg)", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.4,
                display: "flex", justifyContent: "space-between", gap: 10
              }}>
                <span>{n.message}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {n.createdAt?.slice(11, 16)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
