import React, { useState, useEffect } from 'react';
import { governanceApi } from '../../api/governance';

export default function Audits() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const data = await governanceApi.getAudits();
      setAudits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading Audit Logs...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>ESG Audits</h1>
      
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', fontSize: 14 }}>Audit Title</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', fontSize: 14 }}>Auditor / Lead</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', fontSize: 14 }}>Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', fontSize: 14 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {audits.map(audit => (
              <tr key={audit.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 20px', fontWeight: 500, color: '#0f172a' }}>{audit.title}</td>
                <td style={{ padding: '16px 20px', color: '#475569' }}>{audit.auditor_name || audit.auditorName || 'External'}</td>
                <td style={{ padding: '16px 20px', color: '#475569' }}>{new Date(audit.date).toLocaleDateString()}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: audit.status === 'Completed' ? '#dcfce7' : '#fef08a',
                    color: audit.status === 'Completed' ? '#166534' : '#854d0e'
                  }}>
                    {audit.status}
                  </span>
                </td>
              </tr>
            ))}
            {audits.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No ESG audits established yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
