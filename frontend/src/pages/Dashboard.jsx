import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    sentToday: 0, failedToday: 0, pendingToday: 0, totalRequestsToday: 0
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const summaryRes = await api.get('/analytics/summary');
      setSummary(summaryRes.data);

      const logsRes = await api.get('/logs');
      setLogs(logsRes.data.slice(0, 5)); // Just show 5 recent
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      COMPLETED: 'success',
      PROCESSING: 'info',
      FAILED: 'danger',
      PARTIALLY_FAILED: 'warning'
    };
    return `badge ${map[status] || 'info'}`;
  };

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="card-grid">
        <div className="card">
          <h3>Total Requests Today</h3>
          <div className="value">{summary.totalRequestsToday}</div>
        </div>
        <div className="card">
          <h3>Sent Successfully</h3>
          <div className="value" style={{color: 'var(--success)'}}>{summary.sentToday}</div>
        </div>
        <div className="card">
          <h3>Failed / Dead</h3>
          <div className="value" style={{color: 'var(--danger)'}}>{summary.failedToday}</div>
        </div>
        <div className="card">
          <h3>Pending / Retrying</h3>
          <div className="value" style={{color: 'var(--warning)'}}>{summary.pendingToday}</div>
        </div>
      </div>

      <div className="table-container mt-4">
        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--border)'}}>
          <h3 style={{margin: 0}}>Recent Notification Requests</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>User ID</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>#{log.id}</td>
                <td>{log.eventName}</td>
                <td>{log.user?.externalUserId}</td>
                <td><span className={getStatusBadge(log.status)}>{log.status}</span></td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No recent requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
