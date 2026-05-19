import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Logs() {
  const [requests, setRequests] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [date, page]);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/logs?date=${date}&page=${page}&size=10`);
      setRequests(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!details[id]) {
      try {
        const res = await api.get(`/logs/${id}`);
        setDetails({...details, [id]: res.data});
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      COMPLETED: 'success', QUEUED: 'info', FAILED: 'danger', PARTIALLY_FAILED: 'warning',
      SUPPRESSED: 'warning', ERROR: 'danger', PROCESSING: 'info',
      SENT: 'success', PENDING: 'info', RETRYING: 'warning', DEAD: 'danger'
    };
    return `badge ${map[status] || 'info'}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title" style={{margin: 0}}>Notification Logs</h1>
        <div className="flex gap-4 items-center">
          <input 
            type="date" 
            value={date} 
            onChange={(e) => { setDate(e.target.value); setPage(0); }} 
            style={{padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)'}}
          />
          <div className="flex gap-2">
            <button className="btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span style={{color: 'var(--ink-3)', fontSize: '0.875rem', alignSelf: 'center'}}>Page {page + 1} of {Math.max(1, totalPages)}</span>
            <button className="btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>User ID</th>
              <th>Event</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <React.Fragment key={req.id}>
                <tr style={{cursor: 'pointer'}} onClick={() => handleExpand(req.id)}>
                  <td>#{req.id}</td>
                  <td>{req.user?.externalUserId}</td>
                  <td>{req.eventName}</td>
                  <td><span className={getStatusBadge(req.status)}>{req.status}</span></td>
                  <td>{new Date(req.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                </tr>
                {expandedId === req.id && (
                  <tr>
                    <td colSpan="5" style={{background: 'var(--bg)', padding: '1rem 2rem'}}>
                      <h4 style={{marginBottom: '1rem', color: 'var(--ink-3)'}}>Delivery Attempts</h4>
                      {details[req.id] ? (
                        <table style={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden'}}>
                          <thead>
                            <tr>
                              <th>Channel</th>
                              <th>Status</th>
                              <th>Attempts</th>
                              <th>Last Attempt</th>
                              <th>Provider Response</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details[req.id].map(log => (
                              <tr key={log.id}>
                                <td>{log.channel}</td>
                                <td><span className={getStatusBadge(log.status)}>{log.status}</span></td>
                                <td>{log.attemptCount}</td>
                                <td>{new Date(log.lastAttemptedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                <td><span style={{fontSize: '0.75rem'}}>{log.providerResponse || '-'}</span></td>
                              </tr>
                            ))}
                            {details[req.id].length === 0 && (
                              <tr><td colSpan="5">No delivery logs found.</td></tr>
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <div>Loading...</div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
