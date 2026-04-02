import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, ArrowLeft, Lock, Globe } from 'lucide-react';

const LoginPage = () => {
  const [role, setRole] = useState('donor'); // 'donor', 'hospital', or 'admin'
  const [formData, setFormData] = useState({
    email: '', 
    hospitalLicense: '', 
    password: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        if (role === 'donor') navigate('/donor');
        else if (role === 'hospital') navigate('/hospital');
        else if (role === 'admin') navigate('/admin');
      } else {
        alert(data.message || 'Authentication Failed');
      }
    } catch (err) {
      console.error(err);
      alert('Internal Server Error');
    }
  };

  return (
    <div className="login-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="login-container glass-panel">
        <div className="login-header">
           <Lock size={40} color="var(--primary-red)" style={{ marginBottom: '1rem' }} />
           <h2 className="text-gradient">SYSTEM ACCESS</h2>
           <p>Choose your access gateway to the LifeLink grid.</p>
        </div>

        <div className="role-switcher">
          <button 
            className={`role-btn ${role === 'donor' ? 'active' : ''}`}
            onClick={() => setRole('donor')}
          >
            <User size={16} /> DONOR
          </button>
          <button 
            className={`role-btn ${role === 'hospital' ? 'active' : ''}`}
            onClick={() => setRole('hospital')}
          >
            <Shield size={16} /> HOSPITAL
          </button>
          <button 
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <Globe size={16} /> ADMIN
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {(role === 'donor' || role === 'admin') ? (
            <div className="form-group">
              <label>{role === 'admin' ? 'ADMIN EMAIL' : 'DONOR EMAIL'}</label>
              <input 
                type="email" 
                placeholder={role === 'admin' ? 'admin@lifelink.gov' : 'your.email@example.com'}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>HOSPITAL LICENSE ID</label>
              <input 
                type="text" 
                placeholder="Ex: HOSP-7892"
                value={formData.hospitalLicense}
                onChange={(e) => setFormData({...formData, hospitalLicense: e.target.value})}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>PASSWORD</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-submit-btn">
            AUTHENTICATE & ACCESS
          </button>

          <div className="login-footer">
            <p>New Donor? <span onClick={() => navigate('/#register')}>Register on Home</span></p>
            {role === 'hospital' && (
              <p style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
                New Hospital? Register on Home and await Admin verification.
              </p>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(circle at top right, var(--primary-red-glow) 0%, transparent 40%);
        }

        .role-switcher {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 3rem;
          padding: 6px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
        }

        .role-btn {
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-radius: 8px;
          color: var(--text-muted);
          background: transparent;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .role-btn.active {
          background: var(--bg-panel);
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .back-btn { position: absolute; top: 2rem; left: 2rem; background: none; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
        .login-container { width: 100%; max-width: 500px; padding: 4rem 3rem; animation: slideUp 0.6s ease-out; }
        .login-container { width: 100%; max-width: 500px; padding: 4rem 3rem; animation: slideUp 0.6s ease-out; }
        .login-header { text-align: center; margin-bottom: 3rem; }
        .login-header p { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }
        .login-submit-btn { width: 100%; padding: 16px; margin-top: 1rem; }
        .login-footer { text-align: center; margin-top: 2.5rem; font-size: 0.9rem; color: var(--text-muted); }
        .login-footer span { color: var(--primary-red); cursor: pointer; font-weight: 700; }
        .form-group { margin-bottom: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default LoginPage;
