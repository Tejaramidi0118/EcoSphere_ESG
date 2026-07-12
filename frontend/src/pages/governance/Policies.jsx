import React, { useState, useEffect } from 'react';
import { governanceApi } from '../../api/governance';

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const data = await governanceApi.getPolicies();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await governanceApi.acknowledgePolicy(id);
      alert('Policy successfully acknowledged! Thank you for reviewing.');
    } catch (err) {
      alert(`Could not acknowledge: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading ESG Policies...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Company ESG Policies</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {policies.map(policy => (
          <div key={policy.id} style={{ background: '#fff', padding: 24, borderRadius: 8, borderLeft: '4px solid #0f766e', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{policy.title} <span style={{ fontSize: 12, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 12, marginLeft: 8 }}>v{policy.version}</span></h3>
                <p style={{ margin: '12px 0 0 0', color: '#475569', fontSize: 14 }}>{policy.description}</p>
              </div>
              <button 
                onClick={() => handleAcknowledge(policy.id)}
                style={{ background: '#0f766e', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontWeight: 600, minWidth: 150 }}
              >
                Acknowledge Receipt
              </button>
            </div>
          </div>
        ))}
        {policies.length === 0 && <p>No active organizational policies right now.</p>}
      </div>
    </div>
  );
}
