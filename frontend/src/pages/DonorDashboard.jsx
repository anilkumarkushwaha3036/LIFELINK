import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LogOut, Activity, MapPin, ShieldCheck, AlertCircle, Smartphone } from 'lucide-react';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [emergency, setEmergency] = useState(null);
  const [stats, setStats] = useState(user?.metrics || { reliabilityScore: 100 });

  useEffect(() => {
    if (!socket) return;

    // Listen for Emergency Alerts
    socket.on('emergency_override_alert', (data) => {
      setEmergency(data);
      // Play a custom sound or triggers vibration in real mobile apps
    });

    socket.on('grid_status', (data) => {
      console.log('Grid Status:', data);
    });

    return () => socket.off('emergency_override_alert');
  }, [socket]);

  const toggleStatus = async () => {
    try {
      const res = await fetch('/api/donor/availability', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json' 
        }
      });
      const data = await res.json();
      if (res.ok) {
        setIsAvailable(data.isAvailable);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = () => {
    socket.emit('accept_emergency', {
      requestId: emergency.requestId,
      donorId: user._id,
      timeTaken: 15 // Mock time for web demo
    });
    setEmergency(null);
    setIsAvailable(false); // System auto-sets offline after accept
  };

  return (
    <div className="donor-dashboard">
      {emergency && (
        <div className="emergency-overlay">
          <div className="critical-modal">
             <AlertCircle className="pulse-icon" color="white" size={60} />
             <h1 className="critical-text">CRITICAL RESPONSE REQUIRED</h1>
             <div className="emergency-specs font-mono">
               <p>BLOOD TYPE: <span className="highlight">{emergency.bloodGroup}</span></p>
               <p>DISTANCE: <span className="highlight">{emergency.distanceStr}</span></p>
               <p>PRIORITY: {emergency.escalationLevel === 1 ? 'URGENT' : 'CRITICAL'}</p>
             </div>
             <div className="modal-actions">
               <button className="confirm-btn" onClick={handleAccept}>ACCEPT MISSION</button>
               <button className="reject-btn" onClick={() => setEmergency(null)}>REJECT</button>
             </div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="user-profile">
          <div className="avatar-shield">
             <div className="verification-badge">
               <ShieldCheck size={14} color="#10b981" fill="#10b981" />
             </div>
             {user.name.charAt(0)}
          </div>
          <div className="user-info">
             <h3>{user.name}</h3>
             <p className="font-mono">{user.bloodGroup} Donor</p>
          </div>
        </div>
        <button className="logout-icon" onClick={logout}><LogOut size={20} /></button>
      </header>

      <div className="dashboard-main-layout">
        <main className="dashboard-grid">
          <section className="glass-panel status-card">
             <div className={`status-indicator ${isAvailable ? 'online' : 'offline'}`}></div>
             <h2>GRID CONNECTED</h2>
             <p className="status-label">Your profile is {isAvailable ? 'ACTIVE' : 'INACTIVE'} in the emergency response layer.</p>
             
             <div className="toggle-container" onClick={toggleStatus}>
                <div className={`toggle-track ${isAvailable ? 'active' : ''}`}>
                   <div className="toggle-thumb"></div>
                </div>
                <span className="toggle-text">{isAvailable ? 'GO OFFLINE' : 'GO ONLINE'}</span>
             </div>
          </section>

          <section className="metrics-container">
             <div className="glass-panel metric-card">
                <Activity className="metric-icon" color="var(--primary-red)" />
                <div className="metric-data">
                   <span className="metric-value">{stats?.reliabilityScore || 0}%</span>
                   <span className="metric-title">RELIABILITY</span>
                </div>
             </div>
             <p className="metric-description">Based on response speed and mission success rates.</p>
          </section>
        </main>

        <aside className="telephony-log glass-panel">
            <h3 className="log-title"><Smartphone size={16} /> SYSTEM TELEPHONY</h3>
            <div className="log-list">
               {[
                 { type: 'SMS', msg: 'LIFELINK: Emergency alert matching your blood group in sector 4.', time: '2m ago' },
                 { type: 'CALL', msg: 'Automated VoIP Call: Response requested for Critical Mission.', time: '15m ago' },
                 { type: 'NOTIF', msg: 'System integrity check complete. Node active.', time: '1h ago' }
               ].map((log, i) => (
                 <div key={i} className="log-item">
                    <span className={`log-tag ${log.type.toLowerCase()}`}>{log.type}</span>
                    <p>{log.msg}</p>
                    <span className="log-time">{log.time}</span>
                 </div>
               ))}
            </div>
        </aside>
      </div>

      <style jsx>{`
        .donor-dashboard {
          padding: 2rem;
          min-height: 100vh;
          background: #09090b;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar-shield {
          width: 50px;
          height: 50px;
          background: var(--bg-panel);
          border: 1px solid var(--border-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          position: relative;
        }

        .verification-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          background: var(--bg-dark);
          border-radius: 50%;
          padding: 2px;
        }

        .user-info h3 { font-size: 1.1rem; }
        .user-info p { font-size: 0.8rem; color: var(--text-muted); }

        .dashboard-main-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .telephony-log {
          padding: 2rem;
          height: fit-content;
        }
        .log-title { font-size: 0.8rem; font-weight: 800; color: var(--text-muted); display: flex; align-items: center; gap: 8px; margin-bottom: 2rem; }
        .log-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .log-item { border-left: 2px solid rgba(255,255,255,0.05); padding-left: 1rem; position: relative; }
        .log-tag { font-size: 0.6rem; font-weight: 900; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px; }
        .log-tag.sms { background: #3b82f6; color: white; }
        .log-tag.call { background: var(--accent-red); color: white; }
        .log-tag.notif { background: #10b981; color: white; }
        .log-item p { font-size: 0.75rem; line-height: 1.4; color: var(--text-muted); }
        .log-time { font-size: 0.65rem; color: #52525b; display: block; margin-top: 4px; }

        .status-card {
           padding: 3rem 2rem;
           text-align: center;
           display: flex;
           flex-direction: column;
           align-items: center;
        }

        .status-indicator {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .status-indicator.online {
           background: var(--accent-green);
           box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        .status-indicator.offline { background: #3f3f46; }

        .status-card h2 { font-size: 1.5rem; margin-bottom: 0.5rem; letter-spacing: 1px; }
        .status-label { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; }

        /* Custom Toggle Switch */
        .toggle-container {
           display: flex;
           align-items: center;
           gap: 1rem;
           cursor: pointer;
        }

        .toggle-track {
           width: 64px;
           height: 32px;
           background: rgba(255, 255, 255, 0.1);
           border-radius: 20px;
           padding: 4px;
           transition: all 0.3s ease;
        }

        .toggle-track.active { background: var(--primary-red); }

        .toggle-thumb {
           width: 24px;
           height: 24px;
           background: white;
           border-radius: 50%;
           transition: all 0.3s ease;
        }

        .toggle-track.active .toggle-thumb { transform: translateX(32px); }
        .toggle-text { font-size: 0.9rem; font-weight: 700; color: var(--text-muted); }

        .metric-card {
           padding: 2rem;
           display: flex;
           align-items: center;
           gap: 1.5rem;
        }
        
        .metric-value { font-size: 2.2rem; font-weight: 800; display: block; }
        .metric-title { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; letter-spacing: 1px; }
        .metric-description { text-align: center; font-size: 0.8rem; color: #52525b; margin-top: 1rem; }

        /* EMERGENCY OVERLAY STYLES */
        .emergency-overlay {
           position: fixed;
           top: 0; left: 0; right: 0; bottom: 0;
           background: rgba(159, 18, 57, 0.9);
           backdrop-filter: blur(20px);
           z-index: 1000;
           display: flex;
           align-items: center;
           justify-content: center;
           animation: flashBackground 0.5s infinite alternate;
        }

        .critical-modal {
           text-align: center;
           padding: 3rem;
           max-width: 400px;
        }

        .critical-text { font-weight: 900; font-size: 2rem; margin: 1.5rem 0; color: white; }
        .emergency-specs { background: rgba(0,0,0,0.4); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; }
        .highlight { color: #ffe4e6; font-weight: 800; }

        .confirm-btn { background: white; color: var(--primary-red); width: 100%; padding: 16px; border-radius: 12px; font-weight: 800; margin-bottom: 1rem; }
        .reject-btn { color: white; opacity: 0.6; font-weight: 600; background: transparent; }

        @keyframes flashBackground {
          from { background: rgba(159, 18, 57, 0.85); }
          to { background: rgba(225, 29, 72, 0.95); }
        }

        @keyframes pulse-icon {
           0% { transform: scale(1); }
           100% { transform: scale(1.1); }
        }
        .pulse-icon { animation: pulse-icon 0.3s infinite alternate; }
      `}</style>
    </div>
  );
};

export default DonorDashboard;
