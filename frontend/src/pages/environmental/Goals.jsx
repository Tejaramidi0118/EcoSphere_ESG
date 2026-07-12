import { useEffect, useState } from "react";
import { getGoals, createGoal } from "../../api/environmental";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
    targetCo2: "",
    deadline: "",
  });

  useEffect(() => {
    getGoals()
      .then(setGoals)
      .catch((err) => {
        console.error(err);
        setError("Failed to load goals. Ensure the backend is running.");
      });

    // Load departments list dynamically
    fetch("http://localhost:5555/api/departments")
      .then((res) => res.json())
      .then(setDepartments)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.departmentId || !formData.targetCo2 || !formData.deadline) {
      alert("Please fill in all required fields.");
      return;
    }

    createGoal(formData)
      .then((newGoal) => {
        setGoals([newGoal, ...goals]);
        setIsModalOpen(false);
        setFormData({
          name: "",
          departmentId: "",
          targetCo2: "",
          deadline: "",
        });
      })
      .catch((err) => {
        alert(err.message || "Failed to create environmental goal.");
      });
  };

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }} className="fade-in-up">
      
      {/* Header Block */}
      <header style={{ marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--forest-light)" }}>Environmental Performance</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>Environmental goals</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: "var(--forest-light)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "var(--transition)",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
          className="btn-glow"
        >
          Add goal
        </button>
      </header>

      {error && (
        <div style={{ padding: "12px 16px", color: "var(--coral)", background: "var(--coral-tint)", borderRadius: "var(--radius)", marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Modern Card / Table Container */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              {["Goal name", "Department", "Target CO₂", "Current CO₂", "Goal progress", "Deadline", "Status"].map((h) => (
                <th key={h} style={{ padding: "16px 20px", fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 && !error && (
              <tr>
                <td colSpan="7" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                  No active environmental goals found. Add a goal using the button above.
                </td>
              </tr>
            )}
            {goals.map((g) => {
              // calculate progress: how close current is to target
              // if current <= target, progress is 100% (reduction achieved/target met)
              // if current > target, progress scales down
              const pct = g.currentCo2 <= g.targetCo2 ? 100 : Math.max(0, Math.round(100 - ((g.currentCo2 - g.targetCo2) / g.targetCo2) * 100));
              
              // dynamic status color
              let statusStyle = { background: "var(--forest-tint)", color: "var(--forest-light)" };
              if (g.status === "On Track") {
                statusStyle = { background: "var(--amber-tint)", color: "var(--amber)" };
              } else if (g.status === "Active") {
                statusStyle = { background: "var(--blue-tint)", color: "var(--blue)" };
              }
              
              return (
                <tr key={g.id} style={{ borderBottom: "1px solid var(--border)", transition: "var(--transition)" }} className="table-row-hover">
                  <td style={{ padding: "18px 20px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{g.name}</td>
                  <td style={{ padding: "18px 20px", fontSize: 14, color: "var(--text-secondary)" }}>
                    <span style={{ background: "var(--bg)", padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500, border: "1px solid var(--border)" }}>
                      {g.department?.name || `Dept ${g.departmentId}`}
                    </span>
                  </td>
                  <td style={{ padding: "18px 20px", fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{(g.targetCo2 / 1000).toFixed(1)} t</td>
                  <td style={{ padding: "18px 20px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>{(g.currentCo2 / 1000).toFixed(1)} t</td>
                  <td style={{ padding: "18px 20px", width: 180 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: "var(--surface-sunken)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: pct >= 50 ? "linear-gradient(90deg, var(--forest-hover), var(--forest-light))" : "linear-gradient(90deg, var(--amber), var(--amber-light))",
                          borderRadius: 3
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", minWidth: 28 }}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "18px 20px", fontSize: 14, color: "var(--text-secondary)" }}>{g.deadline?.slice(0, 10)}</td>
                  <td style={{ padding: "18px 20px" }}>
                    <span style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.03em", ...statusStyle
                    }}>
                      {g.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(15, 55, 38, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }} className="fade-in">
          <div style={{
            background: "#fff", padding: 32, borderRadius: "var(--radius-lg)",
            width: 460, border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
            animation: "fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards"
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>Add environmental goal</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px" }}>Set carbon emissions reduction metrics to track sustainability progress.</p>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Goal name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Reduce corporate office heating footprint"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Target Department</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg)", outline: "none", fontSize: 14 }}
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Target limit (kg CO₂e)</label>
                <input
                  type="number"
                  step="any"
                  name="targetCo2"
                  placeholder="e.g. 50000 (for 50 tons)"
                  value={formData.targetCo2}
                  onChange={handleChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "var(--surface-sunken)", color: "var(--text-secondary)",
                    border: "none", borderRadius: "var(--radius)", padding: "10px 20px", cursor: "pointer",
                    fontSize: 13, fontWeight: 700
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "var(--forest)", color: "#fff",
                    border: "none", borderRadius: "var(--radius)", padding: "10px 20px", cursor: "pointer",
                    fontSize: 13, fontWeight: 700
                  }}
                >
                  Create goal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background-color: var(--surface-hover);
        }
        .btn-glow:hover {
          background-color: var(--forest-hover) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
