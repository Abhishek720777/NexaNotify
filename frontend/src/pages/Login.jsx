import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyToCopy, setApiKeyToCopy] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const res = await api.post(endpoint, formData);
      localStorage.setItem('token', res.data.token);
      if (!isLogin) {
        setApiKeyToCopy(res.data.apiKey);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 22, fontWeight: 700, letterSpacing: '1.5px',
          textTransform: 'uppercase', color: 'var(--ink)',
          marginBottom: 32, textAlign: 'center'
        }}>
          Signal<span style={{ color: 'var(--accent)' }}>Flow</span>
        </div>

        <div className="login-box">
          <h2 style={{ textAlign: 'left', marginBottom: 28 }}>
            {isLogin ? 'Sign in' : 'Create account'}
          </h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Inc."
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <div style={{
                color: 'var(--danger)', marginBottom: 14,
                fontSize: 12, fontFamily: "'JetBrains Mono', monospace"
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign in →' : 'Create account →')}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 24,
            color: 'var(--ink-3)', fontSize: 12
          }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 20,
          color: 'var(--ink-3)', fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => window.location.href = '/'}
          >
            ← Back to home
          </span>
        </p>
      </div>

      {apiKeyToCopy && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div className="login-box" style={{ width: '90%', maxWidth: 440, padding: 32, animation: 'fadeIn 0.25s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)', marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <h2 style={{ margin: 0, fontSize: 20 }}>API Key Generated</h2>
            </div>
            
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 20 }}>
              Use this key to authorize outbound notification requests. For security reasons, this key is encrypted and <strong>cannot be recovered</strong> if lost or after closing this window.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <input
                type="text"
                readOnly
                value={apiKeyToCopy}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--ink)', fontSize: 13, fontFamily: "'JetBrains Mono', monospace"
                }}
              />
              <button
                className="btn-ghost"
                style={{ width: 'auto', padding: '0 16px', fontSize: 13 }}
                onClick={() => {
                  navigator.clipboard.writeText(apiKeyToCopy);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <button
              className="btn-primary"
              onClick={() => {
                setApiKeyToCopy(null);
                navigate('/dashboard');
              }}
            >
              Close & Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
