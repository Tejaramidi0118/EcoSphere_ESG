import React, { useState, useEffect } from 'react';
import { socialApi } from '../../api/social';

export default function ParticipationQueue() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const data = await socialApi.getPendingParticipation();
      setParticipations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await socialApi.approveParticipation(id);
      setParticipations(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await socialApi.rejectParticipation(id);
      setParticipations(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading Queue...</div>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Participation Approval Queue</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Review employee proofs before they are awarded XP.
        </p>
      </div>
      
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Employee</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Activity</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Proof</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {participations.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>{p.employee?.name || `ID: ${p.employee_id}`}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500 }}>{p.csrActivity?.title}</div>
                  {p.csrActivity?.description && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      <span style={{ fontWeight: 600 }}>Rule:</span> {p.csrActivity?.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {p.proof_url ? (
                    p.proof_url.startsWith('http') ? (
                      <a href={p.proof_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>View Proof</a>
                    ) : (
                      <span>{p.proof_url}</span>
                    )
                  ) : (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No proof</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => handleApprove(p.id)} 
                    style={{ background: '#10b981', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(p.id)} 
                    style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {participations.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>
                  Hooray! The queue is completely empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
