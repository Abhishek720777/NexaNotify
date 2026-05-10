import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [channelData, setChannelData] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  const calculateSuccessRate = () => {
    const total = summary.totalRequestsToday || 0;
    const sent = summary.sentToday || 0;
    if (total === 0) return 0;
    return ((sent / total) * 100).toFixed(1);
  };

  return (
    <div>
      <h1 className="page-title">Detailed Analytics</h1>

      <div className="card-grid">
        <div className="card">
          <h3>Delivery Success Rate</h3>
          <div className="value" style={{color: 'var(--success)'}}>{calculateSuccessRate()}%</div>
        </div>
        <div className="card">
          <h3>Total Failed</h3>
          <div className="value" style={{color: 'var(--danger)'}}>{summary.failedToday || 0}</div>
        </div>
      </div>

      <div className="grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
        <div className="card" style={{height: '400px'}}>
          <h3 style={{marginBottom: '1rem'}}>Delivery by Channel</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{height: '400px'}}>
          <h3 style={{marginBottom: '1rem'}}>Channel Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData}>
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)'}} cursor={{fill: 'var(--bg-panel-hover)'}} />
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
  );
}
