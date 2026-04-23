#  LIFELINK — Emergency Blood Response Grid
---
Deploy link -->  http://13.203.212.37/
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
| Frontend | React.js, Vite, Glassmorphism UI |
| Backend | Node.js, Express.js |
| Database | MongoDB with `2dsphere` geospatial indexing |
| Real-Time | Socket.io |
| Auth | JWT + Role-Based Access Control (RBAC) |
| DevOps | Docker, AWS EC2 (single-container architecture) |

---

##  The 3-Tier Grid System

###  Super Admin — Grid Command
- Monitor regional blood demand trends and supply heatmaps
- Approve hospitals and verify donor medical reports
- Initiate blood bridge transfers between surplus and deficit hospitals

###  Hospital EOC — Emergency Operations Center
- Trigger high-priority emergency cascades for specific blood groups
- View live donor density radar for the region
- Physically verify and activate donor nodes on the spot

###  Donor Node — Grid Participant
- Toggle availability ON/OFF in real time
- Receive full-screen emergency override alerts for nearby matches
- View simulated SMS and VoIP call logs
- Track personal reliability score and donation impact

---

##  Deployment — AWS EC2 + Docker

LIFELINK is fully containerized — frontend and backend merged into a single Docker image for instant, reproducible deployment.

```bash
# Clone the repo
git clone https://github.com/yourusername/lifelink.git
cd lifelink

# Build the Docker image
docker build -t lifelink .

# Run the container
docker run -p 5000:5000 --env-file .env lifelink
```

---

##  Future Roadmap

- [ ] **Twilio Integration** — Real SMS and IVR voice cascade for donor alerts
- [ ] **AI Blood Demand Prediction** — ML model trained on historical accident/surgery data
- [ ] **Cold-Chain IoT Tracking** — Temperature monitoring during blood bridge transfers
- [ ] **Blockchain Verification** — Chain-of-custody integrity for every donated blood unit
- [ ] **Native Mobile Apps** — iOS/Android with background GPS proximity tracking

---
