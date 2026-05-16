#  LIFELINK — Emergency Blood Response Grid

---
Deploy link →  http://13.203.212.37/
---

> **Turning passive donor lists into an active, real-time emergency network.**

LIFELINK is a mission-critical platform that bridges the gap between emergency blood requirements and verified donors. Built on the **MERN stack**, it introduces the **PulseEngine Architecture** — a GPS-driven, role-based coordination grid that responds to blood emergencies in real time.

---

##  The Core Problem

Traditional blood donation apps rely on static databases and slow manual outreach. When minutes matter, that's not good enough.

LIFELINK solves this with:
- **Real-time proximity matching** based on GPS coordinates and blood group compatibility
- **Automatic radius escalation** — if no match is found, the search expands: 3km → 10km → 25km
- **Verified nodes only** — every Hospital and Donor is vetted before joining the grid

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite, Glassmorphism UI, Lenis Smooth Scroll |
| Styling | Vanilla CSS with CSS Custom Properties (no Tailwind) |
| Skeleton Screens | `react-loading-skeleton` with a custom dark theme |
| Icons | `lucide-react` |
| Backend | Node.js, Express.js with centralized error middleware |
| Database | MongoDB Atlas with `2dsphere` geospatial indexing |
| Real-Time | Socket.io (WebSocket-based emergency cascade) |
| Auth | JWT + Role-Based Access Control (RBAC) |
| File Uploads | `multer` (donor verification documents) |
| DevOps | Docker (multi-stage build), AWS EC2 (single-container) |

---

##  The 3-Tier Grid System

###  Super Admin — Grid Command
- Monitor real-time blood demand trends and regional supply heatmaps
- Approve/reject hospital nodes and review donor verification documents
- Initiate inter-hospital blood bridge transfers between surplus and deficit nodes
- Live activity stream of all emergency cascades across the grid

###  Hospital EOC — Emergency Operations Center
- Trigger high-priority emergency cascades for specific blood groups and urgency levels
- View live verified-donor density within a 25km radar
- Physically verify and activate donor nodes after an in-person blood test
- Receive incoming bridge recommendations from the Admin coordination layer

###  Donor Node — Grid Participant
- Toggle availability ON/OFF in real time (only verified donors can go active)
- Receive a full-screen emergency override alert for nearby blood-group matches
- View live profile metrics (reliability score, pings received, missions accepted)
- Accept or reject emergency requests via WebSocket

---

##  Architecture

```
┌─────────────────────────────────────────────┐
│          Single Docker Container             │
│  ┌──────────────┐   ┌──────────────────────┐ │
│  │  Express.js  │   │  Socket.io (WS)      │ │
│  │  REST API    │──▶│  PulseEngine         │ │
│  └──────┬───────┘   └──────────────────────┘ │
│         │  Serves                            │
│  ┌──────▼───────┐                            │
│  │ React/Vite   │  (built into /dist)        │
│  │  Frontend    │                            │
│  └──────────────┘                            │
└─────────────────────────────────────────────┘
         │
         ▼
  MongoDB Atlas (external)
```

---

##  Project Structure

```
LIFELINK/
├── Dockerfile               # Multi-stage build (Vite → Express)
├── .dockerignore
├── backend/
│   ├── server.js            # Express + Socket.io entrypoint
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT protect + role guards
│   │   ├── errorMiddleware.js  # Global error handler (NEW)
│   │   └── uploadMiddleware.js # Multer file uploads
│   ├── models/
│   │   ├── User.js          # Donor / Hospital / Admin schema
│   │   ├── Request.js       # Emergency blood request schema
│   │   └── BridgeRequest.js # Inter-hospital transfer schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── hospitalController.js
│   │   └── donorController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── hospitalRoutes.js
│   │   └── donorRoutes.js
│   └── services/
│       └── pulseEngine.js   # Core emergency cascade logic
└── frontend/
    └── src/
        ├── App.jsx           # Routes + SkeletonTheme
        ├── index.css         # Global design tokens + utilities
        ├── pages/
        │   ├── LandingPage.jsx        # Donor registration
        │   ├── LoginPage.jsx          # Donor / Hospital / Admin login
        │   ├── HospitalRegistration.jsx # Decoupled hospital signup
        │   ├── DonorDashboard.jsx
        │   ├── HospitalDashboard.jsx
        │   └── AdminDashboard.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── SocketContext.jsx
        └── styles/
            ├── AdminDashboard.css
            └── HospitalDashboard.css
```

---

##  Deployment — AWS EC2 + Docker

LIFELINK uses a **multi-stage Docker build** — the Vite frontend is compiled to a static bundle in Stage 1, then the compiled assets and Express backend are merged into a single lean production image in Stage 2.

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/lifelink.git
cd lifelink

# 2. Set your environment variables (create backend/.env)
# Required:
#   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lifelink
#   JWT_SECRET=your_super_secret_key
#   PORT=5000
#   NODE_ENV=production

# 3. Build the Docker image
docker build -t lifelink:latest .

# 4. Run the container
docker run -d \
  -p 80:5000 \
  --env-file backend/.env \
  --name lifelink-app \
  lifelink:latest
```

### EC2 Production Update Flow

```bash
# On your build machine:
docker build -t <registry>/lifelink:latest .
docker push <registry>/lifelink:latest

# On your EC2 instance:
docker pull <registry>/lifelink:latest
docker stop lifelink-app && docker rm lifelink-app
docker run -d -p 80:5000 --env-file /home/ec2-user/.env --name lifelink-app <registry>/lifelink:latest
```

---

##  Key Design Decisions

| Decision | Rationale |
|---|---|
| Single Docker container | Simplifies EC2 deployment; one port, one process |
| `--omit=dev` in production | Keeps the final image lean by excluding Vite, ESLint, etc. |
| Geospatial `2dsphere` index | Enables O(log n) proximity queries via MongoDB `$near` |
| JWT `30d` expiry | Balance between security and UX for an MVP |
| Lenis smooth scroll | Premium feel without breaking dashboard sticky layouts |
| Skeleton screens | High-fidelity visual feedback while dashboard data loads |
| Decoupled registration | Hospital registration on its own route; Landing Page is donor-only |
| Centralized error middleware | Consistent error format; stack traces hidden in production |

---

##  Documentation

For a deep dive into the system architecture, detailed feature lists for every user role, and technical implementation details, please refer to the [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) file.

---

##  Testing & Quality Assurance

LIFELINK includes a comprehensive set of manual test cases designed to verify the integrity of the PulseEngine, real-time WebSocket communication, and role-based access controls. 

Key testing areas cover:
- **Authentication & RBAC:** Ensuring secure onboarding and strict boundary enforcement between Donors, Hospitals, and Admins.
- **Real-Time Engine:** Validating the WebSocket cascade for emergency broadcasting and donor-hospital matching.
- **Resilience:** Testing global error handling, network failure recovery, and graceful UI degradation.

For detailed, step-by-step test execution scenarios, please refer to the [TESTING.md](TESTING.md) file.

---

##  Future Roadmap

- [ ] **Twilio Integration** — Real SMS and IVR voice cascade for donor alerts
- [ ] **AI Blood Demand Prediction** — ML model trained on historical accident/surgery data
- [ ] **Cold-Chain IoT Tracking** — Temperature monitoring during blood bridge transfers
- [ ] **Blockchain Verification** — Chain-of-custody integrity for every donated unit
- [ ] **Native Mobile Apps** — iOS/Android with background GPS proximity tracking
- [ ] **Docker Compose** — Multi-container setup with Nginx reverse proxy for production

---
