import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const AVAILABLE_VARIABLES = [
  '${name}', '${email}', '${phone}', '${orderId}', '${total}', '${items}', '${otpCode}', '${discount}', '${brandLogo}', '${brandColor}', '${clientName}'
];

const PRO_TEMPLATES = {
  'Branded Order Confirmation': {
    subject: 'Your order ${orderId} from ${clientName} has been confirmed!',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
  <div style="text-align: center; padding-bottom: 20px;">
    <img src="\${brandLogo}" style="height: 50px;" alt="\${clientName}" />
    <h2 style="color: \${brandColor};">\${clientName}</h2>
  </div>
  <h1>Order Confirmed!</h1>
  <p>Hello \${name},</p>
  <p>Thank you for shopping with <strong>\${clientName}</strong>. We've received your order and are getting it ready for shipment.</p>
  <div style="background:#f9fafb; padding:20px; border-radius:8px;">
    <p style="margin:0; color:#6b7280; font-size:14px;">ORDER NUMBER</p>
    <p style="margin:0; font-weight:bold; font-size:18px; color:#111827;">\${orderId}</p>
    <p style="margin:20px 0 0 0; color:#6b7280; font-size:14px;">TOTAL AMOUNT</p>
    <p style="margin:0; font-weight:bold; font-size:18px; color: \${brandColor};">\${total}</p>
  </div>
  <p style="margin-top: 20px;">You can track your order status in your account dashboard.</p>
  <div style="text-align: center; margin-top: 30px;">
    <a href="#" style="background-color: \${brandColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order Details</a>
  </div>
</div>`
  },
  'Welcome Email': {
    subject: 'Welcome to ${clientName}, ${name}!',
    body: `<div style="text-align: center; font-family: sans-serif;">
  <img src="\${brandLogo}" style="height: 60px;" />
  <h1 style="color: \${brandColor};">Welcome to the Family!</h1>
  <p>Hi \${name},</p>
  <p>We are thrilled to have you as a member of <strong>\${clientName}</strong>. You now have access to exclusive drops and priority support.</p>
  <div style="padding:30px 0;">
    <p style="font-size:18px; font-weight:bold;">Special Gift For You</p>
    <p>Use code <strong>WELCOME10</strong> for 10% off your next purchase.</p>
    <a href="#" style="display: inline-block; background: \${brandColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Start Shopping</a>
  </div>
</div>`
  }
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('design'); // 'design' or 'branding'
  const [formData, setFormData] = useState({ 
    eventName: '', channel: 'EMAIL', subject: '', body: '',
    logoUrl: '', primaryColor: '#6366f1' 
  });
  const [previewData, setPreviewData] = useState({ name: 'John Doe', orderId: 'ORD-123', total: '$199.99' });
  const [testModal, setTestModal] = useState(null); // template object being tested
  const [testForm, setTestForm] = useState({ to: '', mockJson: '{"name": "John Doe", "orderId": "ORD-123"}' });
  const [testStatus, setTestStatus] = useState(null); // { type: 'success'|'error', msg }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, logoUrl: res.data.url });
    } catch (err) {
      alert('Upload failed');
    }
  };

  const insertVariable = (variable) => {
    setFormData({ ...formData, body: formData.body + variable });
  };

  const renderPreview = () => {
    let html = formData.body;
    const finalLogo = formData.logoUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    const finalColor = formData.primaryColor;

    // Simple regex replacement
    const data = { ...previewData, brandLogo: finalLogo, brandColor: finalColor, clientName: 'Your Brand' };
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      html = html.replace(regex, data[key]);
    });
    return html;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/templates/${formData.id}`, formData);
      } else {
        await api.post('/templates', formData);
      }
      setIsModalOpen(false);
      setFormData({ 
        eventName: '', channel: 'EMAIL', subject: '', body: '',
        logoUrl: '', primaryColor: '#6366f1' 
      });
      fetchTemplates();
    } catch (err) {
      alert('Failed to save template');
    }
  };

  const handleEdit = (t) => {
    setFormData({
      id: t.id,
      eventName: t.eventName,
      channel: t.channel,
      subject: t.subject || '',
      body: t.body,
      logoUrl: t.logoUrl || '',
      primaryColor: t.primaryColor || '#6366f1'
    });
    setActiveTab('design');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (t) => {
    try {
      await api.put(`/templates/${t.id}`, { ...t, active: !t.active });
      fetchTemplates();
    } catch (err) {
      alert('Failed to update template status');
    }
  };

  const handleSendTest = async () => {
    setTestStatus(null);
    let mockData = {};
    try { mockData = JSON.parse(testForm.mockJson); } catch { return setTestStatus({ type: 'error', msg: 'Invalid JSON in mock data.' }); }
    try {
      await api.post('/templates/test', {
        channel: testModal.channel,
        to: testForm.to,
        subject: testModal.subject,
        body: testModal.body,
        mockData
      });
      setTestStatus({ type: 'success', msg: `Test ${testModal.channel} queued to ${testForm.to}!` });
    } catch (err) {
      setTestStatus({ type: 'error', msg: 'Failed to queue test notification.' });
    }
  };

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="sleek-spinner"></div>
        <div className="loader-text">Loading message templates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title" style={{margin: 0}}>Notification Templates</h1>
        <button className="btn-primary" style={{width: 'auto'}} onClick={() => { 
          setFormData({ eventName: '', channel: 'EMAIL', subject: '', body: '', logoUrl: '', primaryColor: '#6366f1' });
          setIsModalOpen(true); 
          setActiveTab('design'); 
        }}>
          + Create New Template
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="card" style={{width: '1000px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('design')}
                  style={{background: 'transparent', border: 'none', color: activeTab === 'design' ? 'var(--accent)' : 'var(--ink-3)', fontWeight: 700, cursor: 'pointer', fontSize: '1.2rem', borderBottom: activeTab === 'design' ? '2px solid var(--accent)' : 'none', paddingBottom: '5px'}}
                >
                  1. Design Template
                </button>
                <button 
                  onClick={() => setActiveTab('branding')}
                  style={{background: 'transparent', border: 'none', color: activeTab === 'branding' ? 'var(--accent)' : 'var(--ink-3)', fontWeight: 700, cursor: 'pointer', fontSize: '1.2rem', borderBottom: activeTab === 'branding' ? '2px solid var(--accent)' : 'none', paddingBottom: '5px'}}
                >
                  2. Project Branding
                </button>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{background: 'transparent', border: 'none', color: 'var(--ink)', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
            </div>

            <div className="template-form">
              <div className="template-editor-grid">
                {/* Left Side: Dynamic based on Tab */}
                <div className="editor-side">
                  {activeTab === 'design' ? (
                    <>
                      <div className="flex gap-4 mb-4">
                        <div className="form-group" style={{flex: 1}}>
                          <label>Event Name</label>
                          <input required value={formData.eventName} onChange={(e) => setFormData({...formData, eventName: e.target.value})} placeholder="e.g. order_shipped" />
                        </div>
                        <div className="form-group" style={{width: '200px'}}>
                          <label>Channel</label>
                          <select value={formData.channel} onChange={(e) => setFormData({...formData, channel: e.target.value})}>
                            <option value="EMAIL">Email (HTML)</option>
                            <option value="SMS">SMS (Text)</option>
                            <option value="PUSH">Push (Text)</option>
                          </select>
                        </div>
                      </div>

                      {formData.channel === 'EMAIL' && (
                        <div className="form-group">
                          <label>Subject Line</label>
                          <input required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="Your order has been shipped!" />
                        </div>
                      )}

                      <div className="form-group">
                        <label>Common Variables (Click to insert)</label>
                        <div className="variable-chips">
                          {AVAILABLE_VARIABLES.map(v => (
                            <span key={v} className="chip" onClick={() => insertVariable(v)}>{v}</span>
                          ))}
                        </div>
                        <label>Template Body (Freemarker/HTML)</label>
                        <textarea 
                          required 
                          rows="10" 
                          style={{fontFamily: 'monospace', fontSize: '0.875rem'}}
                          value={formData.body} 
                          onChange={(e) => setFormData({...formData, body: e.target.value})} 
                          placeholder="<h1>Hello ${name}</h1>..." 
                        />
                      </div>
                    </>
                  ) : (
                    <div className="branding-controls">
                      <div className="form-group">
                        <label>Project Logo</label>
                        <div style={{display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)'}}>
                          <img 
                            src={formData.logoUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'} 
                            style={{height: '50px', background: '#fff', padding: '5px', borderRadius: '4px', maxWidth: '80px', objectFit: 'contain'}} 
                            alt="Logo" 
                            onError={(e) => { e.target.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'; }}
                          />
                          <div style={{flex: 1}}>
                            <input type="file" onChange={handleFileUpload} accept="image/*" style={{fontSize: '0.75rem'}} />
                            <div style={{margin: '8px 0', fontSize: '0.8rem', color: '#666', textAlign: 'center'}}>— OR —</div>
                            <input 
                              type="text" 
                              value={formData.logoUrl} 
                              onChange={(e) => setFormData({...formData, logoUrl: e.target.value})} 
                              placeholder="Paste public logo URL (e.g. https://...)" 
                              style={{fontSize: '0.8rem', padding: '6px 10px', width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--ink)'}}
                            />
                            <p style={{fontSize: '0.7rem', color: 'var(--ink-2)', marginTop: '5px'}}>Upload a logo file or paste a public image URL to use via {"${brandLogo}"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Primary Brand Color</label>
                        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                          <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} style={{height: '50px', width: '100px', padding: '0'}} />
                          <input type="text" value={formData.primaryColor} onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} style={{flex: 1}} />
                        </div>
                        <p style={{fontSize: '0.7rem', color: '#666', marginTop: '5px'}}>Use this color in your styles via {"${brandColor}"}</p>
                      </div>
                      <div className="form-group">
                        <label>Branding Helper</label>
                        <div style={{fontSize: '0.875rem', color: 'var(--ink-2)', background: 'var(--bg)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border)'}}>
                          Use these in your HTML:
                          <code style={{display: 'block', marginTop: '5px', color: 'var(--accent)'}}>{"<img src=\"${brandLogo}\" />"}</code>
                          <code style={{display: 'block', marginTop: '5px', color: 'var(--accent)'}}>{"<h1 style=\"color: ${brandColor}\">Hello</h1>"}</code>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-4" style={{marginTop: 'auto', paddingTop: '1rem'}}>
                    {activeTab === 'branding' && <button type="button" className="btn-ghost" onClick={() => setActiveTab('design')}>Back to Design</button>}
                    {activeTab === 'design' ? (
                      <button type="button" className="btn-primary" onClick={() => setActiveTab('branding')}>Next: Add Branding Assets</button>
                    ) : (
                      <button type="button" className="btn-primary" style={{flex: 1}} onClick={handleSubmit}>
                        {formData.id ? 'Update Template' : 'Finalize & Save Template'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Persistent Preview */}
                <div className="preview-side">
                  <label className="flex justify-between" style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span>Live Rendering Preview</span>
                    <span className="badge info">{formData.channel} Mode</span>
                  </label>
                  <div className="preview-container" style={{maxHeight: '600px'}}>
                    {formData.channel === 'EMAIL' ? (
                      <div dangerouslySetInnerHTML={{ __html: renderPreview() || '<p style="color:#999">Start designing to see preview...</p>' }} />
                    ) : (
                      <div style={{fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>
                        {renderPreview() || 'Start designing to see preview...'}
                      </div>
                    )}
                  </div>
                  <p style={{fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: '1rem'}}>
                    This preview uses your project-specific logo and brand color variables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEND TEST MODAL ── */}
      {testModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className="card" style={{ width: '480px', maxWidth: '95vw', padding: '2rem' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0 }}>Send Test Notification</h3>
              <button onClick={() => { setTestModal(null); setTestStatus(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--ink)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--accent-bg)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent)' }}>
              Template: <strong>{testModal.eventName}</strong> &nbsp;|&nbsp; Channel: <strong>{testModal.channel}</strong> &nbsp;|&nbsp; v{testModal.version || 1}
            </div>
            <label className="form-label">Destination ({testModal.channel === 'EMAIL' ? 'Email address' : testModal.channel === 'SMS' ? 'Phone number' : 'FCM Token'})</label>
            <input
              className="form-input"
              style={{ marginBottom: '1rem' }}
              placeholder={testModal.channel === 'EMAIL' ? 'you@example.com' : testModal.channel === 'SMS' ? '+91XXXXXXXXXX' : 'FCM device token'}
              value={testForm.to}
              onChange={e => setTestForm({ ...testForm, to: e.target.value })}
            />
            <label className="form-label">Mock Data (JSON)</label>
            <textarea
              className="form-input"
              rows={5}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '1rem', resize: 'vertical' }}
              value={testForm.mockJson}
              onChange={e => setTestForm({ ...testForm, mockJson: e.target.value })}
            />
            {testStatus && (
              <div style={{ padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem',
                background: testStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: testStatus.type === 'success' ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${testStatus.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
              }}>
                {testStatus.msg}
              </div>
            )}
            <button className="btn-primary" style={{ width: '100%' }} onClick={handleSendTest}>Send Test Now</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Channel</th>
              <th>Version</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id}>
                <td style={{fontWeight: 600}}>{t.eventName}</td>
                <td><span className="badge info">{t.channel}</span></td>
                <td><span style={{ fontSize: '0.8rem', color: 'var(--ink-3)', fontFamily: 'monospace' }}>v{t.version || 1}</span></td>
                <td style={{color: 'var(--ink-3)', fontSize: '0.875rem'}}>{new Date(t.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td>
                  <span className={`badge ${t.active ? 'success' : 'danger'}`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                  <button className="btn-primary btn-sm" style={{width: 'auto'}} onClick={() => handleEdit(t)}>Edit</button>
                  <button className="btn-ghost btn-sm" onClick={() => { setTestModal(t); setTestStatus(null); setTestForm({ to: '', mockJson: '{"name": "John Doe", "orderId": "ORD-123"}' }); }}>Test</button>
                  <button 
                    className="btn-ghost btn-sm" 
                    onClick={() => handleToggleActive(t)}
                  >
                    {t.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '3rem', color: 'var(--ink-3)'}}>No templates found. Create one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
