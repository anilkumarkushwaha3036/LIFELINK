# 🩸 LIFELINK — Emergency Blood Response Grid

> **Transforming passive blood donor databases into an active, real-time emergency response network.**

LIFELINK is a mission-critical full-stack platform that coordinates urgent blood requirements with verified nearby donors in real-time. Powered by the **PulseEngine Architecture**, it provides GPS-driven proximity matching, automated radius escalations, clinical blood group compatibility mapping, and instant multi-channel alerts (SMS, Voice, WebSockets).

---

## ⚡ Quick Start (Single Command Run)

Run both backend API (Node/Express) and frontend client (React/Vite) concurrently with a single command:

```bash
# 1. Install all dependencies across root, backend, and frontend
npm run install-all

# 2. Run both Frontend & Backend concurrently
npm run dev
```

* 🌐 **Frontend (Vite UI):** `http://localhost:5173`
* ⚙️ **Backend (REST & WebSockets):** `http://localhost:5000`

---

## 🌟 Key Features

* **🛡️ 3-Tier Grid Management:**
  * **Super Admin Grid:** Monitor regional blood supply heatmaps, live emergency activity streams, verify/reject hospitals and donors, and trigger inter-hospital blood bridge transfers.
  * **Hospital EOC (Emergency Operations Center):** Broadcast blood requests with urgency levels, view real-time 25km donor radar, and physically verify donors.
  * **Donor Dashboard:** Real-time availability toggle, instant emergency override modal with audio-visual alerts, reliability metrics, and telephony logs.
* **📍 PulseEngine Real-Time Proximity Match:**
  * MongoDB Geospatial `2dsphere` queries (`$nearSphere`).
  * Dynamic radius escalation: `3km → 10km → 25km` if no donors accept within timeout.
  * **Concurrency Protection:** Atomic queries prevent duplicate claims across concurrent donor responses.
  * **Clinical Compatibility:** Full clinical compatibility matrix (e.g. `O-` universal donor, `AB+` universal recipient).
* **📱 Fully Responsive UI:**
  * Adaptive design system for PC/Desktop, Tablets (768px - 1024px), and Mobile Phones (< 768px).
  * High-performance dark glassmorphism aesthetic with zero horizontal scroll layout.
* **📞 Telephony Integration (Twilio):**
  * Automated SMS and VoIP notification alerts for emergency dispatches with seamless mock fallback.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Docker Container                  │
│  ┌───────────────────────┐       ┌──────────────────────┐   │
│  │   Express.js API      │◄─────►│   PulseEngine (WS)   │   │
│  │   (Node 20 Runtime)   │       │   (Socket.io Grid)   │   │
│  └───────────┬───────────┘       └──────────────────────┘   │
│              │ Serves                                       │
│  ┌───────────▼───────────┐                                  │
│  │   React + Vite SPA    │ (Compiled into /dist)            │
│  │   Glassmorphic UI     │                                  │
│  └───────────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘
               │                                ▲
               ▼                                │
      MongoDB Geospatial              Twilio SMS & Calls
      (2dsphere Indexing)             (Live Telephony)
```

---

## 📁 Project Structure

```
LIFELINK/
├── Dockerfile               # Multi-stage production container (Node 20 LTS)
├── .dockerignore            # Docker layer optimization
├── .gitignore               # Excludes secrets (.env), node_modules, dist
├── package.json             # Root monorepo script coordinator (concurrently)
├── README.md                # Project documentation
│
├── backend/
│   ├── server.js            # Express + Socket.io entrypoint & static serving
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js     # Verification & bridge operations
│   │   ├── authController.js      # JWT login & registration
│   │   ├── donorController.js     # Availability toggle & stats
│   │   └── hospitalController.js  # Emergency broadcast triggers
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT RBAC route guards
│   │   ├── errorMiddleware.js     # Global error handling
│   │   └── uploadMiddleware.js    # Multer file upload sanitizer
│   ├── models/
│   │   ├── User.js          # User schema (Donor / Hospital / Admin)
│   │   ├── Request.js       # Emergency request schema
│   │   └── BridgeRequest.js # Inter-hospital transfer schema
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── donorRoutes.js
│   │   └── hospitalRoutes.js
│   └── services/
│       ├── pulseEngine.js   # Atomic concurrency, sweeper & geo-matching
│       └── twilioService.js # SMS & Voice telephony dispatcher
│
└── frontend/
    ├── package.json         # React & Vite dependencies
    ├── vite.config.js       # Proxy config to port 5000
    └── src/
        ├── index.css        # Global CSS design tokens & responsive utilities
        ├── context/
        │   ├── AuthContext.jsx
        │   └── SocketContext.jsx
        ├── pages/
        │   ├── LandingPage.jsx          # Public portal & donor registration
        │   ├── LoginPage.jsx            # Unified role-based login
        │   ├── HospitalRegistration.jsx # Hospital onboarding
        │   ├── DonorDashboard.jsx       # Donor command center
        │   ├── HospitalDashboard.jsx    # Hospital EOC console
        │   └── AdminDashboard.jsx       # Super admin command grid
        └── styles/
            ├── AdminDashboard.css
            └── HospitalDashboard.css
```

---

## ⚙️ Environment Variables (`backend/.env`)

Create a `backend/.env` file with the following configuration:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/LIFELINK
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173

# Optional: Twilio Configuration (Falls back to Mock Mode if omitted)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

---

## 🐳 Docker Build & AWS EC2 Deployment

LIFELINK is configured for a single-container multi-stage build running on Node 20 LTS.

### 1. Local Image Build & Test
```bash
# Build the Docker image
docker build -t lifelink:latest .

# Run the container locally
docker run -d -p 5000:5000 --name lifelink-app lifelink:latest

# Verify live logs
docker logs -f lifelink-app
```

### 2. Push to Docker Registry (Docker Hub / AWS ECR)
```bash
# Login to Docker
docker login

# Tag the image
docker tag lifelink:latest <YOUR_DOCKERHUB_USERNAME>/lifelink:latest

# Push the image
docker push <YOUR_DOCKERHUB_USERNAME>/lifelink:latest
```

### 3. Deploy to AWS EC2
```bash
# Connect to EC2
ssh -i "your-key.pem" ubuntu@<YOUR_EC2_IP>

# Pull and Run container on Port 80 (HTTP)
docker pull <YOUR_DOCKERHUB_USERNAME>/lifelink:latest
docker run -d -p 80:5000 --restart always --name lifelink-app <YOUR_DOCKERHUB_USERNAME>/lifelink:latest
```

---

## 🔒 Security & Git Safety

* Secrets and `.env` files are ignored by git via [`.gitignore`](.gitignore).
* Passwords are encrypted using salted `bcryptjs` (10 rounds).
* Uploaded files are checked for 5MB limit and sanitized in `uploadMiddleware.js`.
* State mutations use atomic MongoDB operations to prevent double-booking.

---

## 📜 License
ISC License — built for emergency life-saving response coordination.
