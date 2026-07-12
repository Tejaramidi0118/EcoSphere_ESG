import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, Award, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { request } from '../api/client';

export default function Reports() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState({ totalCo2: 0, transactionCount: 0, transactions: [], goals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedDept, dateFrom, dateTo]);

  const fetchDepartments = async () => {
    try {
      const data = await request('/departments');
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let path = '/reports/environmental';
      const params = [];
      if (selectedDept) params.push(`department_id=${selectedDept}`);
      if (dateFrom) params.push(`from=${dateFrom}`);
      if (dateTo) params.push(`to=${dateTo}`);
      if (params.length > 0) path += `?${params.join('&')}`;

      const data = await request(path);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Department', 'Source Type', 'Emission Factor', 'Quantity', 'CO2 Calculated (kg)'];
    const rows = reportData.transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.department?.name || 'Unknown',
      t.sourceType,
      t.emissionFactor?.name || 'Unknown',
      `${t.quantity} ${t.emissionFactor?.unit || ''}`,
      t.co2Calculated.toFixed(2)
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EcoSphere_ESG_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const selectedDeptName = departments.find(d => d.id === Number(selectedDept))?.name || 'All Departments';
    const printWindow = window.open('', '_blank');
    
    const transactionsHtml = reportData.transactions.map(t => `
      <tr>
        <td>${new Date(t.date).toLocaleDateString()}</td>
        <td>${t.department?.name || 'Unknown'}</td>
        <td>${t.sourceType}</td>
        <td>${t.emissionFactor?.name || 'Unknown'}</td>
        <td>${t.quantity} ${t.emissionFactor?.unit || ''}</td>
        <td style="text-align: right; font-weight: bold; color: #1f4d3a;">${t.co2Calculated.toFixed(2)}</td>
      </tr>
    `).join('');

    const goalsHtml = reportData.goals.map(g => `
      <tr>
        <td>${g.name}</td>
        <td>${g.department?.name || 'Unknown'}</td>
        <td>${g.targetCo2} kg</td>
        <td>${g.currentCo2.toFixed(2)} kg</td>
        <td>${new Date(g.deadline).toLocaleDateString()}</td>
        <td>${g.status}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>EcoSphere ESG Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 40px; background: #fff; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 26px; font-weight: 800; color: #1f4d3a; margin: 0; }
            .meta { font-size: 13px; color: #64748b; text-align: right; line-height: 1.5; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .metric-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc; }
            .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; font-weight: 700; }
            .metric-val { font-size: 22px; font-weight: 800; color: #0f172a; }
            h2 { font-size: 18px; color: #1f4d3a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
            th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 11px; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">EcoSphere ESG Environmental Report</h1>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Organization Scoped Carbon Ledger</p>
            </div>
            <div class="meta">
              <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Department Scope:</strong> ${selectedDeptName}</div>
              ${dateFrom ? `<div><strong>Date Filter:</strong> ${dateFrom} to ${dateTo || 'Present'}</div>` : ''}
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Total Carbon Emissions</div>
              <div class="metric-val">${reportData.totalCo2.toFixed(2)} kg CO2e</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Transactions Count</div>
              <div class="metric-val">${reportData.transactionCount} entries</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Monitored Goals</div>
              <div class="metric-val">${reportData.goals.length} active</div>
            </div>
          </div>

          <h2>Carbon Transaction Log</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Department</th>
                <th>Source</th>
                <th>Emission Factor</th>
                <th>Quantity</th>
                <th style="text-align: right;">CO2 (kg)</th>
              </tr>
            </thead>
            <tbody>
              ${transactionsHtml || '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding: 24px;">No transactions found for the selected filter criteria.</td></tr>'}
            </tbody>
          </table>

          <h2>Active Reduction Goals</h2>
          <table>
            <thead>
              <tr>
                <th>Goal Name</th>
                <th>Department</th>
                <th>Target CO2</th>
                <th>Current CO2</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${goalsHtml || '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding: 24px;">No goals monitored for the selected filter criteria.</td></tr>'}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Build chart data representing emission by source/type
  const getChartData = () => {
    const map = {};
    reportData.transactions.forEach(t => {
      map[t.sourceType] = (map[t.sourceType] || 0) + t.co2Calculated;
    });
    return Object.keys(map).map(k => ({ name: k, Emissions: Math.round(map[k]) }));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      {/* Title */}
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--text)', letterSpacing: '-0.02em' }}>
        ESG Environmental Reports
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
        Generate custom carbon footprint ledgers, track department targets, and download audit-ready compliance datasets.
      </p>

      {/* Filter Card */}
      <form onSubmit={handleFilter} style={{
        background: 'var(--card-bg)',
        borderRadius: 16,
        padding: 24,
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        marginBottom: 32,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.05em' }}>Department Scope</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontWeight: 500 }}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.05em' }}>Start Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.05em' }}>End Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }}
          />
        </div>

        <div>
          <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', background: 'var(--forest-light)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
            <Filter size={16} /> Filter Dataset
          </button>
        </div>
      </form>

      {loading ? (
        <div style={{ padding: 40, color: 'var(--text-secondary)', textAlign: 'center' }}>Compiling ledger data...</div>
      ) : (
        <>
          {/* Export Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 24 }}>
            <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card-bg)', color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
              <Download size={15} /> Export CSV
            </button>
            <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card-bg)', color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
              <FileText size={15} /> Export PDF
            </button>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 12, background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: 12 }}><Activity size={24} /></div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700 }}>Total CO2 Footprint</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>{reportData.totalCo2.toFixed(2)} kg</div>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 12, background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: 12 }}><Calendar size={24} /></div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700 }}>Registered Transactions</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>{reportData.transactionCount} entries</div>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 12, background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderRadius: 12 }}><Award size={24} /></div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700 }}>Monitored Goals</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>{reportData.goals.length} active</div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          {reportData.transactions.length > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Emissions Breakdown by Source (kg CO2e)</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                    <Bar dataKey="Emissions" fill="var(--forest-light)" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Carbon Transaction Log Ledger</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '14px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '14px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Department</th>
                  <th style={{ padding: '14px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Source</th>
                  <th style={{ padding: '14px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Factor</th>
                  <th style={{ padding: '14px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Quantity</th>
                  <th style={{ padding: '14px 24px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', textAlign: 'right' }}>CO2 (kg)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', color: 'var(--text)', fontSize: 14 }}>
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>
                      {t.department?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text)', fontSize: 14 }}>
                      {t.sourceType}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: 13 }}>
                      {t.emissionFactor?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text)', fontSize: 14 }}>
                      {t.quantity} {t.emissionFactor?.unit || ''}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text)', fontSize: 14, fontWeight: 700, textAlign: 'right', color: 'var(--forest-light)' }}>
                      {t.co2Calculated.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {reportData.transactions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 15 }}>
                      No environmental ledger records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
