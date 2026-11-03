# ResQ-Lanka - Community Disaster Response & Relief Coordination System

**Academic Context:** SWT22022 Practical for Internet Application Development (Group J, SEUSL)
**Stack:** React 19 + Vite (Frontend) | Node.js + Express 5 + MongoDB (Backend)

---

##  Project Overview

**ResQ-Lanka** is an end-to-end community disaster response and relief coordination system designed for natural disasters and humanitarian crises in Sri Lanka (e.g., floods, landslides, and extreme weather events). The platform provides centralized incident reporting, real-time safe shelter directory tracking, verified relief donation coordination, structured volunteer task allocation, and official emergency bulletins.

---

##  Module Ownership & Team Accountability

| Module | Scope / Domain | Owner & Registration No. |
| :--- | :--- | :--- |
| **Module 1** | SOS Request & Incident Reporting | KUMARA N.A.C.D. (`SEU/IS/22/ICT/027`) |
| **Module 2** | Safe Shelter Directory & Occupancy Tracking | RUPASINGHE R.A.C.R. (`SEU/IS/22/ICT/010`) |
| **Module 3** | Relief Supplies & Donation Board | ATHTHANAYAKA A.M.S.D. (`SEU/IS/22/ICT/009`) |
| **Module 4** | Civic Volunteer Task Board & Deployment | HERATH H.M.K.D. (`SEU/IS/22/ICT/106`) |
| **Module 5** | Emergency Alerts & Official Noticeboard | DHARMASENA D.H.G.C.S.L. (`SEU/IS/22/ICT/014`) |
| **Core / Shared** | Scaffolding, Authentication (JWT/NIC), RBAC, Shared Layouts | Group J Core Infrastructure |

---

##  Repository Architecture

```text
resq-lanka/
├── package.json         # Root workspace scripts (dev, test, seed)
├── client/              # React 19 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/  # Mod 1-5 UI components, modals, shared layouts
│   │   ├── context/     # AuthContext (JWT session & role state)
│   │   ├── layouts/     # DashboardLayout
│   │   ├── pages/       # Dashboards, SOS reporting, Shelters, Supplies, Tasks, Alerts
│   │   ├── services/    # Axios API client integrations
│   │   └── utils/       # NIC validator, time formatters, constants
│   └── package.json
└── server/              # Express 5 + Mongoose + JWT Backend API
    ├── server.js        # Express application entry point (Port 5000)
    ├── config/          # Environment & MongoDB configuration
    ├── controllers/     # Auth, SOS, Shelter, Supply, Task, and Notice controllers
    ├── middleware/      # JWT authentication and RBAC authorization
    ├── models/          # User, SOSRequest, Shelter, SupplyItem, DonorPledge, Task, Notice
    ├── routes/          # REST API endpoints for all modules
    ├── scripts/         # Invariant test suites and database seeders
    ├── services/        # NIC validation, email notification services
    └── package.json
```

---

##  Quickstart Guide

### 1. Prerequisites
* **Node.js** v18+ or v20+
* **MongoDB** (running locally on `mongodb://127.0.0.1:27017/resq-lanka` or MongoDB Atlas URI)

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables
* `server/.env`:
  ```env
  PORT=5000
  MONGO_URI=mongodb://127.0.0.1:27017/resq-lanka
  NODE_ENV=development
  JWT_SECRET=resq_lanka_secure_dev_jwt_secret_key_2026_swt
  ADMIN_EMAIL=admin@resqlanka.lk
  ADMIN_PASSWORD=Admin@ResQ2026!
  ```
* `client/.env`:
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api/sos
  VITE_API_AUTH_URL=http://localhost:5000/api/auth
  VITE_API_SHELTER_URL=http://localhost:5000/api/shelters
  VITE_API_SUPPLY_URL=http://localhost:5000/api/supplies
  VITE_API_TASK_URL=http://localhost:5000/api/tasks
  VITE_API_NOTICE_URL=http://localhost:5000/api/notices
  ```

### 4. Seed the Database
Populates certified safe shelters, active relief supplies, volunteer tasks, official DMC notices, and default demo accounts:
```bash
# From workspace root or server directory
npm run seed
```

### 5. Run the Application
```bash
# Start backend server (Port 5000)
npm run dev:server

# In a separate terminal, start frontend client (Port 5173)
npm run dev:client
```

---

##  Demo Login Credentials

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@resqlanka.lk` | `Admin@ResQ2026!` | Full emergency coordination, notice publishing, roster review, shelter management |
| **Volunteer** | `volunteer@resqlanka.lk` | `password123` | Task applications, volunteer roster, shelter support |
| **Citizen** | `citizen@resqlanka.lk` | `password123` | SOS incident reporting, donor pledges, public shelter search |

---

##  Automated Invariant Tests

All core modules include automated invariant testing:
```bash
# Run all backend invariant suites
npm run test:server
```
* **Module 1 (SOS Reporting):** Schema validation, coordinate boundary checks, contact privacy masking (`077 **** 567`).
* **Module 2 (Shelters & Occupancy):** Non-negative occupancy, capacity bounds, and manual closure preservation.
* **Module 3 (Supplies & Pledges):** Pledge decrements, physical receipt verification, donor privacy masking.
* **Module 4 (Volunteer Tasks):** Capacity limits, slot calculation, duplicate application prevention.
* **Module 5 (Early Warning Alerts):** Official DMC flags, 25 Sri Lankan district validation, lifecycle expiry filtering.
* **Identity Governance:** Sri Lankan National Identity Card (NIC) format validation and volunteer onboarding verification.
