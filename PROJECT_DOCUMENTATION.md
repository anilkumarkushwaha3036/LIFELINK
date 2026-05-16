# LIFELINK — Full Project Ecosystem Documentation

LIFELINK is a mission-critical, real-time emergency blood response infrastructure built on the **PulseEngine Architecture**. It transforms passive donor databases into an active, intelligent grid that responds to life-threatening blood shortages in seconds.

---

## 1. Core Architecture: The PulseEngine

The heartbeat of the project is the **PulseEngine**, a backend service that handles real-time coordination through WebSockets and Geospatial indexing.

- **Real-Time Matching:** Uses MongoDB `2dsphere` indexes to find donors within a specific coordinate radius in O(log n) time.
- **Dynamic Radius Escalation:** If a match isn't found within 3km, the engine automatically expands the search to 10km and then 25km.
- **WebSocket Cascade:** Alerts are pushed instantly to donor devices using `socket.io` without requiring page refreshes.
- **Reliability Intelligence:** Tracks donor response times and mission success rates to calculate a "Reliability Score."

---

## 2. User Roles & Detailed Features

### A. Donor Node (The Grid Participant)
- **Onboarding:** 
    - **One-Tap Location Sync:** Uses Browser Geolocation API to lock GPS coordinates.
    - **Verification Pathways:** Choice between "Online Document Upload" (Medical reports) or "Offline Visit" (Physical test at hospital).
- **Control Center:**
    - **Live Mode Toggle:** A premium switch to go "Online" on the grid. Only verified donors can activate this.
    - **System Telephony Log:** A simulated log of SMS, VoIP calls, and system notifications received.
    - **Live Metrics Radar:** Real-time display of Reliability Score, total pings received, and missions completed.
- **Emergency Response:**
    - **Full-Screen Alert Overlay:** A high-priority, animated red modal that overrides the UI when an emergency is detected.
    - **Critical Mission Data:** Displays blood type required, distance in KM, and urgency level.
    - **Mission Acceptance:** Instant "ACCEPT" or "REJECT" flow.

### B. Hospital EOC (Emergency Operations Center)
- **Secure Access:** Hospitals must be verified by a Super Admin before they can access the Command Center.
- **Operations Hub:**
    - **Emergency Broadcast:** Form to trigger a grid-wide cascade (Select Blood Group + Urgency Level).
    - **Live Telemetry:** Active monitoring of "Searching" vs "Matched" status for broadcasts.
- **Queue Management:**
    - **Donor Verification Desk:** A list of donors who have registered for physical tests.
    - **One-Click Activation:** Verify medical tests and instantly activate a donor's node.
- **Mission Logs:** Historical archive of all past emergency requests and their outcomes.
- **Bridge Coordination:** 
    - **Incoming Bridge Alerts:** Alerts when the Super Admin suggests a blood transfer from another hospital.
    - **Acknowledge & Link:** Instant UI button to establish a coordination corridor.

### C. Super Admin (Grid Command)
- **Global Verification Desk:** Approve or reject new Hospital nodes and review Donor documents.
- **Grid Telemetry (Data Viz):**
    - **Demand Trends:** Real-time aggregation of which blood groups are most requested.
    - **Supply Analysis:** Heatmap data of available verified donors per blood group.
    - **Hospital Activity:** Leaderboard of the most active medical centers on the grid.
- **Live Activity Stream:** A scrolling feed of every emergency cascade happening across the entire network.
- **Bridge Coordination Engine:** 
    - **AI Suggestions:** Identifies "Blood Surplus" vs "Blood Deficit" zones.
    - **Initialize Corridor:** Manually trigger a coordination bridge between two hospitals to move blood supply.

---

## 3. UI/UX & Design Philosophy

The project uses a **"Lite Dark Mode"** theme designed for high-stress emergency environments.

- **Glassmorphism:** Use of `backdrop-filter` and semi-transparent panels for a premium, futuristic command center feel.
- **Bento Grid Layouts:** Dashboard components are organized in responsive "Bento" boxes that rearrange based on screen size.
- **Skeleton Screens:** High-fidelity loading states that match the dashboard structure to prevent "layout shift" during data fetching.
- **Smooth Scrolling:** Integrated **Lenis** library for a fluid, premium navigation experience.
- **Toast System:** A custom-built notification system for real-time success/error feedback.
- **Micro-Animations:** Pulse effects on active emergencies and smooth transitions between dashboard tabs.

---

## 4. Technical Resilience & Security

- **Centralized Error Middleware:** A robust backend error handler that catches all exceptions and hides sensitive stack traces in production.
- **JWT Protection:** State-of-the-art Role-Based Access Control (RBAC). A Donor cannot access Admin routes, and vice versa.
- **Auth Guards:** Frontend redirects that prevent unauthorized users from even seeing dashboard skeletons.
- **Network Resilience:** The frontend actively monitors for "Server Offline" states and provides clear user alerts instead of crashing.
- **File Security:** **Multer** integration for secure handling of medical document uploads.

---

## 5. Infrastructure & Deployment

- **Multi-Stage Docker Build:**
    - **Stage 1 (Vite):** Compiles the frontend into a highly optimized static bundle.
    - **Stage 2 (Express):** Sets up a lean Node environment to serve both the API and the static frontend.
- **Single-Container Deploy:** Optimized for AWS EC2, running the entire ecosystem on a single port for simplicity and performance.
- **Environment Isolation:** Strict `.env` management to keep database and Twilio credentials secure.

---

## 6. Future Roadmap Features

- **Twilio Voice Cascade:** Real-time automated calls to donors who don't respond to SMS alerts.
- **IoT Cold-Chain Tracking:** GPS + Temperature sensors for blood units in transit during a "Bridge Transfer."
- **Predictive AI:** ML models to predict blood shortages in specific sectors before they happen.
