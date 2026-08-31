import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  Users, 
  LayoutDashboard, 
  ClipboardList, 
  History, 
  Settings, 
  LogOut,
  Droplets,
  Search,
  CheckCircle,
  XSquare,
  FileText,
  Radio,
  ArrowUpRight,
  TrendingDown,
  Navigation
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import '../styles/HospitalDashboard.css';

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ops');
  
  // State
  const [activeRequest, setActiveRequest] = useState(null);
  const [pendingDonors, setPendingDonors] = useState([]);
  const [gridStats, setGridStats] = useState({ totalDonorsNearby: 0, recentRequests: [] });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bloodGroupRequired: 'O+', urgency: 'High' });
  const [showBridgeAlert, setShowBridgeAlert] = useState(true);
  const [connectingBridge, setConnectingBridge] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // AUTH GUARD
  useEffect(() => {
    if (!user || user.role !== 'hospital') {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user?.token) return;
    try {
      const [donorsRes, statsRes] = await Promise.all([
        fetch('/api/hospital/pending-donors', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('/api/hospital/stats', { headers: { 'Authorization': `Bearer ${user.token}` } })
      ]);
      
      if (donorsRes.ok) setPendingDonors(await donorsRes.json());
      if (statsRes.ok) setGridStats(await statsRes.json());
    } catch (err) {
      console.error('EOC Fetch Error:', err);
    } finally {
      if(loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (socket) {
      socket.on('pulse_update', (data) => {
        setActiveRequest(prev => ({ ...prev, ...data }));
        if(data.status === 'Matched') {
           fetchData(); // Refresh history
        }
      });
      
      socket.on('match_found', (data) => {
        showToast(`🩸 CRITICAL MATCH: ${data.name} (${data.bloodGroup || ''}) is responding to the emergency!`, 'critical');
        setActiveRequest(prev => ({ ...prev, status: 'Matched', matchedDonor: data }));
        fetchData();
        socket.emit('confirm_match', { requestId: data.requestId || activeRequest?._id });
      });
    }
    return () => socket && socket.off('pulse_update');
  }, [socket, user?.token]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hospital/request', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setActiveRequest(data);
        showToast('Emergency Alert Broadcasted Successfully!', 'success');
        fetchData();
      } else {
        showToast(data.message || 'Failed to broadcast alert', 'critical');
      }
    } catch (err) {
      console.error('Broadcast Error:', err);
      showToast('Network error: Unable to connect to server', 'critical');
    }
  };

  const approveDonor = async (id) => {
    if(!window.confirm("Verify physical test result? Activate Donor Node?")) return;
    try {
      const res = await fetch(`/api/hospital/verify-donor/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Donor Grid Access Activated.', 'success');
        fetchData();
      } else {
        showToast(data.message || 'Verification failed', 'critical');
      }
    } catch (err) {
      console.error('Verification Error:', err);
      showToast('Network error: Unable to verify donor', 'critical');
    }
  };

  if (!user || user.role !== 'hospital') return null;

  if (loading) return (
    <div className="hospital-eoc">
      <aside className="eoc-sidebar">
        <div className="eoc-logo">
          <Skeleton circle width={32} height={32} />
          <div style={{ marginLeft: '1rem', width: '100%' }}>
             <Skeleton width={120} height={24} />
          </div>
        </div>
        <nav className="nav-links" style={{ marginTop: '2rem' }}>
          <Skeleton height={40} count={3} style={{ marginBottom: '0.5rem', borderRadius: '6px' }} />
        </nav>
      </aside>
      <main className="eoc-main-content">
        <header className="dashboard-header">
          <div className="header-meta" style={{ width: '100%' }}>
            <Skeleton width={200} height={32} />
            <Skeleton width={300} height={16} style={{ marginTop: '0.5rem' }} />
          </div>
          <Skeleton width={150} height={36} borderRadius={6} />
        </header>
        <div className="bento-grid">
          <div className="bento-card"><Skeleton height={80} /></div>
          <div className="bento-card"><Skeleton height={80} /></div>
          <div className="bento-card" style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
            <Skeleton height={250} />
          </div>
          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <Skeleton height={150} />
          </div>
          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <Skeleton height={100} />
          </div>
          <div className="bento-card span-2 bridge-alert-card">
            <Skeleton height={80} />
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="hospital-eoc">
      {/* Toast Notification */}
      {toast && (
        <div className={`eoc-toast eoc-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="eoc-sidebar">
        <div className="eoc-logo">
          <Zap size={32} color="var(--accent-red)" className="pulse-anim" />
          <h2>LIFELINK</h2>
        </div>
        
        <nav className="nav-links">
          <button className={`nav-item ${activeTab === 'ops' ? 'active' : ''}`} onClick={() => setActiveTab('ops')}>
            <LayoutDashboard size={20} /> OPERATIONS
          </button>
          <button className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
            <ClipboardList size={20} /> QUEUE {pendingDonors.length > 0 && <span className="badge-count">{pendingDonors.length}</span>}
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={20} /> MISSION LOGS
          </button>
        </nav>

        <button className="nav-item logout-btn" onClick={logout} style={{ marginTop: 'auto', border: 'none', background: 'none' }}>
          <LogOut size={20} /> TERMINATE OPS
        </button>
      </aside>

      {/* Main EOC Hub */}
      <main className="eoc-main-content">
        <header className="dashboard-header">
          <div className="header-meta">
            <h1>HOSPITAL COMMAND</h1>
            <p>{user.name.toUpperCase()} / SECTOR: GRID-{user.hospitalLicense?.slice(-4) || 'CORE'}</p>
          </div>
          <div className="eoc-status-pill">
            <span className="live-dot"></span>
            TELEMETRY ACTIVE
          </div>
        </header>

        {activeTab === 'ops' && (
          <div className="bento-grid">
            
            {/* Real-time Grid Stats */}
            <div className="bento-card">
              <span className="card-title"><Users size={14} /> REGIONAL DONORS</span>
              <div className="big-number">{gridStats.totalDonorsNearby}</div>
              <p className="font-mono text-dim" style={{fontSize: '0.65rem'}}>STRENGTH WITHIN 25KM</p>
            </div>

            <div className="bento-card">
              <span className="card-title"><Activity size={14} /> RESPONSE RATE</span>
              <div className="big-number">88%</div>
              <span className="stat-trend trend-up"><ArrowUpRight size={14} /> ABOVE GRID AVG</span>
            </div>

            {/* Radar Pulse Visual */}
            <div className="bento-card" style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
              <span className="card-title"><Radio size={14} /> LIVE OPERATIONAL RADAR</span>
              <div className="radar-visual">
                <div className="radar- sweep"></div>
                <div className="radar-circle" style={{ width: '40px', height: '40px' }}></div>
                <div className="radar-circle" style={{ 
                    width: activeRequest?.radius >= 10 ? '120px' : '40px', 
                    height: activeRequest?.radius >= 10 ? '120px' : '40px',
                    borderColor: 'var(--accent-red)'
                }}></div>
                <div className="radar-circle" style={{ 
                    width: activeRequest?.radius === 25 ? '220px' : '120px', 
                    height: activeRequest?.radius === 25 ? '220px' : '120px' 
                }}></div>
                <div className="radar-center"><Activity color="var(--accent-red)" size={20} /></div>
              </div>
              <div className="radar-footer">
                <span className="font-mono" style={{fontSize: '0.75rem'}}>CURRENT SCAN RADIUS: {activeRequest?.radius || 0} KM</span>
                <div className="escalation-stepper">
                  <div className={`step ${activeRequest?.level >= 1 ? 'active' : ''}`}></div>
                  <div className={`step ${activeRequest?.level >= 2 ? 'active' : ''}`}></div>
                  <div className={`step ${activeRequest?.level >= 3 ? 'active' : ''}`}></div>
                </div>
              </div>
            </div>

            {/* Emergency Control Panel */}
            <div className="bento-card" style={{ gridColumn: 'span 2' }}>
                <span className="card-title"><Zap size={14} /> EMERGENCY RESPONSE PROTOCOL</span>
                <form onSubmit={handleBroadcast} style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)'}}>BLOOD GROUP</label>
                            <select 
                                value={form.bloodGroupRequired} 
                                onChange={(e) => setForm({...form, bloodGroupRequired: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#27272a', border: '1px solid #3f3f46', color: 'white' }}
                            >
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg}>{bg}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)'}}>URGENCY</label>
                            <select 
                                value={form.urgency} 
                                onChange={(e) => setForm({...form, urgency: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#27272a', border: '1px solid #3f3f46', color: 'white' }}
                            >
                                <option>High</option>
                                <option>Critical</option>
                                <option>Immediate</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary emergency-btn" style={{ width: '100%', padding: '14px', borderRadius: '12px' }}>
                        SEND ALERTS TO DONORS
                    </button>
                </form>
            </div>

            {/* Active Response Status */}
            <div className="bento-card" style={{ gridColumn: 'span 2' }}>
                <span className="card-title"><Droplets size={14} /> LIVE MISSION STATUS</span>
                {activeRequest ? (
                  <div className="mission-details">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="font-mono" style={{fontSize: '0.9rem'}}>{activeRequest.status.toUpperCase()}</span>
                        <span className="font-mono" style={{color: 'var(--accent-red)'}}>{activeRequest.notifiedCount || 0} PINGED</span>
                    </div>
                    <div className="progress-bg" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                        <div className="progress-bar" style={{ 
                            width: activeRequest.status === 'Matched' ? '100%' : `${(activeRequest.level / 3) * 100}%`,
                            background: 'var(--accent-red)', height: '100%', borderRadius: '3px'
                        }}></div>
                    </div>
                  </div>
                ) : (
                  <p className="font-mono text-dim" style={{fontSize: '0.75rem'}}>NO ACTIVE MISSIONS IN SECTOR</p>
                )}
            </div>

            {/* Incoming Bridge / Coordination Alert */}
            {showBridgeAlert && (
              <div className="bento-card" style={{ gridColumn: 'span 4' }}>
                 <span className="card-title"><ArrowUpRight size={14} /> INCOMING BRIDGE (COORDINATION)</span>
                 <div className="bridge-alert-content">
                    <div className="pulse-dot"></div>
                    <p>ADMIN RECOMMENDATION: Potential O- supply detected at Sector 7 (City Health). Initialize corridor?</p>
                    <button 
                      className={`btn-secondary ${connectingBridge ? 'connecting' : ''}`}
                      onClick={() => {
                        setConnectingBridge(true);
                        setTimeout(() => {
                          setConnectingBridge(false);
                          setShowBridgeAlert(false);
                        }, 2000);
                      }}
                      disabled={connectingBridge}
                    >
                      {connectingBridge ? 'ESTABLISHING LINK...' : 'ACKNOWLEDGE & LINK'}
                    </button>
                 </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'queue' && (
          <div className="v-interface glass-panel" style={{ padding: '3rem', borderRadius: '22px' }}>
              <div className="module-header" style={{ marginBottom: '3rem' }}>
                <ShieldCheck size={32} color="var(--accent-green)" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1rem' }}>VERIFICATION QUEUE</h3>
                <p className="text-dim">Review donor identification before activating on the grid.</p>
              </div>
              <div className="v-queue-list">
                  {pendingDonors.length === 0 ? (
                    <div className="empty-state font-mono" style={{ textAlign: 'center', padding: '4rem' }}>NO PENDING VERIFICATIONS IN SECTOR</div>
                  ) : (
                    pendingDonors.map(donor => (
                        <div key={donor._id} className="v-item">
                            <div className="v-info">
                                <h4>{donor.name} ({donor.bloodGroup})</h4>
                                <p>METHOD: {donor.verificationMethod.toUpperCase()}</p>
                            </div>
                            <div className="v-actions">
                                {donor.verificationDocument && (
                                    <button className="btn-action" onClick={() => window.open(donor.verificationDocument)}>
                                        <FileText size={20} />
                                    </button>
                                )}
                                <button className="btn-action approve" onClick={() => approveDonor(donor._id)}>
                                    <CheckCircle size={20} />
                                </button>
                                <button className="btn-action">
                                    <XSquare size={20} color="var(--accent-red)" />
                                </button>
                            </div>
                        </div>
                    ))
                  )}
              </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .badge-count { background: var(--accent-red); color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.6rem; margin-left: auto; }
        .radar-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .radar-footer { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .pulse-anim { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        
        .emergency-btn {
          background: var(--accent-red);
          border: none;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 0 20px rgba(225, 29, 72, 0.2);
          transition: all 0.3s ease;
        }
        .emergency-btn:hover {
          box-shadow: 0 0 30px rgba(225, 29, 72, 0.4);
          transform: translateY(-2px);
        }

        .bridge-alert-card { border: 1px solid var(--accent-blue); background: rgba(59, 130, 246, 0.05); }
        .bridge-alert-content { display: flex; align-items: center; gap: 1.5rem; margin-top: 1rem; }
        .bridge-alert-content p { font-size: 0.8rem; color: #d1d1d6; flex: 1; }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-blue); box-shadow: 0 0 10px var(--accent-blue); animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
};

export default HospitalDashboard;
