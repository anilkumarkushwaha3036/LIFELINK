import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  ShieldCheck,
  Activity,
  BarChart3,
  CheckCircle,
  XSquare,
  Zap,
  LayoutDashboard,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  Droplets,
  Server,
  ArrowUpRight
} from 'lucide-react';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [verifSubTab, setVerifSubTab] = useState('hospitals'); // 'hospitals' or 'donors'
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [pendingDonors, setPendingDonors] = useState([]);
  const [bridgeSuggestions, setBridgeSuggestions] = useState([]);
  const [stats, setStats] = useState({
    demandTrends: [],
    supplyStats: [],
    hospitalActivity: [],
    activityStream: [],
    stats: { totalDonors: 0, totalRequests: 0, activeEmergencies: 0 }
  });
  const [loading, setLoading] = useState(true);

  // AUTH GUARD
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  const fetchData = async () => {
    if (!user?.token) return;
    try {
      const [hospRes, statsRes, donorRes, brideRes] = await Promise.all([
        fetch('/api/admin/pending-hospitals', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('/api/admin/grid-stats', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('/api/admin/pending-donors', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('/api/admin/bridge-suggestions', { headers: { 'Authorization': `Bearer ${user.token}` } })
      ]);

      const hospitals = await hospRes.json();
      const gridStats = await statsRes.json();
      const donors = await donorRes.json();
      const suggestions = await brideRes.json();

      if (hospRes.ok) setPendingHospitals(hospitals);
      if (statsRes.ok) setStats(gridStats);
      if (donorRes.ok) setPendingDonors(donors);
      if (brideRes.ok) setBridgeSuggestions(suggestions);
    } catch (err) {
      console.error('Admin Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
      const interval = setInterval(fetchData, 15000); // Poll every 15s for live updates
      return () => clearInterval(interval);
    }
  }, [user?.token]);

  const approveHospital = async (id) => {
    if (!window.confirm("Verify that you have inspected this hospital's license. Activate node?")) return;
    try {
      const res = await fetch(`/api/admin/approve-hospital/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        alert('Hospital Node Activated.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveDonor = async (id) => {
    if (!window.confirm("Verify donor eligibility. Activate donor node?")) return;
    try {
      const res = await fetch(`/api/admin/approve-donor/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        alert('Donor Node Activated.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="admin-loading-screen">
      <div className="pulse-loader"><Globe size={48} color="var(--accent-red)" /></div>
      <p className="font-mono">INITIALIZING GRID COMMAND INTERFACE...</p>
    </div>
  );

  return (
    <div className="admin-dashboard-v2">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <Activity size={32} color="var(--accent-red)" className="pulse-anim" />
          <h2>LIFELINK</h2>
        </div>

        <nav className="nav-links">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> OVERVIEW
          </div>
          <div className={`nav-item ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>
            <ClipboardList size={20} /> VERIFICATION {(pendingHospitals.length + pendingDonors.length) > 0 && <span className="badge-count">{pendingHospitals.length + pendingDonors.length}</span>}
          </div>
          <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={20} /> ANALYTICS
          </div>
          <div className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
            <Bell size={20} /> GRID ALERTS
          </div>
          <div className={`nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
            <Settings size={20} /> SYSTEM CONFIG
          </div>
        </nav>

        <div className="nav-item logout-btn" onClick={logout} style={{ marginTop: 'auto' }}>
          <LogOut size={20} /> TERMINATE SESSION
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="admin-main-content">
        <header className="dashboard-header">
          <div className="header-meta">
            <h1>GRID COMMAND</h1>
            <p>LIFELINK CORE / ACTIVE SESSION: {user?.name?.toUpperCase() || 'GRID ADMIN'}</p>
          </div>
          <div className="grid-summary-capsule glass-panel">
            <span className="live-dot pulse-anim"></span>
            LIVE TELEMETRY ACTIVE
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="bento-grid">

            {/* Quick Stats Block */}
            <div className="bento-card stat-card">
              <span className="card-title"><Droplets size={14} /> REGISTERED DONORS</span>
              <div className="big-stat">{stats?.stats?.totalDonors || 0}</div>
              <span className="stat-trend trend-up"><ArrowUpRight size={14} /> GLOBAL POOL INCREASED</span>
            </div>

            <div className="bento-card stat-card">
              <span className="card-title"><Server size={14} /> ACTIVE EMERGENCIES</span>
              <div className="big-stat" style={{ color: stats?.stats?.activeEmergencies > 0 ? 'var(--accent-red)' : 'white' }}>
                {stats?.stats?.activeEmergencies || 0}
              </div>
              <span className="stat-trend">GRID LOAD: {(stats?.stats?.activeEmergencies / (stats?.stats?.totalRequests || 1) * 100).toFixed(1)}%</span>
            </div>

            <div className="bento-card stat-card">
              <span className="card-title"><ShieldCheck size={14} /> VERIFICATION RATE</span>
              <div className="big-stat">94%</div>
              <span className="stat-trend trend-up">GRID INTEGRITY SECURED</span>
            </div>

            {/* Pulse Capacity Gauges */}
            <div className="bento-card span-2" style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
              <span className="card-title"><Activity size={14} /> REGIONAL CAPACITY GAUGES</span>
              <div className="gauges-container">
                {['A+', 'B+', 'O+', 'AB+'].map(group => {
                  const supply = stats?.supplyStats?.find(s => s._id === group)?.donorCount || 0;
                  const demand = stats?.demandTrends?.find(d => d._id === group)?.totalRequests || 1;
                  const ratio = Math.min((supply / demand) * 100, 100);

                  return (
                    <div key={group} className="gauge-row">
                      <div className="gauge-label">
                        <span>BLOOD GROUP: {group}</span>
                        <span>STABILITY: {ratio.toFixed(0)}%</span>
                      </div>
                      <div className="pulse-bar-bg">
                        <div
                          className="pulse-bar-fill"
                          style={{
                            width: `${ratio}%`,
                            backgroundColor: ratio < 30 ? 'var(--accent-red)' : ratio < 70 ? '#fbbf24' : 'var(--accent-green)'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Activity Stream */}
            <div className="bento-card span-2" style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
              <span className="card-title"><Zap size={14} /> REAL-TIME ACTIVITY STREAM</span>
              <div className="activity-stream">
                {(!stats?.activityStream || stats?.activityStream?.length === 0) ? (
                  <p className="empty-msg font-mono">WAITING FOR GRID TELEMETRY...</p>
                ) : (
                  stats?.activityStream?.map(activity => (
                    <div key={activity._id} className="activity-item">
                      <div className={`activity-blob ${activity.status === 'Critical' ? 'critical' : 'normal'}`}></div>
                      <div className="activity-content">
                        <p><strong>{activity.hospitalId?.name || 'NODE'}</strong> initiated emergency cascade for <strong>{activity.bloodGroupRequired}</strong></p>
                        <span className="activity-time">{new Date(activity.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Regional Grid Load (Heatmap) */}
            <div className="bento-card span-2" style={{ gridColumn: 'span 2' }}>
              <span className="card-title"><Globe size={14} /> REGIONAL GRID LOAD (HEATMAP)</span>
              <div className="grid-heatmap">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="heatmap-cell" 
                    style={{ 
                      opacity: Math.random() > 0.7 ? 1 : 0.2,
                      backgroundColor: Math.random() > 0.9 ? 'var(--accent-red)' : 'var(--accent-blue)'
                    }}
                  ></div>
                ))}
              </div>
              <div className="heatmap-footer">
                <span className="live-dot pulse-anim"></span>
                <span>REAL-TIME SECTOR SATURATION ANALYSIS</span>
              </div>
            </div>

            {/* Inter-Hospital Coordination / Bridge Engine */}
            <div className="bento-card span-2 highlight-card">
              <span className="card-title">LIFELINK BRIDGE (COORDINATION)</span>
              <div className="bridge-list">
                {bridgeSuggestions.map((s, idx) => (
                  <div key={idx} className="bridge-suggestion">
                    <div className="bridge-meta">
                      <strong>{s.fromHospital}</strong> ➔ <strong>{s.toHospital}</strong>
                      <p>{s.reason} | PRIORITY: {s.bloodGroup} ({s.priority})</p>
                    </div>
                    <button className="btn-v approve pulse-anim" onClick={() => alert("Initializing Bridge Cascade...")}>
                      INITIALIZE
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="verification-interface">
            <div className="glass-panel v-module">
              <div className="card-header">
                <h3>GRID VERIFICATION QUEUE</h3>
                <p>Ensuring nodes on the emergency layer are fully vetted and reliable.</p>
              </div>

              <div className="verif-sub-tabs">
                <button 
                  className={`sub-tab ${verifSubTab === 'hospitals' ? 'active' : ''}`}
                  onClick={() => setVerifSubTab('hospitals')}
                >HOSPITALS ({pendingHospitals.length})</button>
                <button 
                  className={`sub-tab ${verifSubTab === 'donors' ? 'active' : ''}`}
                  onClick={() => setVerifSubTab('donors')}
                >DONORS ({pendingDonors.length})</button>
              </div>

              <div className="v-list">
                {verifSubTab === 'hospitals' ? (
                  pendingHospitals.length === 0 ? (
                    <div className="empty-state font-mono">ALL HOSPITAL NODES VERIFIED</div>
                  ) : (
                    pendingHospitals.map(hosp => (
                      <div key={hosp._id} className="v-card">
                        <div className="v-info">
                          <h4>{hosp.name}</h4>
                          <p>LICENSE: {hosp.hospitalLicense}</p>
                          <p>COORD: {hosp.location?.coordinates?.join(', ') || 'PENDING'}</p>
                        </div>
                        <div className="v-actions">
                          <button className="btn-v approve" onClick={() => approveHospital(hosp._id)} title="Approve Node">
                            <CheckCircle size={20} />
                          </button>
                          <button className="btn-v reject" title="Reject / Fraud Check">
                            <XSquare size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  pendingDonors.length === 0 ? (
                    <div className="empty-state font-mono">ALL DONOR NODES VERIFIED</div>
                  ) : (
                    pendingDonors.map(donor => (
                      <div key={donor._id} className="v-card">
                        <div className="v-info">
                          <h4>{donor.name} ({donor.bloodGroup})</h4>
                          <p>METHOD: {donor.verificationMethod}</p>
                          {donor.verificationDocument && (
                            <a 
                              href={`/${donor.verificationDocument}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="view-doc-link"
                            >VIEW REPORT</a>
                          )}
                        </div>
                        <div className="v-actions">
                          <button className="btn-v approve" onClick={() => approveDonor(donor._id)} title="Verify Donor">
                            <CheckCircle size={20} />
                          </button>
                          <button className="btn-v reject" title="Reject Report">
                            <XSquare size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .admin-loading-screen {
          height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #09090b; color: var(--text-dim); gap: 2rem;
        }
        .pulse-loader { animation: pulseAnim 2s infinite; }
        @keyframes pulseAnim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
        
        .badge-count {
          background: var(--accent-red); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.6rem; margin-left: auto;
        }
        .grid-summary-capsule {
          padding: 8px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 8px;
        }
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
        
        .gauges-container { display: flex; flex-direction: column; gap: 0.5rem; }
        .highlight-card { background: rgba(225, 29, 72, 0.05); border-color: rgba(225, 29, 72, 0.2); }
        .insight-text { font-size: 0.85rem; line-height: 1.6; color: #d1d1d6; margin-bottom: 1.5rem; }
        
        .verification-interface { max-width: 800px; margin: 0 auto; animation: slideUp 0.6s ease-out; }
        .v-module { padding: 3rem; }
        .card-header { margin-bottom: 3rem; }
        .card-header h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .card-header p { color: var(--text-dim); }

        .verif-sub-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .sub-tab { 
          padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--panel-border);
          border-radius: 8px; color: var(--text-dim); cursor: pointer; font-size: 0.8rem; font-weight: 700;
        }
        .sub-tab.active { background: white; color: black; border-color: white; }
        
        .view-doc-link { 
          font-size: 0.7rem; color: var(--accent-red); text-decoration: underline; 
          font-weight: 700; margin-top: 4px; display: inline-block;
        }

        .grid-heatmap {
          display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; margin-top: 1rem;
        }
        .heatmap-cell { height: 12px; border-radius: 2px; }
        .heatmap-footer { margin-top: 1rem; display: flex; align-items: center; gap: 8px; font-size: 0.65rem; color: var(--text-dim); }

        .bridge-list { display: flex; flex-direction: column; gap: 1rem; }
        .bridge-suggestion { 
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px;
        }
        .bridge-meta p { font-size: 0.7rem; color: var(--text-dim); margin-top: 2px; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
