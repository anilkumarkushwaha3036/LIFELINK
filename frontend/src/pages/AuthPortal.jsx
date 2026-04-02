import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, ArrowLeft } from 'lucide-react';

const AuthPortal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('donor'); // 'donor' or 'hospital'
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', 
    hospitalLicense: '', bloodGroup: 'A+', 
    latitude: 37.7749, longitude: -122.4194 // Default (SF) for test
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = { ...formData, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate(role === 'donor' ? '/donor' : '/hospital');
      } else {
        alert(data.message || 'Auth Failed');
      }
    } catch (err) {
      console.error(err);
      alert('Internal Server Error');
    }
  };

  return (
    <div className="auth-portal">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={20} /> Back to Grid
      </button>

      <div className="auth-container glass-panel">
        <div className="auth-header">
           <h2 className="text-gradient">{isLogin ? 'SYSTEM ACCESS' : 'NODE REGISTRATION'}</h2>
           <p>{isLogin ? 'Identify your station' : 'Connect to the response infrastructure'}</p>
        </div>

        <div className="role-switcher">
          <button 
            className={`role-btn ${role === 'donor' ? 'active' : ''}`}
            onClick={() => setRole('donor')}
          >
            <User size={18} /> Donor Node
          </button>
          <button 
            className={`role-btn ${role === 'hospital' ? 'active' : ''}`}
            onClick={() => setRole('hospital')}
          >
            <Shield size={18} /> Hospital Command
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name / Facility Name</label>
              <input 
                type="text" 
                placeholder="Ex: John Doe or City General"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          )}

          {role === 'donor' ? (
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="donor@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Hospital License ID</label>
              <input 
                type="text" 
                placeholder="License Number (e.g. HOSP-123)"
                value={formData.hospitalLicense}
                onChange={(e) => setFormData({...formData, hospitalLicense: e.target.value})}
                required
              />
            </div>
          )}

          {(!isLogin && role === 'donor') && (
            <div className="form-group">
              <label>Blood Group</label>
              <select 
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit">
            {isLogin ? 'AUTHENTICATE' : 'INITIALIZE NODE'}
          </button>

          <p className="toggle-auth">
            {isLogin ? "Don't have access?" : "Already registered?"} 
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? ' Create Account' : ' Login Instead'}
            </span>
          </p>
        </form>
      </div>

      <style jsx>{`
        .auth-portal {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(circle at top right, var(--primary-red-glow) 0%, transparent 40%);
        }

        .back-btn {
          position: absolute;
          top: 2rem;
          left: 2rem;
          background: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .auth-container {
          width: 100%;
          max-width: 480px;
          padding: 3rem;
          animation: slideUp 0.6s ease-out;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-header h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: var(--text-muted);
        }

        .role-switcher {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2.5rem;
          padding: 6px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
        }

        .role-btn {
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-radius: 8px;
          color: var(--text-muted);
          background: transparent;
        }

        .role-btn.active {
          background: var(--bg-panel);
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .form-group {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .auth-submit {
          width: 100%;
          margin-top: 1.5rem;
          padding: 14px;
        }

        .toggle-auth {
          text-align: center;
          margin-top: 2rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .toggle-auth span {
          color: var(--primary-red);
          cursor: pointer;
          font-weight: 600;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AuthPortal;
