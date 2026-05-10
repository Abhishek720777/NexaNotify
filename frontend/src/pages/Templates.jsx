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
  const [formData, setFormData] = useState({ eventName: '', channel: 'EMAIL', subject: '', body: '' });
  const [previewData, setPreviewData] = useState({ name: 'John Doe', orderId: 'ORD-123', total: '$199.99' });

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

  const insertVariable = (variable) => {
    setFormData({ ...formData, body: formData.body + variable });
  };

  const renderPreview = () => {
    let html = formData.body;
    // Simple regex replacement for preview purposes (not full Freemarker)
    Object.keys(previewData).forEach(key => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      html = html.replace(regex, previewData[key]);
    });
    return html;
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title" style={{margin: 0}}>Notification Templates</h1>
        <button className="btn-primary" style={{width: 'auto'}} onClick={() => setIsModalOpen(true)}>
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
              <h2>Design Your Notification</h2>
              <button onClick={() => setIsModalOpen(false)} style={{background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="template-editor-grid">
                {/* Editor Side */}
                <div className="editor-side">
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
                    <label>Variables (Click to insert)</label>
                    <div className="variable-chips">
                      {AVAILABLE_VARIABLES.map(v => (
                        <span key={v} className="chip" onClick={() => insertVariable(v)}>{v}</span>
                      ))}
                    </div>
                    <label>Template Body (Freemarker/HTML)</label>
                    <textarea 
                      required 
                      rows="12" 
                      style={{fontFamily: 'monospace', fontSize: '0.875rem'}}
                      value={formData.body} 
                      onChange={(e) => setFormData({...formData, body: e.target.value})} 
                      placeholder="<h1>Hello ${name}</h1>..." 
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button type="submit" className="btn-primary" style={{flex: 1}}>Save Template</button>
                  </div>
                </div>

                {/* Preview Side */}
                <div className="preview-side">
                  <label className="flex justify-between" style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span>Live Preview</span>
                    <span className="badge info">{formData.channel} Mode</span>
                  </label>
                  <div className="preview-container">
                    {formData.channel === 'EMAIL' ? (
                      <div dangerouslySetInnerHTML={{ __html: renderPreview() || '<p style="color:#999">Type something to see preview...</p>' }} />
                    ) : (
                      <div style={{fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>
                        {renderPreview() || 'Type something to see preview...'}
                      </div>
                    )}
                  </div>
                  <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem'}}>
                    Note: This is a simplified preview. Complex logic should be tested in staging.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Channel</th>
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
                <td style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${t.active ? 'success' : 'danger'}`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {t.active && (
                    <button className="btn-sm" style={{background: '#3f3f46', color: 'white'}} onClick={() => handleDelete(t.id)}>Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>No templates found. Create one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
