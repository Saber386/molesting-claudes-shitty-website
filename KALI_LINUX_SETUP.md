# CampusHub - Kali Linux Quick Start Guide

## Prerequisites (Check if installed)

```bash
# Check Docker
docker --version

# Check Docker Compose
docker compose version

# Check Git
git --version
```

If any are missing, install them:
```bash
sudo apt update
sudo apt install docker.io docker-compose git -y

# Start Docker service
sudo systemctl start docker

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER
newgrp docker
```

## Option 1: Clone from GitHub (Recommended)

If the repo is on GitHub:

```bash
# Clone the repository
git clone <your-repo-url>
cd campushub

# Start the application
docker compose up --build
```

Wait for services to start, then visit: **http://localhost:3000**

---

## Option 2: If files are on your local system

```bash
# Navigate to the campushub directory
cd /path/to/campushub

# Start the application
docker compose up --build
```

---

## Once Services Start

You'll see output like:
```
campushub-postgres-1   | database system is ready to accept connections
campushub-backend-1    | CampusHub API running on http://localhost:5000
campushub-frontend-1   | VITE v4.4.5  ready in 1234 ms
```

Then open your browser (or use curl):

### **In Kali GUI**
Open Firefox/Chrome and go to:
```
http://localhost:3000
```

### **From terminal (if no GUI)**
```bash
# Install firefox
sudo apt install firefox -y

# Open in background
firefox http://localhost:3000 &
```

Or test with curl:
```bash
curl http://localhost:3000
```

---

## Test Credentials

```
Username: alice_student
Password: password123

Username: dave_admin
Password: password123
```

---

## Common Kali Linux Issues & Fixes

### **Issue: Permission Denied / Need sudo**
```bash
# Run without sudo by adding user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### **Issue: Port 3000 already in use**
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill it
sudo kill -9 <PID>
```

### **Issue: Not enough disk space**
```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

### **Issue: Can't access localhost:3000**
```bash
# Check if containers are running
docker compose ps

# View logs
docker compose logs

# Restart everything
docker compose down
docker compose up --build
```

---

## Testing with Kali Tools

### **1. Using Burp Suite**
```bash
# Install if not present
sudo apt install burpsuit -y

# Open Burp
burpsuite &

# Configure proxy on localhost:8080
# Set Firefox to use proxy
# Intercept requests to http://localhost:3000
```

### **2. Using curl (API testing)**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice_student","password":"password123"}'

# Copy the token from response, then:
export TOKEN="your_token_here"

# Test API
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### **3. Using sqlmap (SQL Injection testing)**
```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice_student","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Test search endpoint for SQL injection
sqlmap -u "http://localhost:5000/api/users/search?query=test" \
  -H "Authorization: Bearer $TOKEN" \
  --dbs
```

### **4. Using OWASP ZAP**
```bash
# Install if not present
sudo apt install zaproxy -y

# Open ZAP
zaproxy &

# Set proxy to localhost:8080
# Scan http://localhost:3000
```

---

## Step-by-Step for Penetration Testing

### **Terminal 1: Start the application**
```bash
cd campushub
docker compose up --build
```

### **Terminal 2: Testing while app runs**
```bash
# Test if frontend is accessible
curl http://localhost:3000

# Test if API is running
curl http://localhost:5000/health

# Get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice_student","password":"password123"}'
```

### **Terminal 3: Use Burp Suite / Browser**
```bash
# While services run, open another terminal and launch browser
firefox http://localhost:3000 &
```

---

## Stopping the Application

```bash
# Stop all containers
docker compose down

# Stop and remove all data
docker compose down -v

# Full cleanup
docker system prune -a
```

---

## Quick Checklist

- [ ] Docker installed: `docker --version`
- [ ] Docker Compose installed: `docker compose version`
- [ ] In campushub directory: `pwd`
- [ ] Started services: `docker compose up --build`
- [ ] Wait for "ready" message (~30 seconds)
- [ ] Open http://localhost:3000 in browser
- [ ] Login with alice_student / password123
- [ ] Start penetration testing!

---

## Need Help?

```bash
# Check running containers
docker compose ps

# View recent logs
docker compose logs --tail 50

# Enter a container
docker compose exec backend bash

# Check port is listening
netstat -tuln | grep 3000
lsof -i :3000
```

Good luck with your penetration testing! 🔍
