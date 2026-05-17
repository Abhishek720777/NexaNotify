import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [channelData, setChannelData] = useState([]);
  const [summary, setSummary] = useState({
    sentToday: 0, failedToday: 0, pendingToday: 0, totalRequestsToday: 0
  });
  const [failedRequests, setFailedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summaryRes = await api.get('/analytics/summary');
      setSummary(summaryRes.data);

      const channelRes = await api.get('/analytics/by-channel');
      const formattedChannelData = [
        { name: 'Email', value: channelRes.data.EMAIL || 0, color: '#3b82f6' },
        { name: 'SMS', value: channelRes.data.SMS || 0, color: '#10b981' },
        { name: 'Push', value: channelRes.data.PUSH || 0, color: '#f59e0b' }
      ].filter(d => d.value > 0);
      
      if (formattedChannelData.length === 0) {
        formattedChannelData.push({ name: 'No Data', value: 1, color: '#2e334d' });
      }
      setChannelData(formattedChannelData);

      // Fetch recent requests to find failures
      const logsRes = await api.get('/logs');
      const failures = logsRes.data.filter(req => req.status === 'FAILED' || req.status === 'ERROR');
      setFailedRequests(failures);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSuccessRate = () => {
    const total = summary.totalRequestsToday || 0;
    const sent = summary.sentToday || 0;
    if (total === 0) return '0.0';
    return ((sent / total) * 100).toFixed(1);
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{ margin: 0 }}>System Analytics</h1>
        <button 
          onClick={fetchData} 
          className="btn-sm" 
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', borderRadius: '6px' }}
        >
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="card-grid" style={{ gap: '1rem', marginBottom: '1.5rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <h3 style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>Total Traffic</h3>
          <div className="value" style={{ fontSize: '1.5rem' }}>{summary.totalRequestsToday}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <h3 style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>Delivery Rate</h3>
          <div className="value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{calculateSuccessRate()}%</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem', borderLeft: summary.failedToday > 0 ? '3px solid var(--danger)' : '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>Total Failures</h3>
          <div className="value" style={{ fontSize: '1.5rem', color: summary.failedToday > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{summary.failedToday}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <h3 style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>Queue Backlog</h3>
          <div className="value" style={{ fontSize: '1.5rem', color: summary.pendingToday > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{summary.pendingToday}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ height: '300px', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery by Channel</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-main)', fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ height: '300px', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Channel Breakdown</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-main)', fontSize: '0.75rem' }} cursor={{ fill: 'var(--bg-panel-hover)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Failure & Root Cause Panel */}
      <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: failedRequests.length > 0 ? 'var(--danger)' : 'var(--success)', display: 'inline-block', boxShadow: failedRequests.length > 0 ? '0 0 8px var(--danger)' : '0 0 8px var(--success)' }} />
            <h3 style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Root Cause Failure Analysis</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{failedRequests.length} Issues Identified</span>
        </div>

        {failedRequests.length > 0 ? (
          <div className="table-container" style={{ background: 'transparent', border: 'none' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '0.75rem', padding: '0.5rem' }}>Request ID</th>
                  <th style={{ fontSize: '0.75rem', padding: '0.5rem' }}>Event</th>
                  <th style={{ fontSize: '0.75rem', padding: '0.5rem' }}>User Context</th>
                  <th style={{ fontSize: '0.75rem', padding: '0.5rem' }}>Reason / Status</th>
                  <th style={{ fontSize: '0.75rem', padding: '0.5rem' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {failedRequests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontSize: '0.8rem', padding: '0.5rem', fontWeight: 600 }}>#{req.id}</td>
                    <td style={{ fontSize: '0.8rem', padding: '0.5rem' }}><code>{req.eventName}</code></td>
                    <td style={{ fontSize: '0.8rem', padding: '0.5rem', color: 'var(--text-muted)' }}>
                      {req.user ? `${req.user.email || req.user.phone} (${req.user.externalUserId})` : 'Unknown / Missing User'}
                    </td>
                    <td style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                      <span className="badge danger" style={{ fontSize: '0.7rem' }}>
                        {req.status === 'ERROR' ? 'Internal Error' : 'Template/User Missing'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', padding: '0.5rem', color: 'var(--text-muted)' }}>
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px', border: '1px dashed rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>🎉 All Channels Operating Normatively</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No failed notification requests registered in the current logging window.</div>
          </div>
        )}
      </div>
    </div>
  );
}
