import React, { useState, useEffect } from 'react';
import { governanceApi } from '../../api/governance';

export default function Compliance() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      // Inline overdrive checks are calculated by backend Controller as per plan
      const data = await governanceApi.getComplianceIssues();
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await governanceApi.updateComplianceIssue(id, 'Resolved');
      setIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status: 'Resolved', isOverdue: false } : issue));
    } catch (err) {
      alert(`Error updating issue: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading Compliance Issues...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Compliance Tracking</h1>
      
      <div style={{ display: 'grid', gap: 16 }}>
        {issues.map(issue => (
          <div key={issue.id} style={{ 
            background: '#fff', padding: 24, borderRadius: 8, 
            borderLeft: `4px solid ${issue.status === 'Resolved' ? '#10b981' : (issue.isOverdue || issue.is_overdue) ? '#ef4444' : '#f59e0b'}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{issue.title}</h3>
                {(issue.isOverdue || issue.is_overdue) && (
                  <span style={{ fontSize: 12, background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                    OVERDUE
                  </span>
                )}
              </div>
              <div>
                <span style={{ fontSize: 14, color: '#64748b' }}>Due: {new Date(issue.dueDate || issue.due_date).toLocaleDateString()}</span>
              </div>
            </div>
            
            <p style={{ color: '#475569', marginBottom: 20 }}>{issue.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
              <div style={{ fontSize: 14, color: '#64748b' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Severity:</span> {issue.severity} &nbsp;|&nbsp; 
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Status:</span> {issue.status}
              </div>
              {issue.status === 'Open' && (
                <button 
                  onClick={() => handleResolve(issue.id)}
                  style={{ background: '#10b981', color: '#fff', padding: '6px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        ))}
        {issues.length === 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 24, borderRadius: 8, color: '#166534' }}>
            <strong>Excellent news!</strong> No compliance issues are currently recorded on the network.
          </div>
        )}
      </div>
    </div>
  );
}
