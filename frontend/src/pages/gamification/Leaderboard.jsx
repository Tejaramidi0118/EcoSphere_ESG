import React, { useState, useEffect } from 'react';
import { gamificationApi } from '../../api/gamification';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [scope, setScope] = useState('employee');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [scope]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await gamificationApi.getLeaderboard(scope);
      setLeaders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (index) => {
    if (index === 0) return { bg: '#fef3c7', text: '#d97706', border: '#fcd34d', medal: '🥇' };
    if (index === 1) return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', medal: '🥈' };
    if (index === 2) return { bg: '#ffedd5', text: '#9a3412', border: '#fdba74', medal: '🥉' };
    return { bg: '#fff', text: '#64748b', border: '#f1f5f9', medal: null };
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Trophy size={36} color="#fbbf24" fill="#fef3c7" /> Impact Leaderboard
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 16 }}>Top contributors driving our ESG operational mandate.</p>
        </div>
        
        <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: 12, display: 'flex', gap: 4 }}>
          <button 
            onClick={() => setScope('employee')}
            style={{ padding: '8px 16px', border: 'none', background: scope === 'employee' ? '#fff' : 'transparent', color: scope === 'employee' ? '#0f172a' : '#64748b', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: scope === 'employee' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Top Ambassadors
          </button>
          <button 
            onClick={() => setScope('department')}
            style={{ padding: '8px 16px', border: 'none', background: scope === 'department' ? '#fff' : 'transparent', color: scope === 'department' ? '#0f172a' : '#64748b', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: scope === 'department' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Top Departments
          </button>
        </div>
      </div>
      
      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Pulling top performers...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {leaders.map((item, index) => {
            const rankStyle = getRankColor(index);
            const isTop3 = index < 3;
            
            return (
              <div key={item.id || index} style={{ 
                background: rankStyle.bg, 
                border: `1px solid ${rankStyle.border}`,
                borderRadius: 16, 
                padding: isTop3 ? '24px 32px' : '16px 32px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                boxShadow: index === 0 ? '0 10px 15px -3px rgba(245, 158, 11, 0.1)' : '0 2px 4px -2px rgba(0,0,0,0.05)',
                transform: index === 0 ? 'scale(1.02)' : 'none',
                position: 'relative',
                zIndex: index === 0 ? 10 : 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  
                  {/* Rank Circle */}
                  <div style={{ width: 40, textAlign: 'center', fontSize: isTop3 ? 28 : 20, fontWeight: 900, color: rankStyle.text }}>
                    {rankStyle.medal ? rankStyle.medal : `#${index + 1}`}
                  </div>
                  
                  {/* Participant Identity */}
                  <div>
                    <h3 style={{ fontSize: isTop3 ? 20 : 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{item.name}</h3>
                    {scope === 'employee' && item.department && (
                      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{item.department.name}</div>
                    )}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {index === 0 && <span style={{ fontSize: 12, background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Global #1</span>}
                  <div style={{ fontSize: isTop3 ? 24 : 18, fontWeight: 900, color: rankStyle.text, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    {item.xp_total || item.total_xp} <span style={{ fontSize: 14, fontWeight: 600, color: index < 3 ? rankStyle.text : '#94a3b8', opacity: 0.8 }}>XP</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {leaders.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, background: '#f8fafc', borderRadius: 16, color: '#64748b', border: '1px dashed #cbd5e1' }}>
              The leaderboard is completely empty. It's anyone's game!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
