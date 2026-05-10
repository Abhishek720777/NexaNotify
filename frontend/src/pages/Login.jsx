import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const res = await api.post(endpoint, formData);
      localStorage.setItem('token', res.data.token);
      
      if (!isLogin) {
        alert(`Save your API Key: ${res.data.apiKey}`);
      }
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="logo" style={{textAlign: 'center', marginBottom: '2rem'}}>NotifyEngine</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          {error && <div style={{color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</div>}
          <button type="submit" className="btn-primary">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)'}}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{color: 'var(--accent)', cursor: 'pointer'}} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}
