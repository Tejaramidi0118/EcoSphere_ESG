import React, { useState, useEffect } from 'react';
import { gamificationApi } from '../../api/gamification';
import { CheckCircle, XCircle, Gift, Award } from 'lucide-react';

export default function ChallengeApprovals() {
  const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' or 'redemptions'
  const [pending, setPending] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingData, redemptionsData] = await Promise.all([
        gamificationApi.getPendingParticipations(),
        gamificationApi.getRedemptions().catch(err => {
          console.error("Redemptions API error:", err);
          return [];
        })
      ]);
      setPending(pendingData || []);
      setRedemptions(redemptionsData || []);
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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--text)', letterSpacing: '-0.02em' }}>
        Operations Queue Hub
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
        Manage and track employee submissions, check-ins, and reward redemption requests across the workspace.
      </p>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('challenges')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === 'challenges' ? 'var(--forest-light)' : 'transparent',
            color: activeTab === 'challenges' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Award size={16} /> Challenge Submissions ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('redemptions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === 'redemptions' ? 'var(--forest-light)' : 'transparent',
            color: activeTab === 'redemptions' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Gift size={16} /> Reward Redemptions ({redemptions.length})
        </button>
      </div>

      <div style={{ 
        background: 'var(--card-bg)', 
        borderRadius: 16, 
        overflow: 'hidden', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
        border: '1px solid var(--border)' 
      }}>
        {activeTab === 'challenges' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Target Operative</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Active Challenge</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Evidence Payload</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Final Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{p.employeeName || p.employee?.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.employeeEmail || p.employee?.email}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--forest-light)' }}>{p.challengeTitle || p.challenge?.title}</div>
                    <div style={{ fontSize: 12, background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', display: 'inline-block', padding: '2px 8px', borderRadius: 12, marginTop: 4, fontWeight: 700 }}>
                      {p.xpAwarded || p.challenge?.xp || p.xp} XP Payload
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    {p.proofUrl ? (
                      <a href={p.proofUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none', background: 'rgba(96, 165, 250, 0.1)', padding: '6px 12px', borderRadius: 6, display: 'inline-block' }}>View Encoded Document</a>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>None Provided</span>
                    )}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
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
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16 }}>No pending challenge submissions! The network is clean.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Operative</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Claimed Reward</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Deduction</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Redemption Date</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{r.employeeName}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.employeeEmail}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{r.rewardName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.rewardDescription}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: 13, background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                      -{r.pointsDeducted} XP
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: 14 }}>
                    {new Date(r.redeemedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
              {redemptions.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16 }}>No reward redemptions logged yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
