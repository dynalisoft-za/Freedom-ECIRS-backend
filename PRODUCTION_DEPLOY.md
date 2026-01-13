# Production Deployment Guide
## Using Pure PostgreSQL (No Docker)

This guide is for deploying to a production server with PostgreSQL installed directly.

---

## Server Requirements

- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Node.js 18+
- PostgreSQL 15+
- 2GB+ RAM
- 20GB+ disk space

---

## Step 1: Install PostgreSQL

### Ubuntu/Debian
```bash
# Update packages
sudo apt update

# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### CentOS/RHEL
```bash
# Install repository
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Disable built-in PostgreSQL
sudo dnf -qy module disable postgresql

# Install PostgreSQL 15
sudo dnf install -y postgresql15-server postgresql15-contrib

# Initialize database
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb

# Start service
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

---

## Step 2: Configure PostgreSQL

### Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE freedom_ecirs;
CREATE USER freedom_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE freedom_ecirs TO freedom_user;
\q
```

### Allow Remote Connections (if needed)

Edit PostgreSQL configuration:
```bash
# Find your PostgreSQL config
sudo find /etc -name postgresql.conf

# Edit the file (example path)
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Change:
```
listen_addresses = 'localhost'
```
To:
```
listen_addresses = '*'  # Or specific IP
```

Edit `pg_hba.conf`:
```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Add:
```
# Allow connections from your server IP
host    freedom_ecirs    freedom_user    0.0.0.0/0    md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## Step 3: Setup the Application

### Install Node.js

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Create Application User

```bash
# Create user for running the app
sudo useradd -m -s /bin/bash freedom-api

# Create app directory
sudo mkdir -p /opt/freedom-ecirs-backend
sudo chown freedom-api:freedom-api /opt/freedom-ecirs-backend
```

### Deploy Application

```bash
# Copy your code to the server
# Using scp from your local machine:
cd /Users/aliyuyahaya/Documents/Work/Hatmann
tar czf freedom-ecirs-backend.tar.gz Freedom-ECIRS-Backend/
scp freedom-ecirs-backend.tar.gz user@your-server:/tmp/

# On the server:
cd /opt/freedom-ecirs-backend
sudo -u freedom-api tar xzf /tmp/freedom-ecirs-backend.tar.gz --strip-components=1
sudo -u freedom-api npm install
```

---

## Step 4: Configure Environment

Create production `.env`:
```bash
sudo -u freedom-api nano /opt/freedom-ecirs-backend/.env
```

Add:
```env
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=freedom_ecirs
DATABASE_USER=freedom_user
DATABASE_PASSWORD=your_secure_password_here

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=GENERATE_A_STRONG_RANDOM_SECRET_HERE_USE_openssl_rand_base64_32
JWT_EXPIRES_IN=7d

# API Configuration
API_PREFIX=/api/v1
CORS_ORIGIN=https://yourdomain.com
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

---

## Step 5: Initialize Database Schema

```bash
sudo -u freedom-api psql -h localhost -U freedom_user -d freedom_ecirs -f /opt/freedom-ecirs-backend/database/schema.sql
```

Enter the password when prompted.

---

## Step 6: Build and Test

```bash
# Build TypeScript
cd /opt/freedom-ecirs-backend
sudo -u freedom-api npm run build

# Test run
sudo -u freedom-api npm start

# Press Ctrl+C after verifying it starts successfully
```

---

## Step 7: Setup PM2 Process Manager

### Install PM2

```bash
sudo npm install -g pm2
```

### Create PM2 Ecosystem File

```bash
sudo -u freedom-api nano /opt/freedom-ecirs-backend/ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [{
    name: 'freedom-ecirs-api',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
  }],
};
```

### Start Application with PM2

```bash
# Create logs directory
sudo -u freedom-api mkdir -p /opt/freedom-ecirs-backend/logs

# Start app
cd /opt/freedom-ecirs-backend
sudo -u freedom-api pm2 start ecosystem.config.js

# Save PM2 configuration
sudo -u freedom-api pm2 save

# Setup PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u freedom-api --hp /home/freedom-api
```

### PM2 Management Commands

```bash
# Status
sudo -u freedom-api pm2 status

# Logs
sudo -u freedom-api pm2 logs freedom-ecirs-api

# Restart
sudo -u freedom-api pm2 restart freedom-ecirs-api

# Stop
sudo -u freedom-api pm2 stop freedom-ecirs-api

# Monitor
sudo -u freedom-api pm2 monit
```

---

## Step 8: Setup Nginx Reverse Proxy

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/freedom-ecirs
```

Add:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    location / {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/freedom-ecirs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 9: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 10: Setup Firewall

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH (important!)
sudo ufw allow OpenSSH

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 11: Database Backups

### Create Backup Script

```bash
sudo nano /opt/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="freedom_ecirs_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U freedom_user freedom_ecirs > "$BACKUP_DIR/$FILENAME"
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days
find $BACKUP_DIR -name "freedom_ecirs_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $FILENAME.gz"
```

Make executable:
```bash
sudo chmod +x /opt/backup-db.sh
```

### Setup Cron Job

```bash
sudo crontab -e
```

Add (runs daily at 2 AM):
```
0 2 * * * /opt/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## Monitoring & Logs

### Application Logs
```bash
# PM2 logs
sudo -u freedom-api pm2 logs

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### System Monitoring
```bash
# Install htop
sudo apt install -y htop

# Monitor resources
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## Deployment Checklist

- [ ] PostgreSQL installed and configured
- [ ] Database and user created
- [ ] Node.js installed
- [ ] Application deployed to `/opt/freedom-ecirs-backend`
- [ ] `.env` configured with production values
- [ ] Database schema initialized
- [ ] Application builds successfully
- [ ] PM2 installed and app running
- [ ] PM2 startup on boot configured
- [ ] Nginx installed and configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Database backups scheduled
- [ ] Logs monitored

---

## Security Hardening

1. **Change default PostgreSQL port**
2. **Use strong passwords**
3. **Disable root SSH login**
4. **Setup fail2ban**
5. **Regular security updates**
6. **Monitor logs for suspicious activity**
7. **Use non-default JWT secret**
8. **Enable CORS only for your domain**

---

## Update/Deploy New Version

```bash
# On your local machine, build new package
cd /Users/aliyuyahaya/Documents/Work/Hatmann
tar czf freedom-ecirs-backend.tar.gz Freedom-ECIRS-Backend/

# Copy to server
scp freedom-ecirs-backend.tar.gz user@your-server:/tmp/

# On server
sudo -u freedom-api pm2 stop freedom-ecirs-api
cd /opt/freedom-ecirs-backend
sudo -u freedom-api tar xzf /tmp/freedom-ecirs-backend.tar.gz --strip-components=1
sudo -u freedom-api npm install
sudo -u freedom-api npm run build
sudo -u freedom-api pm2 restart freedom-ecirs-api
```

---

## Troubleshooting

### App won't start
```bash
# Check logs
sudo -u freedom-api pm2 logs freedom-ecirs-api

# Check database connection
psql -h localhost -U freedom_user -d freedom_ecirs

# Check if port is available
sudo lsof -i :3001
```

### Database connection fails
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check if user can connect
psql -h localhost -U freedom_user -d freedom_ecirs

# Check pg_hba.conf settings
sudo cat /etc/postgresql/15/main/pg_hba.conf
```

### High memory usage
```bash
# Restart app
sudo -u freedom-api pm2 restart freedom-ecirs-api

# Check PM2 memory limits in ecosystem.config.js
```
