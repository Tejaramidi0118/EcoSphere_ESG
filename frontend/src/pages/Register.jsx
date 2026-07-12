import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [isEmployee, setIsEmployee] = useState(false);
  
  // Organization Register State
  const [orgFormData, setOrgFormData] = useState({
    orgName: "",
    industry: "Technology",
    size: "11-50",
    country: "",
    adminName: "",
    email: "",
    password: ""
  });

  // Employee Register State
  const [empFormData, setEmpFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch registered organizations list for employee signup selection
  useEffect(() => {
    if (isEmployee) {
      setError("");
      fetch("http://localhost:5555/api/auth/public-orgs")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load organizations.");
          return res.json();
        })
        .then((data) => {
          setOrganizations(data);
          if (data.length > 0) {
            setSelectedOrgId(data[0].id.toString());
            if (data[0].departments.length > 0) {
              setSelectedDeptId(data[0].departments[0].id.toString());
            }
          }
        })
        .catch((err) => {
          console.error("Error loading organizations:", err);
          setError("Could not load organization directory. Please try again.");
        });
    }
  }, [isEmployee]);

  const handleOrgFormChange = (e) => {
    setOrgFormData({ ...orgFormData, [e.target.name]: e.target.value });
  };

  const handleEmpFormChange = (e) => {
    setEmpFormData({ ...empFormData, [e.target.name]: e.target.value });
  };

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    setSelectedOrgId(orgId);
    const org = organizations.find((o) => o.id.toString() === orgId);
    if (org && org.departments.length > 0) {
      setSelectedDeptId(org.departments[0].id.toString());
    } else {
      setSelectedDeptId("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!isEmployee) {
        // Registering as an Organization
        const { orgName, industry, size, country, adminName, email, password } = orgFormData;
        if (!orgName || !country || !adminName || !email || !password) {
          throw new Error("Please fill in all organization fields.");
        }

        const regResponse = await fetch("http://localhost:5555/api/auth/register-org", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orgFormData)
        });

        const regData = await regResponse.json();
        if (!regResponse.ok) {
          throw new Error(regData.error || "Organization registration failed.");
        }

        // Auto-login
        const loginResponse = await fetch("http://localhost:5555/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error("Organization created, but auto-login failed. Please sign in manually.");
        }

        localStorage.setItem("token", loginData.token);
        localStorage.setItem("user", JSON.stringify(loginData.user));
      } else {
        // Registering as an Employee
        const { name, email, password } = empFormData;
        if (!name || !email || !password || !selectedOrgId || !selectedDeptId) {
          throw new Error("Please fill in all employee fields and select your department.");
        }

        const payload = {
          name,
          email,
          password,
          organizationId: parseInt(selectedOrgId, 10),
          departmentId: parseInt(selectedDeptId, 10)
        };

        const regResponse = await fetch("http://localhost:5555/api/auth/register-employee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const regData = await regResponse.json();
        if (!regResponse.ok) {
          throw new Error(regData.error || "Employee registration failed.");
        }

        // Auto-login
        const loginResponse = await fetch("http://localhost:5555/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error("Account created, but auto-login failed. Please sign in manually.");
        }

        localStorage.setItem("token", loginData.token);
        localStorage.setItem("user", JSON.stringify(loginData.user));
      }

      // Redirect to workspace
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Find currently selected organization object to map departments dropdown
  const currentOrgObj = organizations.find((o) => o.id.toString() === selectedOrgId);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", justifyContent: "center",
      alignItems: "center", background: "var(--bg)", padding: "40px 20px"
    }} className="fade-in">
      
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: 40, width: 500,
        boxShadow: "var(--shadow-lg)", textAlign: "center"
      }} className="fade-in-up">
        
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--forest)", marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: "var(--forest-light)", borderRadius: "50%" }} />
          EcoSphere
        </div>

        {/* Tab Selection Switch */}
        <div style={{
          display: "flex", background: "var(--bg)", padding: 4,
          borderRadius: "var(--radius)", marginBottom: 28, border: "1px solid var(--border)"
        }}>
          <button
            onClick={() => setIsEmployee(false)}
            style={{
              flex: 1, padding: "8px 12px", border: "none", borderRadius: "var(--radius-sm)",
              fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "var(--transition)",
              background: !isEmployee ? "var(--surface)" : "transparent",
              color: !isEmployee ? "var(--forest)" : "var(--text-secondary)",
              boxShadow: !isEmployee ? "var(--shadow-sm)" : "none"
            }}
          >
            Create Company Admin
          </button>
          <button
            onClick={() => setIsEmployee(true)}
            style={{
              flex: 1, padding: "8px 12px", border: "none", borderRadius: "var(--radius-sm)",
              fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "var(--transition)",
              background: isEmployee ? "var(--surface)" : "transparent",
              color: isEmployee ? "var(--forest)" : "var(--text-secondary)",
              boxShadow: isEmployee ? "var(--shadow-sm)" : "none"
            }}
          >
            Join as Employee
          </button>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          {!isEmployee ? "Register organization" : "Create employee profile"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px" }}>
          {!isEmployee 
            ? "Provision your workspace and start tracking corporate ESG metrics."
            : "Connect with your company workspace to log carbon check-ins and earn rewards."
          }
        </p>

        {error && (
          <div style={{ padding: "10px 12px", color: "var(--coral)", background: "var(--coral-tint)", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 500, marginBottom: 18 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
          
          {!isEmployee ? (
            // Form: Organization Admin Details
            <>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--forest-light)", borderBottom: "1px solid var(--border)", paddingBottom: 6, margin: "6px 0 2px" }}>
                Company Metadata
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Company Name</label>
                  <input
                    type="text"
                    name="orgName"
                    placeholder="Microsoft India"
                    value={orgFormData.orgName}
                    onChange={handleOrgFormChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Country</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="India"
                    value={orgFormData.country}
                    onChange={handleOrgFormChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Industry</label>
                  <select
                    name="industry"
                    value={orgFormData.industry}
                    onChange={handleOrgFormChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg)", outline: "none", fontSize: 14 }}
                  >
                    {["Technology", "Manufacturing", "Retail", "Finance", "Energy", "Other"].map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Company Size</label>
                  <select
                    name="size"
                    value={orgFormData.size}
                    onChange={handleOrgFormChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg)", outline: "none", fontSize: 14 }}
                  >
                    {["1-10", "11-50", "51-200", "201-1000", "1000+"].map((sz) => (
                      <option key={sz} value={sz}>{sz} employees</option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--forest-light)", borderBottom: "1px solid var(--border)", paddingBottom: 6, margin: "14px 0 2px" }}>
                Admin credentials
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Admin User Name</label>
                <input
                  type="text"
                  name="adminName"
                  placeholder="John Doe"
                  value={orgFormData.adminName}
                  onChange={handleOrgFormChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Admin Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@company.com"
                    value={orgFormData.email}
                    onChange={handleOrgFormChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={orgFormData.password}
                    onChange={handleOrgFormChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                  />
                </div>
              </div>
            </>
          ) : (
            // Form: Employee self-registration
            <>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--forest-light)", borderBottom: "1px solid var(--border)", paddingBottom: 6, margin: "6px 0 2px" }}>
                Select Workspace
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Select Company</label>
                  <select
                    value={selectedOrgId}
                    onChange={handleOrgChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg)", outline: "none", fontSize: 14 }}
                  >
                    {organizations.length === 0 ? (
                      <option>Loading companies...</option>
                    ) : (
                      organizations.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Department</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg)", outline: "none", fontSize: 14 }}
                  >
                    {!currentOrgObj || currentOrgObj.departments.length === 0 ? (
                      <option>No departments found</option>
                    ) : (
                      currentOrgObj.departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--forest-light)", borderBottom: "1px solid var(--border)", paddingBottom: 6, margin: "14px 0 2px" }}>
                Personal Account
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Your Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Sarah Connor"
                  value={empFormData.name}
                  onChange={handleEmpFormChange}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Your Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="sarah@company.com"
                    value={empFormData.email}
                    onChange={handleEmpFormChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Choose Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={empFormData.password}
                    onChange={handleEmpFormChange}
                    style={{ padding: "10px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)", outline: "none", fontSize: 14 }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--forest)", color: "#fff", border: "none",
              borderRadius: "var(--radius)", padding: "12px", fontSize: 14,
              fontWeight: 700, cursor: "pointer", transition: "var(--transition)",
              marginTop: 14, display: "flex", justifyContent: "center", alignItems: "center"
            }}
          >
            {loading ? "Registering account..." : !isEmployee ? "Create organization" : "Join organization"}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 13, color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "var(--forest-light)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
          >
            Sign in
          </span>
        </div>

      </div>
    </div>
  );
}
