import React, { useState, useEffect } from 'react';
import { gamificationApi } from '../../api/gamification';
import { Award, Star, Gift, Check, Lock, Zap } from 'lucide-react';

export default function Badges() {
  const [myBadges, setMyBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [badgesData, rewardsData] = await Promise.all([
        gamificationApi.getMyBadges(),
        gamificationApi.getRewards()
      ]);
      setMyBadges(badgesData);
      setRewards(rewardsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (id, points) => {
    if (!window.confirm(`Trade in ${points} XP for this reward?`)) return;
    try {
      await gamificationApi.redeemReward(id);
      alert('Reward officially claimed! Your XP profile has been updated.');
      fetchData();
    } catch (err) {
      alert(`Error redeeming: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading Gamification Profile...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 40 }}>
      
      {/* Trophy Case Section */}
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Award size={32} color="#fbbf24" fill="#fbbf24" /> Trophy Case
      </h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Badges you unlock are permanently attached to your profile and showcase your ESG legacy. (They auto-generate instantly when your XP crosses specific thresholds by the gamification engine!).</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20, marginBottom: 60 }}>
        {myBadges.map(eb => (
          <div key={eb.id} style={{ 
            background: 'linear-gradient(145deg, #ffffff, #f1f5f9)', 
            border: '2px solid #e2e8f0', 
            padding: '32px 16px', 
            borderRadius: 24, 
            textAlign: 'center', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.5)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            transition: 'transform 0.3s',
            cursor: 'default'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'; e.currentTarget.style.border = '2px solid #cbd5e1'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.border = '2px solid #e2e8f0'; }}
          >
            <div style={{ 
              width: 80, height: 80, background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              marginBottom: 16, fontSize: 36
            }}>
              {eb.badge?.icon === 'Leaf' ? '🌱' : eb.badge?.icon === 'ShieldAlert' ? '🛡️' : eb.badge?.icon === 'Award' ? '🏆' : eb.badge?.icon === 'Users' ? '🤝' : '🏅'}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{eb.badge?.name}</h3>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, background: '#e2e8f0', padding: '2px 8px', borderRadius: 12 }}>
              Unlocked {new Date(eb.awarded_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {myBadges.length === 0 && (
          <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: 40, borderRadius: 20, textAlign: 'center', color: '#64748b' }}>
            <Lock size={48} color="#cbd5e1" style={{ margin: '0 auto 16px auto' }} />
            <p style={{ margin: 0 }}>Your Trophy Case is empty right now. Complete CSR challenges to earn XP and trigger automatic badge awards!</p>
          </div>
        )}
      </div>

      {/* Rewards Store Section */}
      <div style={{ background: '#0f172a', borderRadius: 24, padding: 40, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        
        {/* Subtle background decoration */}
        <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.1, transform: 'rotate(15deg)' }}>
          <Gift size={300} strokeWidth={1} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Star size={32} color="#fbbf24" fill="#fbbf24" /> Exclusive Reward Shop
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: 40, maxWidth: 600 }}>We believe sustainability deserves to be rewarded. Exchange the XP you organically earn on the platform for real-world rewards and perks below.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {rewards.map(reward => (
              <div key={reward.id} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: 24, 
                borderRadius: 20, 
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{reward.name}</h3>
                  <div style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={14} fill="#fbbf24" /> {reward.points_required} XP
                  </div>
                </div>
                
                <p style={{ color: '#94a3b8', fontSize: 14, flex: 1, marginBottom: 24, lineHeight: 1.6 }}>{reward.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                  <span style={{ fontSize: 13, color: reward.stock > 0 ? '#4ade80' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {reward.stock > 0 ? <Check size={14} /> : <Lock size={14} />} 
                    {reward.stock > 0 ? `${reward.stock} Remaining` : 'Out of Stock'}
                  </span>
                  
                  <button 
                    onClick={() => redeemReward(reward.id, reward.points_required)}
                    disabled={reward.stock <= 0}
                    style={{ 
                      background: reward.stock > 0 ? '#fbbf24' : 'rgba(255,255,255,0.1)', 
                      color: reward.stock > 0 ? '#000' : 'rgba(255,255,255,0.4)', 
                      padding: '8px 16px', border: 'none', borderRadius: 12, fontWeight: 700,
                      cursor: reward.stock > 0 ? 'pointer' : 'not-allowed', transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => { if(reward.stock>0) e.currentTarget.style.transform = 'scale(0.95)'; }}
                    onMouseUp={(e) => { if(reward.stock>0) e.currentTarget.style.transform = 'none'; }}
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
