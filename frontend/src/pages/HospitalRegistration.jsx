import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, MapPin, Smartphone, ArrowLeft } from 'lucide-react';

const HospitalRegistration = () => {
  const navigate = useNavigate();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: '', password: '', phone: '',
    latitude: null, longitude: null,
    hospitalLicense: ''
  });

  const fetchLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLoadingLocation(false);
          alert('Location synchronized with LifeLink Grid.');
        },
        (err) => {
          alert('Location access denied. Please enter manually or check settings.');
          setLoadingLocation(false);
        }
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert('Please synchronize your location first.');
      return;
    }

    const data = new FormData();
    data.append('role', 'hospital');
    data.append('name', formData.name);
    data.append('password', formData.password);
    data.append('phone', formData.phone);
    data.append('latitude', formData.latitude || '');
    data.append('longitude', formData.longitude || '');
    data.append('hospitalLicense', formData.hospitalLicense);

    console.log('[Auth] Registering Hospital:', Object.fromEntries(data.entries()));

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: data // Sending as FormData
      });
      const result = await res.json();
      if (res.ok) {
        alert('Registration complete. Please await Admin Verification.');
        navigate('/login');
      } else {
        alert(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      alert('Unable to connect to the server. Please check your internet connection and try again.');
    }
  };

  return (
    <div className="registration-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={20} /> Back to Home
      </button>
      
      <div className="registration-container glass-panel">
        <div className="form-header">
           <Hospital size={40} color="var(--primary-red)" />
           <h3 className="text-gradient">HOSPITAL ONBOARDING</h3>
           <p>Register your Hospital to connect with LifeLink.</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
           <div className="form-row">
              <div className="form-group">
                <label>HOSPITAL NAME</label>
                <input 
                  type="text" 
                  placeholder="Ex: City Health Center"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
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
           </div>
           
           <div className="form-row">
              <div className="form-group">
                <label>PHONE NUMBER (FOR ALERTS)</label>
                <div className="input-with-icon">
                   <Smartphone size={16} className="input-icon" />
                   <input 
                     type="tel" 
                     placeholder="+91 XXXXX XXXXX"
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     required
                   />
                </div>
              </div>
              <div className="form-group">
                <label>CURRENT LOCATION</label>
                <button 
                  type="button" 
                  className={`btn-secondary fetch-btn ${formData.latitude ? 'success' : ''}`}
                  onClick={fetchLocation}
                >
                  <MapPin size={16} /> {loadingLocation ? 'FETCHING...' : formData.latitude ? 'LOCATION SET' : 'SYNC LOCATION'}
                </button>
              </div>
           </div>

           <div className="form-group">
             <label>PASSWORD</label>
             <input 
               type="password" 
               placeholder="Secure your access"
               value={formData.password}
               onChange={(e) => setFormData({...formData, password: e.target.value})}
               required
             />
           </div>

           <button type="submit" className="btn-primary register-submit-btn">
              REGISTER HOSPITAL
           </button>
        </form>
      </div>

      <style jsx>{`
        .registration-page { 
          min-height: 100vh;
          display: flex; 
          justify-content: center; 
          align-items: center;
          padding: 2rem; 
          background: radial-gradient(circle at top right, var(--primary-red-glow) 0%, transparent 40%);
        }
        .back-btn { position: absolute; top: 2rem; left: 2rem; background: none; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
        .registration-container { width: 100%; max-width: 700px; padding: 4rem; animation: slideUp 0.6s ease-out; }
        .form-header { text-align: center; margin-bottom: 2rem; }
        .form-header h3 { font-size: 1.5rem; font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; }
        .form-header p { color: var(--text-muted); }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .input-with-icon input { padding-left: 40px; width: 100%; }

        .fetch-btn { 
          display: flex; align-items: center; justify-content: center; gap: 0.5rem; height: 100%; 
          border: 1px dashed var(--border-light); border-radius: 3px; 
        }
        .fetch-btn.success { border: 1px solid var(--accent-green); color: var(--accent-green); background: rgba(16, 185, 129, 0.05); }

        .register-submit-btn { width: 100%; padding: 18px; margin-top: 1.5rem; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 900px) {
           .form-row { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
           .registration-page {
             padding: 1rem;
             flex-direction: column;
             justify-content: flex-start;
             padding-top: 2rem;
           }
           .back-btn {
             position: static;
             margin-bottom: 1.5rem;
             align-self: flex-start;
           }
           .registration-container {
             padding: 2.25rem 1.25rem;
             max-width: 100%;
           }
           .form-header h3 {
             font-size: 1.3rem;
           }
        }
      `}</style>
    </div>
  );
};

export default HospitalRegistration;
