import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5555/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save token and user details to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      navigate("/");
      // Force reload to refresh context
      window.location.reload();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", justifyContent: "center",
      alignItems: "center", background: "var(--bg)", padding: 20
    }} className="fade-in">
      
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: 40, width: 400,
        boxShadow: "var(--shadow-lg)", textAlign: "center"
      }} className="fade-in-up">
        
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--forest)", marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: "var(--forest-light)", borderRadius: "50%" }} />
          EcoSphere
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Welcome back</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 28px" }}>Sign in to manage your company ESG workspace.</p>

        {error && (
          <div style={{ padding: "10px 12px", color: "var(--coral)", background: "var(--coral-tint)", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 500, marginBottom: 18 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Email address</label>
            <input
              type="email"
              name="email"
              placeholder="admin@ecosphere.io"
              value={formData.email}
              onChange={handleChange}
              style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--forest)", color: "#fff", border: "none",
              borderRadius: "var(--radius)", padding: "12px", fontSize: 14,
              fontWeight: 700, cursor: "pointer", transition: "var(--transition)",
              marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center"
            }}
          >
            {loading ? "Authenticating..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 13, color: "var(--text-secondary)" }}>
          Don't have an organization?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "var(--forest-light)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
          >
            Create one
          </span>
        </div>

      </div>
    </div>
  );
}
