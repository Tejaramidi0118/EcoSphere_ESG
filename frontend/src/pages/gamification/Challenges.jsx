import React, { useState, useEffect } from 'react';
import { gamificationApi } from '../../api/gamification';
import { Target, Zap, Clock, ChevronRight, UploadCloud, CheckCircle } from 'lucide-react';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [view, setView] = useState('explore'); 
  const [loading, setLoading] = useState(true);
  
  const [submittingId, setSubmittingId] = useState(null);
  const [fileName, setFileName] = useState({});
  const [base64File, setBase64File] = useState({});

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'explore') {
        const data = await gamificationApi.getChallenges('Active');
        setChallenges(data);
      } else {
        const data = await gamificationApi.getMyParticipations();
        setMyChallenges(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      await gamificationApi.joinChallenge({ challenge_id: id, progress_pct: 0, proof_url: '' });
      alert('Challenge Activated! Switch to "My Active Challenges" to submit your proof when ready.');
      setView('active');
    } catch (err) {
      alert(`Error joining challenge: ${err.message}`);
    }
  };
  
  const handleFileUpload = (e, participationId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(prev => ({ ...prev, [participationId]: file.name }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64File(prev => ({ ...prev, [participationId]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (participationId) => {
    setSubmittingId(participationId);
    try {
      const proofStr = base64File[participationId];
      if (!proofStr) return alert('Please attach a file first.');
      
      await gamificationApi.submitChallengeProof(participationId, proofStr);
      alert('Challenge proof dynamically uploaded and transmitted to Managers!');
      fetchData(); 
    } catch (err) {
      alert(`Error submitting proof: ${err.message}`);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Pulling Gamification Matrix...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 40 }}>
      {/* Immersive Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: 24, padding: 40, color: '#fff', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.5px' }}>Gamified Challenges</h1>
          <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 500, lineHeight: 1.6 }}>Push your limits and participate in company-wide sustainability goals. Earn explosive XP, unlock rare badges, and dominate the leaderboard!</p>
        </div>
        <Target size={120} strokeWidth={1} color="rgba(255,255,255,0.1)" style={{ transform: 'rotate(15deg)' }} />
      </div>
      
      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, padding: 6, background: '#f1f5f9', borderRadius: 12, width: 'fit-content' }}>
        <button onClick={() => setView('explore')} style={{ padding: '10px 24px', background: view === 'explore' ? '#fff' : 'transparent', color: view === 'explore' ? '#0f172a' : '#64748b', fontWeight: 700, border: 'none', borderRadius: 8, boxShadow: view === 'explore' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          Explore Open Challenges
        </button>
        <button onClick={() => setView('active')} style={{ padding: '10px 24px', background: view === 'active' ? '#fff' : 'transparent', color: view === 'active' ? '#0f172a' : '#64748b', fontWeight: 700, border: 'none', borderRadius: 8, boxShadow: view === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          My Active Challenges
        </button>
      </div>
      
      {view === 'explore' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {challenges.map((c, i) => (
            <div key={c.id} style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ background: c.difficulty === 'Hard' ? '#fee2e2' : c.difficulty === 'Medium' ? '#fef3c7' : '#dcfce7', color: c.difficulty === 'Hard' ? '#b91c1c' : c.difficulty === 'Medium' ? '#b45309' : '#15803d', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{c.difficulty}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0f766e', fontWeight: 800, fontSize: 16 }}><Zap size={18} fill="#0f766e" /> {c.xp} XP</div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{c.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, flex: 1, marginBottom: 24 }}>{c.description}</p>
              <button onClick={() => handleJoin(c.id)} style={{ background: '#10b981', color: '#fff', padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                Accept Challenge <ChevronRight size={18} />
              </button>
            </div>
          ))}
          {challenges.length === 0 && <div style={{ color: '#64748b' }}>No active challenges right now.</div>}
        </div>
      )}

      {view === 'active' && (
        <div style={{ display: 'grid', gap: 24 }}>
          {myChallenges.map((p) => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', gap: 32, alignItems: 'stretch' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>{p.challenge?.title}</h3>
                  <div style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>{p.challenge?.xp} XP Scope</div>
                </div>
                <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>{p.challenge?.description}</p>
                
                {p.approvalStatus === 'Pending' && p.proofUrl ? (
                  <div style={{ background: '#fef3c7', color: '#b45309', padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={20} /> Evidence locked. Operating under managerial review.</div>
                ) : p.approvalStatus === 'Approved' ? (
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={20} /> Challenge completely dominated! XP added to ledger.</div>
                ) : p.approvalStatus === 'Rejected' ? (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: 12, fontWeight: 600 }}>Review Failed: Evidence rejected. Please upload better proof.</div>
                ) : null}
              </div>

              {((!p.proofUrl) || p.approvalStatus === 'Rejected') && (
                <div style={{ width: 350, flexShrink: 0, background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 16, padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                  <input type="file" accept="application/pdf, image/*" onChange={(e) => handleFileUpload(e, p.id)} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                  <UploadCloud size={48} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
                  <div style={{ fontWeight: 600, color: '#0f766e', fontSize: 15, marginBottom: 8 }}>{fileName[p.id] || 'Inject PDF/Image payload here'}</div>
                  <button onClick={(e) => { e.stopPropagation(); handleSubmitProof(p.id); }} disabled={!base64File[p.id] || submittingId === p.id} style={{ position: 'relative', zIndex: 10, marginTop: 12, background: base64File[p.id] ? '#10b981' : '#cbd5e1', color: '#fff', padding: '10px 16px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: base64File[p.id] ? 'pointer' : 'not-allowed', width: '100%' }}>
                    {submittingId === p.id ? 'Deploying...' : 'Transmit Evidence'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {myChallenges.length === 0 && <div style={{ color: '#64748b' }}>You haven't accepted any challenges yet. Explore the network to find one!</div>}
        </div>
      )}
    </div>
  );
}
