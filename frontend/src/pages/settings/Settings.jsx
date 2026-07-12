import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../api/settings';

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [conf, depts] = await Promise.all([
        settingsApi.getEsgConfig(),
        settingsApi.getDepartments()
      ]);
      setConfig(conf);
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedConfig = await settingsApi.updateEsgConfig(config);
      setConfig(updatedConfig);
      alert('Settings saved successfully!');
    } catch (err) {
      alert(`Error saving: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) return <div style={{ padding: 32 }}>Loading ESG Configs...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>System Settings & Parameters</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>ESG Weights Configuration</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>Environmental Weight (%)</label>
              <input 
                type="number" 
                value={config.weights?.env || 40}
                onChange={e => setConfig({...config, weights: {...config.weights, env: Number(e.target.value)}})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>Social Weight (%)</label>
              <input 
                type="number" 
                value={config.weights?.social || 30}
                onChange={e => setConfig({...config, weights: {...config.weights, social: Number(e.target.value)}})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>Governance Weight (%)</label>
              <input 
                type="number" 
                value={config.weights?.gov || 30}
                onChange={e => setConfig({...config, weights: {...config.weights, gov: Number(e.target.value)}})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }}
              />
            </div>
            
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#475569' }}>
                <input 
                  type="checkbox" 
                  checked={config.auto_emission_calc}
                  onChange={e => setConfig({...config, auto_emission_calc: e.target.checked})}
                />
                Auto-calculate carbon emissions on POST
              </label>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#475569' }}>
                <input 
                  type="checkbox" 
                  checked={config.auto_badge_award}
                  onChange={e => setConfig({...config, auto_badge_award: e.target.checked})}
                />
                Trigger Auto-award badge engine on XP events
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={saving}
              style={{ background: '#0f766e', color: '#fff', padding: '10px', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, marginTop: 12 }}
            >
              {saving ? 'Saving Config...' : 'Apply Weight Configurations'}
            </button>
          </form>
        </div>

        <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Departments Base Data (Read-Only)</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {departments.map(d => (
              <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 500, color: '#0f172a' }}>{d.name}</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>Code: {d.code}</span>
              </li>
            ))}
            {departments.length === 0 && <p style={{ color: '#64748b' }}>No departments loaded.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
