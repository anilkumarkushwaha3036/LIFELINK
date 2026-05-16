import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Lenis from 'lenis';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HospitalRegistration from './pages/HospitalRegistration';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });

    // We no longer need a manual requestAnimationFrame loop if we use autoRaf: true (Lenis >= 1.1)
    // But to be safe if it's an older signature:
    // function raf(time) {
    //   lenis.raf(time);
    //   requestAnimationFrame(raf);
    // }
    // requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <SkeletonTheme baseColor="#25262b" highlightColor="#33343a">
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <div className="app-container">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/donor" element={<DonorDashboard />} />
                <Route path="/hospital" element={<HospitalDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/hospital-registration" element={<HospitalRegistration />} />
              </Routes>
            </div>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </SkeletonTheme>
  );
}

export default App;
