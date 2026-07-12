import { useEffect, useState } from "react";
import ScoreCard from "../components/ScoreCard";
import { getDashboardSummary } from "../api/dashboard";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5555/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch((err) => console.error("Error updating user context:", err));
    }

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

  // Get current time greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 18) return "Good afternoon";
    return "Good evening";
  };

  const xp = user?.xpTotal || 0;
  
  // Calculate Level and Tree growth stages
  const getLevelDetails = (totalXp) => {
    if (totalXp < 500) return { name: "Sprout 🌱", level: 1, nextLimit: 500, emoji: "🌱" };
    if (totalXp < 1500) return { name: "Sapling 🌿", level: 2, nextLimit: 1500, emoji: "🌿" };
    if (totalXp < 3000) return { name: "Bamboo 🎋", level: 3, nextLimit: 3000, emoji: "🎋" };
    if (totalXp < 5000) return { name: "Oak 🌳", level: 4, nextLimit: 5000, emoji: "🌳" };
    return { name: "Giant Redwood 🌲", level: 5, nextLimit: 10000, emoji: "🌲" };
  };

  const levelDetails = getLevelDetails(xp);

  // If the logged-in user is an admin: Render the Admin Dashboard
  if (user?.role === "admin") {
    return (
      <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }} className="fade-in-up">
        
        {/* Admin Header */}
        <header style={{ marginBottom: 30 }}>
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

        {/* Sustainability Coach Box for Admin */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 30,
          display: "flex", gap: 14, alignItems: "center", boxShadow: "var(--shadow-sm)"
        }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <strong>Sustainability Coach recommendations:</strong> Logistics travel emissions increased by 14% this month. Launch a <em>"Public Commuter challenge"</em> to encourage staff transport checks and lower overall footprints by an estimated 450 kg.
          </div>
        </div>

        {/* Score metrics */}
        <div style={{ display: "flex", gap: 20, marginBottom: 36 }}>
          <ScoreCard label="Environmental" score={data.environmental_score} tone="forest" />
          <ScoreCard label="Social" score={data.social_score} tone="social" />
          <ScoreCard label="Governance" score={data.governance_score} tone="gov" />
          <ScoreCard label="Overall ESG score" score={data.overall_score} tone="overall" />
        </div>

        {/* Layout details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          
          {/* Department Rankings */}
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
                  border: "1px solid var(--border)"
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

          {/* Recent Activity */}
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

  // If the logged-in user is an employee: Render the Customer / Employee Dashboard
  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }} className="fade-in-up">
      
      {/* Welcome Banner */}
      <header style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--forest-light)" }}>
            Employee Dashboard
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>
            {getGreeting()}, {user?.name || "Eco-Warrior"}! 🌳
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Green Streak Tracker Badge */}
          <div style={{
            background: "var(--amber-tint)", color: "#B45309", border: "1px solid #FDE68A",
            padding: "8px 16px", borderRadius: "var(--radius)", fontSize: 13, display: "flex", gap: 6, alignItems: "center", fontWeight: 700
          }}>
            🔥 {user?.streakDays || 0} Day Streak
          </div>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            padding: "8px 16px", borderRadius: "var(--radius)", fontSize: 13, display: "flex", gap: 8, alignItems: "center"
          }}>
            <span style={{ width: 8, height: 8, background: "#10B981", borderRadius: "50%" }} />
            Department: <strong>{user?.departmentName || "General Staff"}</strong>
          </div>
        </div>
      </header>

      {/* Gamification Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 36 }}>
        
        {/* 1. Personal level */}
        <div style={{
          background: "linear-gradient(135deg, var(--forest), var(--forest-light))", color: "#fff",
          borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-lg)", position: "relative", overflow: "hidden"
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8 }}>Sustainability Rank</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "6px 0 14px" }}>{levelDetails.name}</h2>
          
          {/* Level Progress */}
          <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Level {levelDetails.level} Progress</span>
            <span>{xp} / {levelDetails.nextLimit} XP</span>
          </div>
          <div style={{ width: "100%", height: 6, background: "rgba(255, 255, 255, 0.2)", borderRadius: 999 }}>
            <div style={{ width: `${Math.min(100, (xp / levelDetails.nextLimit) * 100)}%`, height: "100%", background: "#fff", borderRadius: 999 }} />
          </div>
        </div>

        {/* 2. Coin balance */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", justifyContent: "space-between"
        }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Redeemable Balance</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 0", color: "var(--text-primary)" }}>
              🪙 {Math.round(xp * 0.8)} <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Green Coins</span>
            </h2>
          </div>
          <span
            onClick={() => navigate("/gamification/badges")}
            style={{ fontSize: 12, color: "var(--forest-light)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", marginTop: 12 }}
          >
            Redeem rewards
          </span>
        </div>

        {/* 3. Company performance */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", justifyContent: "space-between"
        }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Company ESG Score</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 0", color: "var(--forest-light)" }}>
              {data.overall_score} / 100
            </h2>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
            Your check-ins directly boost these figures.
          </span>
        </div>

      </div>

      {/* Main Layout Splits */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
        
        {/* Left Side: Active Quests */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          
          {/* Sustainability Coach Box for Employees */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24,
            display: "flex", gap: 14, alignItems: "center", boxShadow: "var(--shadow-sm)"
          }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <strong>Sustainability Coach:</strong> You are only 120 XP away from unlocking your next rank, <strong>Sapling 🌿</strong>! Complete today's <em>"Cycle to work"</em> challenge to level up your green tree avatar.
            </div>
          </div>

          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Today's Carbon Quests</h3>
              <button
                onClick={() => navigate("/gamification/challenges")}
                style={{ background: "none", border: "none", color: "var(--forest-light)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
              >
                View all
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { title: "Cycle to work", difficulty: "Medium", reward: "150 XP", desc: "Commute using public transit, carpool, or cycle to work instead of private car." },
                { title: "Zero Plastic Lunch", difficulty: "Easy", reward: "80 XP", desc: "Choose reusable lunch boxes and avoid purchasing single-use plastic bottles." },
                { title: "Equipment Standby Shutdown", difficulty: "Easy", reward: "50 XP", desc: "Confirm all monitors, chargers, and desktop equipment are completely powered off at 5 PM." }
              ].map((q, idx) => (
                <div key={idx} style={{
                  padding: 16, background: "var(--bg)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{q.title}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, background: q.difficulty === "Easy" ? "var(--forest-tint)" : "var(--amber-tint)",
                        color: q.difficulty === "Easy" ? "var(--forest-light)" : "#B45309", padding: "2px 6px", borderRadius: 4
                      }}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>{q.desc}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--forest-light)" }}>+{q.reward}</span>
                    <button
                      onClick={() => navigate("/gamification/challenges")}
                      style={{
                        background: "var(--forest)", color: "#fff", border: "none",
                        borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: 11,
                        fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      Participate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Department Duel Leaderboard */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow)"
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Leaderboard Duels
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.department_ranking?.map((d, index) => {
              const isUserDept = user?.departmentId === d.departmentId;
              return (
                <div key={d.departmentId} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: "var(--radius-sm)",
                  background: isUserDept ? "var(--forest-tint)" : "var(--bg)",
                  border: isUserDept ? "1px solid var(--forest-light)" : "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: index === 0 ? "#FEF3C7" : isUserDept ? "var(--forest)" : "var(--surface-sunken)",
                      color: index === 0 ? "#B45309" : isUserDept ? "#fff" : "var(--text-secondary)",
                      fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontWeight: isUserDept ? 700 : 600, fontSize: 13.5 }}>
                      Department {d.departmentId} {isUserDept && "(You)"}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    {d.totalScore} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
