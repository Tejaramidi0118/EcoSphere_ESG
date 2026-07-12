import { useState, useEffect } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User session not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5555/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        setProfile(data.user);
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: "var(--font-sans)", color: "var(--text-secondary)" }}>
        Loading profile details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: "var(--font-sans)", color: "var(--coral)" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", fontFamily: "var(--font-sans)", color: "var(--text-primary)" }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>User Profile</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>View your account specifications and workspace roles.</p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32, alignItems: "start"
      }}>
        {/* Avatar & Score summary card */}
        <div style={{
          background: "linear-gradient(135deg, var(--forest), var(--forest-light))",
          color: "#fff", borderRadius: "var(--radius-lg)", padding: 32,
          boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column",
          alignItems: "center", textCenter: "center"
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
            display: "flex", justifyContent: "center", alignItems: "center",
            fontSize: 32, fontWeight: 800, marginBottom: 16, border: "2px solid rgba(255,255,255,0.3)"
          }}>
            {profile?.name?.charAt(0) || "U"}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{profile?.name}</h2>
          <span style={{
            fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)",
            padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em"
          }}>
            {profile?.role}
          </span>

          <div style={{
            width: "100%", height: "1px", background: "rgba(255,255,255,0.15)", margin: "24px 0"
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 13 }}>
            <span style={{ opacity: 0.8 }}>Sustainability XP:</span>
            <span style={{ fontWeight: 700 }}>{profile?.xpTotal || 0} XP</span>
          </div>
        </div>

        {/* Account Details Box */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 32, boxShadow: "var(--shadow)"
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            Account Specifications
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Name:</span>
              <span style={{ fontSize: 14 }}>{profile?.name}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Email Address:</span>
              <span style={{ fontSize: 14 }}>{profile?.email}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Assigned Department:</span>
              <span style={{ fontSize: 14 }}>{profile?.department?.name || "N/A"} ({profile?.department?.code || "N/A"})</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Organization ID:</span>
              <span style={{ fontSize: 14, fontFamily: "monospace", color: "var(--forest-light)" }}>
                ORG-00{profile?.organizationId}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>User Privilege Level:</span>
              <span style={{ fontSize: 14, textTransform: "capitalize" }}>
                {profile?.role === "admin" ? "🛡️ System Administrator" : "👤 Employee"}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
