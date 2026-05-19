import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    sentToday: 0, failedToday: 0, pendingToday: 0, totalRequestsToday: 0
  });
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchData();
  }, [date, page]);

  const fetchData = async () => {
    try {
      const summaryRes = await api.get(`/analytics/summary?date=${date}`);
      setSummary(summaryRes.data);

      const logsRes = await api.get(`/logs?date=${date}&page=${page}&size=5`);
      setLogs(logsRes.data.content || []);
      setTotalPages(logsRes.data.totalPages || 0);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title" style={{margin: 0}}>Dashboard Overview</h1>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => { setDate(e.target.value); setPage(0); }} 
          style={{padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)'}}
        />
      </div>
      
      <div className="card-grid">
        <div className="card">
          <h3>Total Requests</h3>
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
        <div className="flex justify-between items-center" style={{padding: '1.5rem', borderBottom: '1px solid var(--border)'}}>
          <h3 style={{margin: 0}}>Notification Requests</h3>
          <div className="flex gap-2">
            <button className="btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span style={{color: 'var(--ink-3)', fontSize: '0.875rem', alignSelf: 'center'}}>Page {page + 1} of {Math.max(1, totalPages)}</span>
            <button className="btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
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
                <td>{new Date(log.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', color: 'var(--ink-3)'}}>No recent requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
