import { useEffect, useState } from "react";
import { getCarbonTransactions, getEmissionFactors, createCarbonTransaction } from "../../api/environmental";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [factors, setFactors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: "",
    emissionFactorId: "",
    quantity: "",
    sourceType: "Fleet",
    date: "",
  });

  useEffect(() => {
    // Load historical transactions
    getCarbonTransactions()
      .then(setTransactions)
      .catch((err) => {
        console.error(err);
        setError("Failed to load transactions.");
      });

    // Load emission factors for select list
    getEmissionFactors()
      .then(setFactors)
      .catch(console.error);

    // Load departments dynamically
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
    if (!formData.departmentId || !formData.emissionFactorId || !formData.quantity) {
      alert("Please fill in all required fields.");
      return;
    }

    createCarbonTransaction(formData)
      .then((newTx) => {
        setTransactions([newTx, ...transactions]);
        setIsModalOpen(false);
        setFormData({
          departmentId: "",
          emissionFactorId: "",
          quantity: "",
          sourceType: "Fleet",
          date: "",
        });
      })
      .catch((err) => {
        alert(err.message || "Failed to log carbon transaction.");
      });
  };

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }} className="fade-in-up">
      
      {/* Header Block */}
      <header style={{ marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--forest-light)" }}>Carbon Accounting</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>Carbon transactions</h1>
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
          Log transaction
        </button>
      </header>

      {error && (
        <div style={{ padding: "12px 16px", color: "var(--coral)", background: "var(--coral-tint)", borderRadius: "var(--radius)", marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Transactions Container */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              {["Transaction Date", "Department", "Scope / Source", "Resource Details", "Quantity logged", "Calculated CO₂e"].map((h) => (
                <th key={h} style={{ padding: "16px 20px", fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && !error && (
              <tr>
                <td colSpan="6" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                  No carbon transactions found. Click "Log transaction" to add entry.
                </td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: "1px solid var(--border)", transition: "var(--transition)" }} className="table-row-hover">
                <td style={{ padding: "18px 20px", fontSize: 14, color: "var(--text-secondary)" }}>{tx.date?.slice(0, 10)}</td>
                <td style={{ padding: "18px 20px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{tx.department?.name || `Dept ${tx.departmentId}`}</td>
                <td style={{ padding: "18px 20px", fontSize: 14 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4,
                    background: "var(--surface-sunken)", color: "var(--text-secondary)"
                  }}>
                    {tx.sourceType}
                  </span>
                </td>
                <td style={{ padding: "18px 20px", fontSize: 14, color: "var(--text-secondary)" }}>{tx.emissionFactor?.name}</td>
                <td style={{ padding: "18px 20px", fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                  {tx.quantity.toLocaleString()} <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{tx.emissionFactor?.unit}</span>
                </td>
                <td style={{ padding: "18px 20px", fontSize: 14, fontWeight: 700, color: "var(--forest-light)" }}>
                  {tx.co2Calculated.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg CO₂e
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Transaction Modal */}
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
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>Log carbon transaction</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px" }}>Enter environmental logs to calculate emissions using DESNZ indicators.</p>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Department</label>
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
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Emission factor details</label>
                <select
                  name="emissionFactorId"
                  value={formData.emissionFactorId}
                  onChange={handleChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg)", outline: "none", fontSize: 14 }}
                >
                  <option value="">Select factor</option>
                  {factors.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.unit})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Quantity</label>
                <input
                  type="number"
                  step="any"
                  name="quantity"
                  placeholder="e.g. 1500"
                  value={formData.quantity}
                  onChange={handleChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Source type</label>
                <select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg)", outline: "none", fontSize: 14 }}
                >
                  {["Fleet", "Manufacturing", "Purchase", "Expense", "Manual"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
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
                  Log entry
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
