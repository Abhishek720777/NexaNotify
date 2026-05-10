import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Logs() {
  const [requests, setRequests] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs');
      setRequests(res.data);
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
      <h1 className="page-title">Notification Logs</h1>
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
                  <td>{new Date(req.createdAt).toLocaleString()}</td>
                </tr>
                {expandedId === req.id && (
                  <tr>
                    <td colSpan="5" style={{background: 'var(--bg-dark)', padding: '1rem 2rem'}}>
                      <h4 style={{marginBottom: '1rem', color: 'var(--text-muted)'}}>Delivery Attempts</h4>
                      {details[req.id] ? (
                        <table style={{background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px'}}>
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
                                <td>{new Date(log.lastAttemptedAt).toLocaleString()}</td>
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
