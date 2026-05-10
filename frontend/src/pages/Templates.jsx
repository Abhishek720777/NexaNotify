import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ eventName: '', channel: 'EMAIL', subject: '', body: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/templates', formData);
      setIsModalOpen(false);
      setFormData({ eventName: '', channel: 'EMAIL', subject: '', body: '' });
      fetchTemplates();
    } catch (err) {
      alert('Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to deactivate this template?')) {
      try {
        await api.delete(`/templates/${id}`);
        fetchTemplates();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{margin: 0}}>Templates</h1>
        <button className="btn-primary" style={{width: 'auto'}} onClick={() => setIsModalOpen(true)}>
          + Create Template
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{width: '500px'}}>
            <h2 style={{marginBottom: '1rem'}}>Create Template</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event Name</label>
                <input required value={formData.eventName} onChange={(e) => setFormData({...formData, eventName: e.target.value})} placeholder="e.g. ORDER_SHIPPED" />
              </div>
              <div className="form-group">
                <label>Channel</label>
                <select value={formData.channel} onChange={(e) => setFormData({...formData, channel: e.target.value})}>
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">Push Notification</option>
                </select>
              </div>
              {formData.channel === 'EMAIL' && (
                <div className="form-group">
                  <label>Subject</label>
                  <input required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                </div>
              )}
              <div className="form-group">
                <label>Body (Freemarker Syntax)</label>
                <textarea required rows="5" value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} placeholder="Hello ${name}, your order is shipped!" />
              </div>
              <div className="flex gap-4">
                <button type="button" className="btn-primary" style={{background: 'var(--bg-panel-hover)'}} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{t.eventName}</td>
                <td><span className="badge info">{t.channel}</span></td>
                <td>
                  <span className={`badge ${t.active ? 'success' : 'danger'}`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {t.active && (
                    <button className="btn-sm btn-primary" style={{background: 'var(--danger)'}} onClick={() => handleDelete(t.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No templates found. Create one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
