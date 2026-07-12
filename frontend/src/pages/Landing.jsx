import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "var(--bg)", fontFamily: "var(--font-sans)"
    }} className="fade-in">
      
      {/* Header / Navbar */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 40px", maxWidth: 1200, width: "100%", margin: "0 auto"
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--forest)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "var(--forest-light)", borderRadius: "50%" }} />
          EcoSphere
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none", border: "none", color: "var(--text-secondary)",
              fontWeight: 600, fontSize: 14, cursor: "pointer"
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "var(--forest-light)", color: "#fff", border: "none",
              borderRadius: "var(--radius)", padding: "8px 16px", fontSize: 13,
              fontWeight: 700, cursor: "pointer", transition: "var(--transition)"
            }}
            className="btn-glow"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "60px 20px",
        maxWidth: 800, margin: "0 auto"
      }} className="fade-in-up">
        
        <span style={{
          background: "var(--forest-tint)", color: "var(--forest-light)",
          fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999,
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20
        }}>
          Next-Gen ESG Platform
        </span>

        <h1 style={{
          fontSize: 48, fontWeight: 800, color: "var(--text-primary)",
          lineHeight: 1.15, margin: "0 0 20px", letterSpacing: "-0.03em"
        }}>
          Build a sustainable workplace through <span style={{ color: "var(--forest-light)" }}>ESG intelligence</span>
        </h1>

        <p style={{
          fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.6,
          maxWidth: 600, margin: "0 auto 36px"
        }}>
          Automate carbon accounting using 2026 government factors, engage employees in active green challenges, and secure corporate governance audits in one single workspace.
        </p>

        <div style={{ display: "flex", gap: 16 }}>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "var(--forest)", color: "#fff", border: "none",
              borderRadius: "var(--radius)", padding: "14px 28px", fontSize: 15,
              fontWeight: 700, cursor: "pointer", transition: "var(--transition)",
              boxShadow: "var(--shadow-lg)"
            }}
          >
            Create organization
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "var(--surface)", color: "var(--text-primary)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
              padding: "14px 28px", fontSize: 15, fontWeight: 600,
              cursor: "pointer", transition: "var(--transition)", boxShadow: "var(--shadow-sm)"
            }}
          >
            Sign in as admin
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <section style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24,
          marginTop: 80, width: "100%", maxWidth: 1000
        }}>
          
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: 24, textAlign: "left", boxShadow: "var(--shadow)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              🌱 Carbon accounting
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Track scopes with official DESNZ/DEFRA conversion factors. Auto-calculate footings instantly.
            </p>
          </div>

          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: 24, textAlign: "left", boxShadow: "var(--shadow)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              🎮 Gamified ESG
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              XP progression levels, badges unlocks, and rewards shop logs that link activity straight to corporate metrics.
            </p>
          </div>

          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: 24, textAlign: "left", boxShadow: "var(--shadow)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              ⚖️ Enterprise compliance
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Track policies acknowledgement matrices and schedule internal auditing checklists securely.
            </p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: 24, fontSize: 12, color: "var(--text-muted)",
        borderTop: "1px solid var(--border)", maxWidth: 1200, width: "100%", margin: "0 auto"
      }}>
        © 2026 EcoSphere Inc. All rights reserved. Trusted by forward-thinking workplaces worldwide.
      </footer>

      <style>{`
        .btn-glow:hover {
          background-color: var(--forest-hover) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
