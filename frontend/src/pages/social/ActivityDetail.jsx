import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socialApi } from '../../api/social';

export default function ActivityDetail() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [proofType, setProofType] = useState('link'); // 'link' or 'pdf'
  const [proofUrl, setProofUrl] = useState('');
  const [base64File, setBase64File] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      const data = await socialApi.getActivityById(activityId);
      setActivity(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64File(reader.result); // Base64 data string encoding embedded seamlessly
    };
    reader.readAsDataURL(file);
  };

  const handleJoin = async () => {
    setSubmitting(true);
    try {
      const finalProof = proofType === 'link' ? proofUrl : base64File;
      
      await socialApi.logParticipation({ 
        csrActivityId: activity.id,
        proofUrl: finalProof 
      });
      alert('Proof submitted successfully! Awaiting manager approval.');
      navigate('/social/activities');
    } catch (err) {
      alert(`Error submitting proof: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading details...</div>;
  if (!activity) return <div style={{ padding: 40, color: '#ef4444' }}>Activity not found!</div>;

  const getBannerUrl = (title) => {
    if (!title) return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=80';
    const t = title.toLowerCase();
    if (t.includes('blood')) return 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1600&q=80';
    if (t.includes('beach')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80';
    if (t.includes('workshop')) return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80';
    return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=80';
  };

  return (
    <div>
      {/* Immersive Image Header loaded procedurally via Unsplash standard integration */}
      <div style={{ width: '100%', height: 320, background: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8)), url(${getBannerUrl(activity.title)})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: 40 }}>
        <div>
          <span style={{ background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'inline-block' }}>
            {activity.category?.name || 'CSR Event'}
          </span>
          <h1 style={{ color: '#fff', fontSize: 40, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>{activity.title}</h1>
          <div style={{ color: '#cbd5e1', fontSize: 16, fontWeight: 500 }}>System Status: {activity.status}</div>
        </div>
      </div>
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* About Initiative */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>About This Initiative</h2>
          <p style={{ fontSize: 16, color: '#334155', lineHeight: 1.7, background: '#f8fafc', padding: 32, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            {activity.description}
          </p>
        </div>
        
        {/* Join Widget Container */}
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f766e', marginBottom: 24, textAlign: 'center' }}>Submit Your Evidence</h2>
          
          {/* Dual Submission Mode Toggle */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28, padding: 4, background: '#f1f5f9', borderRadius: 8 }}>
            <button 
              onClick={() => setProofType('link')}
              style={{ flex: 1, padding: '12px', background: proofType === 'link' ? '#fff' : 'transparent', color: proofType === 'link' ? '#0f172a' : '#64748b', fontWeight: 600, border: 'none', borderRadius: 6, boxShadow: proofType === 'link' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: 15 }}
            >
              Provide External URL
            </button>
            <button 
              onClick={() => setProofType('pdf')}
              style={{ flex: 1, padding: '12px', background: proofType === 'pdf' ? '#fff' : 'transparent', color: proofType === 'pdf' ? '#0f172a' : '#64748b', fontWeight: 600, border: 'none', borderRadius: 6, boxShadow: proofType === 'pdf' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: 15 }}
            >
              Upload PDF Document
            </button>
          </div>
          
          {proofType === 'link' ? (
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#475569' }}>Evidence Link (Photo URL, Webpage, etc.)</label>
              <input 
                type="url" 
                placeholder="https://..." 
                value={proofUrl} 
                onChange={(e) => setProofUrl(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 8, border: '2px solid #e2e8f0', outline: 'none', fontSize: 16, background: '#f8fafc' }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#475569' }}>Upload PDF / Image Proof</label>
              <div style={{ border: '2px dashed #cbd5e1', padding: 40, borderRadius: 8, textAlign: 'center', background: '#f8fafc', position: 'relative', transition: 'background 0.2s' }}
                   onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                   onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>
                <input 
                  type="file" 
                  accept="application/pdf, image/*"
                  onChange={handleFileUpload}
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
                <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
                <div style={{ fontWeight: 600, color: '#0f766e', fontSize: 16 }}>{fileName || 'Click here to upload your file'}</div>
                {!fileName && <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>Supports .PDF, .PNG, .JPG</div>}
              </div>
            </div>
          )}
          
          <button 
            onClick={handleJoin}
            disabled={submitting || (proofType === 'link' ? !proofUrl : !base64File)}
            style={{ width: '100%', padding: 18, borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 16, fontWeight: 700, cursor: (submitting || (proofType === 'link' ? !proofUrl : !base64File)) ? 'not-allowed' : 'pointer', opacity: (submitting || (proofType === 'link' ? !proofUrl : !base64File)) ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)' }}
          >
            {submitting ? 'Authenticating & Submitting...' : 'Submit & Join Initiative'}
          </button>
        </div>
      </div>
    </div>
  );
}
