import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socialApi } from '../../api/social';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await socialApi.getActivities();
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading CSR activities...</div>;

  const getDynamicTheme = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('blood')) return { emoji: '🩸', gradient: 'linear-gradient(135deg, #dc2626, #f87171)' };
    if (t.includes('beach')) return { emoji: '🌊', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' };
    if (t.includes('workshop')) return { emoji: '🤝', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' };
    return { emoji: '🌱', gradient: 'linear-gradient(135deg, #059669, #10b981)' };
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Impact Opportunities</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Discover and join upcoming corporate social responsibility events and track your sustainability contributions.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activities.map((a) => {
          const theme = getDynamicTheme(a.title);
          
          return (
          <div 
            key={a.id} 
            onClick={() => navigate(`/social/activities/${a.id}`)}
            style={{ 
              display: 'flex', 
              background: '#fff', 
              borderRadius: 16, 
              overflow: 'hidden', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
          >
            <div style={{ 
              width: 200, 
              background: theme.gradient,
              display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <span style={{ fontSize: 48, filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.1))' }}>{theme.emoji}</span>
            </div>
            <div style={{ padding: 24, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                    {a.category?.name || 'Initiative'}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{a.title}</h3>
                  <p style={{ color: '#475569', lineHeight: 1.5, margin: 0 }}>{a.description}</p>
                </div>
                <button style={{ 
                  background: 'none', border: 'none', color: '#0f766e', fontWeight: 600, cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0' 
                }}>
                  View Details <span style={{ fontSize: 18 }}>→</span>
                </button>
              </div>
            </div>
          </div>
          );
        })}
        {activities.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, background: '#f8fafc', borderRadius: 16, border: '2px dashed #cbd5e1', color: '#64748b' }}>
            No CSR activities available at the moment. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
