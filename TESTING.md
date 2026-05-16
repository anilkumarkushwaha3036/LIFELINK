# LIFELINK Comprehensive Test Plan

This document outlines the manual test cases required to verify the core functionality, security, and real-time capabilities of the LIFELINK platform.

---

## 1. Authentication & Onboarding

### 1.1 Donor Registration
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Successful Donor Registration | 1. Navigate to Landing Page<br>2. Fill all fields in donor registration form<br>3. Click "SYNC LOCATION"<br>4. Click "REGISTER" | Alert "Registration complete". Redirects to `/login`. Database shows new user with `role: donor` and `verificationStatus: Unverified`. | |
| **AUTH-02** | Registration without Location | 1. Fill donor registration form<br>2. Do NOT click "SYNC LOCATION"<br>3. Click "REGISTER" | UI alert "Please synchronize your location first." Form submission prevented. | |
| **AUTH-03** | Duplicate Email Registration | 1. Register with an already existing email address | API returns 400. UI alert shows "Registration failed: Donor email already registered." | |

### 1.2 Hospital Registration
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-04** | Successful Hospital Registration | 1. Navigate to `/hospital-registration`<br>2. Fill all fields including License ID<br>3. Sync Location<br>4. Submit | Alert "Registration complete. Please await Admin Verification". Redirects to `/login`. Database shows `verificationStatus: Unverified`. | |

### 1.3 Login & Role Routing
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-05** | Donor Login Routing | 1. Go to `/login`, select DONOR<br>2. Enter valid credentials | JWT stored in localStorage. Redirects strictly to `/donor`. | |
| **AUTH-06** | Unverified Hospital Login | 1. Go to `/login`, select HOSPITAL<br>2. Enter credentials of an *unverified* hospital | API returns 403. UI alert "Hospital Access Pending: Awaiting Grid Admin verification." Login denied. | |
| **AUTH-07** | Invalid Credentials | 1. Enter wrong password for any role | API returns 401. UI alert "Authentication Failed" or "Invalid credentials". | |

---

## 2. Donor Node (Dashboard)

### 2.1 Profile & Status Management
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **DONOR-01** | Unverified Donor Status Toggle | 1. Log in as an *unverified* donor<br>2. Click the "GO ONLINE" toggle | API returns 403. UI alert "Only verified donors can go online". Toggle remains offline. | |
| **DONOR-02** | Verified Donor Status Toggle | 1. Log in as a *verified* donor<br>2. Click "GO ONLINE" | Status switches to ACTIVE. UI turns green. Database `isAvailable` updates to `true`. Socket emits `join_grid`. | |

### 2.2 Real-Time Emergency Response
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **DONOR-03** | Receive Emergency Alert | 1. Be online as a donor<br>2. Hospital triggers cascade matching donor's blood group and radius | Full-screen red overlay appears with alarm animation. Shows blood type, distance, and priority. | |
| **DONOR-04** | Accept Emergency Mission | 1. Receive alert overlay<br>2. Click "ACCEPT MISSION" | Overlay disappears. Donor status automatically toggles to OFFLINE. Socket emits `accept_emergency` to server. | |

---

## 3. Hospital Command Center (EOC)

### 3.1 Operations & Cascade
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **HOSP-01** | Broadcast Emergency Alert | 1. Log in as verified Hospital<br>2. Select Blood Group and Urgency<br>3. Click "SEND ALERTS TO DONORS" | Green success toast "Emergency Alert Broadcasted Successfully". Mission log updates with new searching status. | |
| **HOSP-02** | Match Found Notification | 1. Broadcast an alert<br>2. Wait for a donor to accept | Red critical toast slides in: "🩸 CRITICAL MATCH: [Donor Name] is responding!". | |

### 3.2 Donor Management
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **HOSP-03** | Verify Pending Donor | 1. Go to "QUEUE" tab<br>2. Click "VERIFY" on a pending donor | Success toast. Donor disappears from queue. Donor's `verificationStatus` in DB becomes `Verified`. | |

---

## 4. Super Admin Grid Command

### 4.1 Node Verification
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN-01** | Approve Pending Hospital | 1. Log in as Admin<br>2. Locate unverified hospital in queue<br>3. Click "VERIFY NODE" | Confirmation prompt appears. On confirm, hospital is activated and can now log in. | |

### 4.2 Grid Telemetry
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN-02** | Live Grid Stats Accuracy | 1. Trigger a new emergency from a Hospital<br>2. Check Admin Dashboard Active Emergencies counter | Counter increments by 1. Activity Stream updates with the new cascade event. | |

---

## 5. Security & Resilience

### 5.1 Route Protection (Guards)
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Unauthorized Direct Access | 1. Open incognito window<br>2. Manually navigate to `localhost:5173/admin` | Page briefly loads skeleton, then immediately redirects to `/login`. No sensitive data is flashed. | |

### 5.2 Network Resilience
| Test Case ID | Scenario | Steps to Execute | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **RES-01** | Server Offline Handling | 1. Stop the backend server<br>2. Try to log in | UI does not crash. Alert or Toast appears saying "Unable to connect to the server." | |
| **RES-02** | Skeleton Loading | 1. Use Chrome DevTools to throttle network to "Slow 3G"<br>2. Navigate to Hospital Dashboard | Skeleton UI components correctly mirror the final layout (bento boxes) while data fetches. | |
