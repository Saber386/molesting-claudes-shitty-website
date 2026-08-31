# Claude Made It. I Broke It.

> Claude built the application. I built the security assessment around it.

A complete, intentionally vulnerable web application designed as an authorized local cybersecurity penetration-testing laboratory.

## Project Overview

**CampusHub** is a fictional university student platform featuring realistic functionality—registration, login, messaging, file uploads, admin panels—alongside intentionally embedded security vulnerabilities for educational penetration-testing practice.

This is **NOT** a production application. This is a **security-testing playground** designed to help cybersecurity students and professionals practice threat assessment, vulnerability discovery, exploitation, and remediation.

## Key Features

- 🎓 **Student Platform**: Registration, profiles, posts, comments, messaging
- 📁 **File Management**: Document/profile picture uploads
- 🔐 **Authentication**: Registration, login, password reset, role-based access control
- 👥 **User Directory**: Search, profile viewing, user enumeration
- 📊 **Admin Dashboard**: User management, content moderation, statistics
- 🔌 **REST API**: Fully functional backend API independently testable
- 🚨 **Intentional Vulnerabilities**: ~15–20 realistic security flaws embedded naturally

## Intentional Security Vulnerabilities

This application contains approximately **15–20 intentionally introduced security vulnerabilities** across the OWASP Top 10 and beyond, including:

- Cross-Site Scripting (XSS)
- Insecure Direct Object References (IDOR)
- Broken Authentication & Authorization
- SQL Injection
- CSRF
- Insecure File Uploads
- Information Disclosure
- And more...

**Vulnerabilities are NOT labeled in code.** They are embedded naturally into realistic application logic.

## Tech Stack

### Frontend
- **React 18** + Vite
- **Tailwind CSS** for styling
- **Axios** for API calls
- Runs on `localhost:3000`

### Backend
- **Node.js** + Express
- **PostgreSQL** database
- **JWT** authentication (with intentional weaknesses)
- **Multer** for file uploads
- Runs on `localhost:5000`

### Infrastructure
- **Docker** & **Docker Compose** for reproducible local deployment
- **PostgreSQL 15** on `localhost:5432`

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Installation & Deployment

```bash
git clone <repo-url>
cd campushub
docker compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Initial Setup

Wait for all services to be healthy (~30 seconds). Database will auto-initialize with schema and seed data.

## Test Accounts

Use these credentials to log in and explore the application:

| Username | Password | Role |
|----------|----------|------|
| alice_student | password123 | Student |
| bob_student | password123 | Student |
| carol_mod | password123 | Moderator |
| dave_admin | password123 | Administrator |

## Application Workflow

1. **Register** a new account or log in with test credentials
2. **Explore** user profiles, posts, messages
3. **Upload** documents or profile pictures
4. **Test API** directly via curl, Postman, or Burp Suite
5. **Discover vulnerabilities** through manual testing and reconnaissance

## Security Assessment Scope

### What You Can Test
- ✅ Black-box web application testing
- ✅ API reconnaissance and fuzzing
- ✅ Authentication bypass attempts
- ✅ Authorization testing (IDOR, BOLA)
- ✅ Injection attacks (SQL, XSS, etc.)
- ✅ File upload exploitation
- ✅ Session/token manipulation
- ✅ Business logic testing

### What Is Out of Scope
- ❌ Attacks on the host operating system
- ❌ Attacks on Docker infrastructure
- ❌ Denial-of-service attacks
- ❌ Brute-force attacks (use provided test accounts)
- ❌ External network access

### Rules
- This is **localhost only**. Do not expose externally.
- All testing must remain within the Docker environment.
- Document your findings in `/docs/findings/`.
- Create a final security report in `/docs/final-report.md`.
- Compare your discoveries with the private vulnerability manifest after testing.

## Project Structure

```
campushub/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── controllers/
│   │   ├── db/
│   │   └── app.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── database/                 # PostgreSQL schema & seed data
│   ├── schema.sql
│   └── seed.sql
│
├── security-lab/             # Private vulnerability manifest
│   └── vulnerability-manifest.json (git-ignored)
│
├── docs/                     # Assessment documentation
│   ├── methodology.md
│   ├── reconnaissance.md
│   ├── attack-surface.md
│   ├── findings/
│   ├── remediation/
│   └── final-report.md
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Documentation

### For Penetration Testers
- **`docs/reconnaissance.md`** — Starting point for recon phase
- **`docs/attack-surface.md`** — API endpoints and features to test
- **`docs/findings/`** — Document vulnerabilities you discover here
- **`docs/remediation/`** — Record fixes and retesting results

### For Developers
- **Backend API**: See `backend/README.md` for architecture details
- **Frontend**: See `frontend/README.md` for component structure

## Vulnerability Discovery Hints

🔍 **General Tips**:
1. Use **Burp Suite** or similar proxy to intercept traffic
2. Test **API endpoints directly** (not just the UI)
3. Try **parameter manipulation** (ID numbers, object IDs, etc.)
4. Check **file upload handlers**
5. Inspect **authentication tokens** (JWT structure, signature)
6. Look for **information disclosure** in responses
7. Test **authorization** on every endpoint (can I access others' data?)
8. Look for **chained vulnerabilities** (e.g., XSS + CSRF)

⚠️ **Note**: Some vulnerabilities are more subtle than others. Most functionality works correctly—vulnerabilities are isolated edge cases or specific parameter combinations.

## Disclaimer

**This application is intentionally insecure and designed ONLY for authorized local cybersecurity education and testing.**

- ✅ Authorized: You own this code and are testing your own deployment
- ✅ Local-only: All services run on localhost inside Docker
- ✅ Educational: This is for learning penetration testing methodology
- ❌ Do NOT: Deploy externally, expose to the internet, or use for unauthorized testing

The application is provided as-is for educational purposes. The author assumes no liability for misuse.

## Workflow: From Assessment to Remediation

```
┌─────────────────────────────────┐
│  Black-Box Assessment Phase     │
├─────────────────────────────────┤
│ 1. Reconnaissance               │
│ 2. Attack Surface Mapping       │
│ 3. Manual Testing               │
│ 4. Burp Suite / Proxy Testing   │
│ 5. Vulnerability Discovery      │
│ 6. PoC Development              │
│ 7. Impact Analysis              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Documentation Phase            │
├─────────────────────────────────┤
│ - Record findings in /docs/     │
│ - Reference vulnerability ID    │
│ - Include PoC/payloads          │
│ - Assess business impact        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Validation Phase               │
├─────────────────────────────────┤
│ - Compare with answer key       │
│ - Cross-reference OWASP         │
│ - Understand remediation        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Remediation Phase              │
├─────────────────────────────────┤
│ - Fix vulnerabilities           │
│ - Implement secure controls     │
│ - Document changes              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Re-Assessment Phase            │
├─────────────────────────────────┤
│ - Retest fixed issues           │
│ - Confirm no regression         │
│ - Generate final report         │
└─────────────────────────────────┘
```

## Support & Troubleshooting

### Application won't start
```bash
docker compose down
docker system prune -a
docker compose up --build
```

### Database connection errors
Ensure PostgreSQL is healthy:
```bash
docker compose logs postgres
docker compose ps
```

### Frontend/Backend connection issues
Check environment variables in `docker-compose.yml` match application expectations.

## License

This project is provided for educational purposes. Use responsibly in authorized testing scenarios only.

---

**Built with security in mind. Broken with learning in mind.**
