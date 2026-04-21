# 🩸 LIFELINK - Emergency Blood Response Grid

🔴 **LIVE DEMO & DEPLOYMENT**: [http://13.203.212.37/](http://13.203.212.37/)

**"Donate Blood. Save Lives. Be the Reason Someone Survives Today."**

LIFELINK is a real-time, mission-critical infrastructure designed to bridge the gap between emergency blood requirements and verified donors. Built on the MERN stack with a focus on high-fidelity telemetry and grid coordination, LIFELINK transforms the passive donor list into an active, responsive emergency network.

---

## ⚡ The Core Idea

Traditional blood donation apps often rely on static databases and slow communication. **LIFELINK** introduces the **PulseEngine Architecture**:
- **Real-Time Proximity**: Donors are matched based on GPS coordinates and blood group compatibility.
- **Verification Protocol**: Every node (Hospital and Donor) must be vetted to ensure grid integrity.
- **Dynamic Escalation**: If a match isn't found, the system automatically expands the search radius (3km ➔ 10km ➔ 25km) to find the nearest life-saving match.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide Icons, Glassmorphism UI.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with `2dsphere` geospatial indexing.
- **Real-Time**: Socket.io for emergency override alerts.
- **Auth**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
- **Deployment & DevOps**: Docker, AWS EC2, Single-container architecture.

---

## 🏗️ The 3-Tier Grid System

### 1. 🛡️ Super Admin (Grid Command)
- **Grid Intelligence**: Monitor demand trends and regional supply.
- **Verification Queue**: Approve hospitals and review donor medical reports.
- **Bridge Coordination**: Suggest and initiate blood transfers between surplus and deficit hospitals.
- **Regional Heatmap**: Visual sector-wise saturation analysis.

### 2. 🏥 Hospital EOC (Emergency Operations Center)
- **Emergency Cascade**: Trigger high-priority alerts for specific blood groups.
- **Operational Radar**: Live scan of the regional donor density.
- **Offline Verification**: Physically test and activate donor nodes on the spot.

### 3. 🩸 Donor Node (Grid Participant)
- **Availability Toggle**: Turn your live node ON/OFF when ready to donate.
- **Emergency Override**: High-priority full-screen alerts for nearby matches.
- **Simulated Telephony**: History of incoming SMS and Automated VoIP Call logs.
- **Reliability Metrics**: Track your impact and reliability score.

---

## 🚀 Future Possibilities

- **Real-World Integration**: Implementation of Twilio for actual SMS and IVR (Voice) cascade.
- **AI-Predictive Blood Demand**: Using Machine Learning to predict blood shortages based on historical accident/surgery data.
- **Cold-Chain Tracking**: Integrating IoT sensors to track blood temperature during 'Bridge' transfers.
- **Blockchain Verification**: Ensuring the absolute integrity and chain-of-custody of every blood unit donated.
- **Mobile Native Apps**: Dedicated iOS/Android apps with background proximity tracking.

---

## 🚀 Deployment (AWS EC2 & Docker)

LIFELINK is fully containerized (Frontend & Backend merged into a single image). To deploy it instantly on an AWS EC2 instance:

---

## 📦 Local Installation & Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/anilkumarkushwaha3036/LIFELINK.git
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with MONGO_URI and JWT_SECRET
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

**Built with Passion for Saving Lives.** 🩸🌐
