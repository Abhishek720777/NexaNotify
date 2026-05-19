import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
        alert(`Your API Key (save this): ${res.data.apiKey}`);
      }
      navigate('/dashboard');
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
    </div>
  );
}
