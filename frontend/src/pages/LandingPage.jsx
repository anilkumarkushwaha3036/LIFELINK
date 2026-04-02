import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  HeartPulse, 
  UserCircle2, 
  MapPin, 
  Smartphone, 
  FileUp, 
  Hospital, 
  UserPlus, 
  ShieldAlert, 
  ToggleRight, 
  Radio, 
  Search, 
  Heart 
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [activeRole, setActiveRole] = useState('donor'); // 'donor' or 'hospital'
  const [verificationMethod, setVerificationMethod] = useState('Offline');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    bloodGroup: 'A+', 
    latitude: null, longitude: null,
    file: null,
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
    data.append('role', activeRole);
    data.append('name', formData.name);
    if (activeRole === 'donor') data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('phone', formData.phone);
    if (activeRole === 'donor') data.append('bloodGroup', formData.bloodGroup);
    data.append('latitude', formData.latitude || '');
    data.append('longitude', formData.longitude || '');
    
    if (activeRole === 'donor') {
      data.append('verificationMethod', verificationMethod);
      if (formData.file) {
        data.append('verificationDocument', formData.file);
      }
    } else {
      data.append('hospitalLicense', formData.hospitalLicense);
    }

    console.log('[Auth] Registering with:', Object.fromEntries(data.entries()));

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: data // Sending as FormData for file upload support
      });
      const result = await res.json();
      if (res.ok) {
        alert('Registration complete. Node established.');
        navigate('/login');
      } else {
        alert(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="landing-page">
      <header className="glass-nav">
        <div className="logo font-mono text-gradient">LIFE<span style={{ color: 'white' }}>LINK</span></div>
        <div className="nav-actions">
           <button className="btn-secondary" onClick={() => navigate('/login')}>
              <UserCircle2 size={18} /> LOGIN
           </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="pulse-circle"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Your Blood <br /> <span className="text-gradient">Save Someone's Entire Life.</span>
          </h1>
          <p className="hero-subtitle">
            LifeLink connects blood donors and hospitals in real-time.
            Join the most advanced Emergency Blood Response Grid in India.
          </p>
          <div className="hero-cta-group">
            <a href="#register" className="btn-primary btn-large">Register as Donor</a>
          </div>
        </div>
      </section>

      <section className="system-explanation">
         <div className="section-head text-center">
            <h2 className="text-gradient">HOW THE LIFELINK WORKS</h2>
            <p className="subtitle">The complete life-saving loop from registration to real-time response.</p>
         </div>

         <div className="process-grid">
            {[
              { 
                step: "01", icon: <UserPlus size={24} />, title: "Register as a Donor", 
                desc: "Register with your basic details and blood group to join the Emergency blood Infastructure Grid." 
              },
              { 
                step: "02", icon: <ShieldAlert size={24} />, title: "Get Verified by Hospital", 
                desc: "For Ensure safety and reliability through online report verification or offline test at nearest Hospital." 
              },
              { 
                step: "03", icon: <ToggleRight size={24} />, title: "Set Your Availability", 
                desc: "Turn your live mode ON when you are ready to donate blood for emergencies." 
              },
              { 
                step: "04", icon: <Search size={24} />, title: "Smart Matching", 
                desc: "When any Hospital needs blood our Emergency engine instantly shortlist verified donors within the optimal radius." 
              },
              { 
                step: "05", icon: <Radio size={24} />, title: "Emergency Request", 
                desc: "Send urgent blood requests to donors through the Notification, SMS, & Call." 
              },
              
              { 
                step: "06", icon: <Heart size={24} />, title: "Accept & Save a Life", 
                desc: "Respond, connect, and help in real-time emergencies to save a life today." 
              }
            ].map((item, idx) => (
              <div key={idx} className="process-card glass-panel">
                 <div className="card-num">{item.step}</div>
                 <div className="card-icon">{item.icon}</div>
                 <h3>{item.title}</h3>
                 <p>{item.desc}</p>
              </div>
            ))}
         </div>
      </section>

      <section id="register" className="registration-section">
         <div className="registration-container glass-panel">
            <div className="form-header">
               <UserCircle2 size={40} color="var(--primary-red)" />
               <h3>{activeRole === 'donor' ? 'DONOR REGISTRATION' : 'HOSPITAL ONBOARDING'}</h3>
               <p>{activeRole === 'donor' ? 'Become a registred donor and save lives.' : 'Register your Hospital for connect with LinfeLink.'}</p>
            </div>

            <div className="role-selector-tabs">
               <button 
                 className={`tab-btn ${activeRole === 'donor' ? 'active' : ''}`}
                 onClick={() => setActiveRole('donor')}
               >DONOR SIGNUP</button>
               <button 
                 className={`tab-btn ${activeRole === 'hospital' ? 'active' : ''}`}
                 onClick={() => setActiveRole('hospital')}
               >HOSPITAL SIGNUP</button>
            </div>
            
            <form onSubmit={handleRegister} className="landing-register-form">
               <div className="form-row">
                  <div className="form-group">
                    <label>{activeRole === 'donor' ? 'FULL NAME' : 'HOSPITAL NAME'}</label>
                    <input 
                      type="text" 
                      placeholder={activeRole === 'donor' ? 'Your Full Name' : 'Ex: City Health Center'}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  {activeRole === 'donor' ? (
                    <div className="form-group">
                      <label>BLOOD GROUP</label>
                      <select 
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
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
                    <label> CURRENT LOCATION</label>
                    <button 
                      type="button" 
                      className={`btn-secondary fetch-btn ${formData.latitude ? 'success' : ''}`}
                      onClick={fetchLocation}
                    >
                      <MapPin size={16} /> {loadingLocation ? 'FETCHING...' : formData.latitude ? 'LOCATION SET' : 'SYNC LOCATION'}
                    </button>
                  </div>
               </div>

               {activeRole === 'donor' && (
                 <div className="form-group">
                   <label>EMAIL ADDRESS</label>
                   <input 
                     type="email" 
                     placeholder="you@example.com"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     required
                   />
                 </div>
               )}

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

               {activeRole === 'donor' && (
                 <>
                   <div className="verif-choice-container">
                      <label>VERIFICATION PATHWAY</label>
                      <div className="choice-grid">
                         <div 
                           className={`choice-card ${verificationMethod === 'Upload' ? 'active' : ''}`}
                           onClick={() => setVerificationMethod('Upload')}
                         >
                            <FileUp size={24} />
                            <span>Upload Report</span>
                         </div>
                         <div 
                           className={`choice-card ${verificationMethod === 'Offline' ? 'active' : ''}`}
                           onClick={() => setVerificationMethod('Offline')}
                         >
                            <Hospital size={24} />
                            <span>Offline Test</span>
                         </div>
                      </div>
                   </div>

                   {verificationMethod === 'Upload' && (
                     <div className="form-group file-upload-group">
                        <label>SELECT BLOOD REPORT (IMAGE/PDF)</label>
                        <input 
                          type="file" 
                          accept="image/*,.pdf"
                          onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                          required
                        />
                     </div>
                   )}
                 </>
               )}

               <button type="submit" className="btn-primary register-submit-btn">
                  {activeRole === 'donor' ? 'REGISTER AS DONOR' : 'REGISTER HOSPITAL'}
               </button>
            </form>
         </div>
      </section>

      <style jsx>{`
        .landing-page { padding: 1rem 2rem 5rem; max-width: 1400px; margin: 0 auto; }
        .glass-nav { 
          display: flex; justify-content: space-between; align-items: center; 
          padding: 1rem 2rem; background: rgba(24, 25, 28, 0.4); 
          backdrop-filter: blur(10px); border: 1px solid var(--border-light); 
          border-radius: 16px; position: sticky; top: 1rem; z-index: 100; 
        }
        .logo { font-size: 1.5rem; font-weight: 800; }

        .hero-section { position: relative; text-align: center; padding: 8rem 0 6rem; }
        .hero-title { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; }
        .hero-subtitle { font-size: 1.2rem; color: var(--text-muted); max-width: 650px; margin: 0 auto 3rem; }
        .btn-large { padding: 18px 48px; font-size: 1.1rem; }

        .section-head { margin-bottom: 4rem; text-align: center; }
        .section-head h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
        .section-head .subtitle { color: var(--text-dim); font-weight: 500; }

        .process-grid { 
           display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; 
        }
        .process-card {
           padding: 2.5rem; text-align: left; position: relative;
           border: 1px solid var(--panel-border); transition: all 0.3s ease;
        }
        .process-card:hover {
           transform: translateY(-10px); border-color: var(--accent-red);
           box-shadow: 0 10px 30px rgba(225, 29, 72, 0.1);
        }
        .card-num { 
           font-family: var(--font-mono); font-size: 3rem; font-weight: 900; 
           color: rgba(255,255,255,0.03); position: absolute; top: 1rem; right: 1.5rem;
        }
        .card-icon {
           width: 50px; height: 50px; border-radius: 12px; background: rgba(225, 29, 72, 0.1);
           display: flex; align-items: center; justify-content: center; color: var(--accent-red);
           margin-bottom: 1.5rem;
        }
        .process-card h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem; }
        .process-card p { font-size: 0.9rem; color: var(--text-dim); line-height: 1.6; }

        .system-explanation { margin: 6rem 0; }
        .info-text h2 { font-size: 2rem; margin-bottom: 2rem; }
        .info-text li { margin-bottom: 1.5rem; color: var(--text-dim); }

        .registration-section { margin: 6rem 0; display: flex; justify-content: center; }
        .registration-container { width: 100%; max-width: 700px; padding: 4rem; }
        .form-header { text-align: center; margin-bottom: 2rem; }

        .role-selector-tabs {
           display: flex; gap: 1rem; margin-bottom: 3rem; justify-content: center;
        }
        .tab-btn {
           padding: 10px 20px; border-radius: 30px; border: 1px solid var(--border-light);
           background: rgba(255,255,255,0.05); color: var(--text-muted); font-size: 0.8rem; font-weight: 700;
        }
        .tab-btn.active {
           background: var(--primary-red); color: white; border-color: var(--primary-red);
        }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .input-with-icon input { padding-left: 40px; width: 100%; }

        .fetch-btn { 
          display: flex; align-items: center; justify-content: center; gap: 0.5rem; height: 100%; 
          border: 1px dashed var(--border-light); border-radius: 8px; 
        }
        .fetch-btn.success { border: 1px solid var(--accent-green); color: var(--accent-green); background: rgba(16, 185, 129, 0.05); }

        .verif-choice-container { margin: 2rem 0; }
        .verif-choice-container label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 1rem; display: block; }
        .choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .choice-card { 
          padding: 1.5rem; border: 1px solid var(--border-light); border-radius: 12px; 
          text-align: center; cursor: pointer; transition: all 0.3s ease; 
          display: flex; flex-direction: column; items: center; gap: 0.75rem; 
          background: rgba(255,255,255,0.02);
        }
        .choice-card:hover { border-color: var(--primary-red); transform: translateY(-3px); }
        .choice-card.active { border-color: var(--primary-red); background: rgba(225, 29, 72, 0.05); color: white; }
        .choice-card span { font-size: 0.85rem; font-weight: 700; }

        .file-upload-group { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border: 1px dashed var(--border-light); }
        .register-submit-btn { width: 100%; padding: 18px; margin-top: 1.5rem; }

        .pulse-circle {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 600px; height: 600px; background: radial-gradient(circle, var(--primary-red-glow) 0%, transparent 70%);
          z-index: -1; filter: blur(80px); opacity: 0.2; animation: pulse 8s infinite alternate;
        }

        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.3; }
        }

        @media (max-width: 900px) {
           .explanation-grid { grid-template-columns: 1fr; }
           .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
