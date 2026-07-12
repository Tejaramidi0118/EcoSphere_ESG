import React, { useState, useEffect } from 'react';
import { gamificationApi } from '../../api/gamification';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ChallengeApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const data = await gamificationApi.getPendingParticipations();
      setPending(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await gamificationApi.approveChallengeParticipation(id, status);
      setPending(prev => prev.filter(p => p.id !== id));
      alert(`Challenge submission explicitly ${status.toLowerCase()}!`);
    } catch (err) {
      alert(`Auth Error: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Pulling pending queue from node...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>Challenge Queue Hub</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Approve or reject employee evidence submissions. (Approvals automatically deposit XP and trigger the badge engine layer).</p>

      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 700, color: '#475569', fontSize: 13, textTransform: 'uppercase' }}>Target Operative</th>
              <th style={{ padding: '16px 24px', fontWeight: 700, color: '#475569', fontSize: 13, textTransform: 'uppercase' }}>Active Challenge</th>
              <th style={{ padding: '16px 24px', fontWeight: 700, color: '#475569', fontSize: 13, textTransform: 'uppercase' }}>Evidence Payload</th>
              <th style={{ padding: '16px 24px', fontWeight: 700, color: '#475569', fontSize: 13, textTransform: 'uppercase' }}>Final Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.employee?.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{p.employee?.email}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, color: '#0f766e' }}>{p.challenge?.title}</div>
                  <div style={{ fontSize: 12, background: '#dcfce7', color: '#166534', display: 'inline-block', padding: '2px 8px', borderRadius: 12, marginTop: 4, fontWeight: 700 }}>
                    {p.challenge?.xp} XP Payload
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {p.proofUrl?.startsWith('data:') ? (
                    <a href={p.proofUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', background: '#eff6ff', padding: '6px 12px', borderRadius: 6, display: 'inline-block' }}>View Encoded Document</a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>None Provided</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleAction(p.id, 'Approved')} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <CheckCircle size={16} /> Assign XP
                    </button>
                    <button onClick={() => handleAction(p.id, 'Rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <XCircle size={16} /> Block
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: 16 }}>No pending challenge submissions! The network is clean.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
