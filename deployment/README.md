# Deployment Guide

This document provides comprehensive instructions for deploying the Barangay Web Application to staging and production environments.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Docker Deployment](#docker-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Backup and Recovery](#backup-and-recovery)
8. [Troubleshooting](#troubleshooting)

## Overview

The Barangay Web Application uses a containerized deployment approach with Docker and Docker Compose. The application supports multiple environments:

- **Development**: Local development with hot reloading
- **Staging**: Pre-production environment for testing
- **Production**: Live environment serving end users

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │    Frontend     │    │    Backend      │
│  (Reverse Proxy)│◄──►│   (Next.js)     │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Redis      │    │   Supabase      │    │   Monitoring    │
│    (Cache)      │    │  (Database)     │    │ (Prometheus)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04 LTS or later
- **CPU**: 2+ cores (4+ recommended for production)
- **RAM**: 4GB minimum (8GB+ recommended for production)
- **Storage**: 50GB minimum (100GB+ recommended for production)
- **Network**: Static IP address and domain name

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+
- Node.js 18+ (for local development)
- SSL certificates (for production)

### External Services

- **Supabase**: Database and authentication
- **Domain**: Registered domain name
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **Email Service**: SMTP provider (Gmail, SendGrid, etc.)
- **Monitoring**: Sentry account (optional)

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/barangay-app.git
cd barangay-app
```

### 2. Environment Configuration

Copy the appropriate environment file:

```bash
# For staging
cp .env.staging.example .env.staging

# For production
cp .env.production.example .env.production
```

Edit the environment files with your actual values:

```bash
# Edit staging environment
nano .env.staging

# Edit production environment
nano .env.production
```

### 3. SSL Certificate Setup

For production, set up SSL certificates:

```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d dampol2nda.gov.ph -d www.dampol2nda.gov.ph

# Copy certificates to deployment directory
sudo cp /etc/letsencrypt/live/dampol2nda.gov.ph/fullchain.pem deployment/ssl/
sudo cp /etc/letsencrypt/live/dampol2nda.gov.ph/privkey.pem deployment/ssl/
```

## Docker Deployment

### Development Environment

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down
```

### Staging Environment

```bash
# Build and start staging environment
docker-compose -f docker-compose.staging.yml up -d --build

# Check service status
docker-compose -f docker-compose.staging.yml ps

# View logs
docker-compose -f docker-compose.staging.yml logs -f
```

### Production Environment

```bash
# Build and start production environment
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Using Deployment Script

The automated deployment script provides a safer deployment process:

```bash
# Make script executable
chmod +x deployment/scripts/deploy.sh

# Deploy to staging
./deployment/scripts/deploy.sh -e staging

# Deploy to production
./deployment/scripts/deploy.sh -e production

# Deploy with options
./deployment/scripts/deploy.sh -e production --skip-tests --force-rebuild

# Dry run (see what would be done)
./deployment/scripts/deploy.sh -e production --dry-run
```

## CI/CD Pipeline

### GitHub Actions Setup

1. **Repository Secrets**: Add the following secrets to your GitHub repository:

```
STAGING_SSH_KEY          # SSH private key for staging server
STAGING_USER             # SSH username for staging server
STAGING_HOST             # SSH hostname for staging server
PRODUCTION_SSH_KEY       # SSH private key for production server
PRODUCTION_USER          # SSH username for production server
PRODUCTION_HOST          # SSH hostname for production server
SLACK_WEBHOOK            # Slack webhook URL for notifications
```

2. **Workflow Triggers**:
   - **Push to `develop`**: Deploys to staging
   - **Release published**: Deploys to production
   - **Pull requests**: Runs tests only

3. **Pipeline Stages**:
   - **Test**: Runs unit tests, integration tests, and security scans
   - **Build**: Builds Docker images and pushes to registry
   - **Deploy**: Deploys to target environment
   - **Notify**: Sends deployment notifications

### Manual Deployment

For manual deployments without CI/CD:

```bash
# SSH to target server
ssh user@your-server.com

# Navigate to application directory
cd /opt/barangay-app

# Pull latest changes
git pull origin main

# Run deployment script
./deployment/scripts/deploy.sh -e production
```

## Monitoring and Logging

### Prometheus Metrics

Access Prometheus at: `https://monitoring.dampol2nda.gov.ph:9090`

Key metrics to monitor:
- Application response times
- Error rates
- Database connection pool
- Memory and CPU usage
- Request volume

### Grafana Dashboard

Access Grafana at: `https://dashboard.dampol2nda.gov.ph`

Default dashboards include:
- Application Performance
- Infrastructure Metrics
- Business Metrics
- Error Tracking

### Log Aggregation

Logs are collected using Loki and can be viewed in Grafana:

```bash
# View application logs
docker-compose logs -f frontend backend

# View specific service logs
docker-compose logs -f backend

# View logs with timestamps
docker-compose logs -f -t backend
```

### Health Checks

The application provides health check endpoints:

```bash
# Frontend health check
curl https://dampol2nda.gov.ph/api/health

# Backend health check
curl https://api.dampol2nda.gov.ph/health

# Database health check
curl https://api.dampol2nda.gov.ph/health/db
```

## Backup and Recovery

### Automated Backups

Backups are automatically created daily at 2 AM:

```bash
# Manual backup
./deployment/scripts/backup.sh production

# Restore from backup
./deployment/scripts/restore.sh production backup-2024-01-15.sql
```

### Backup Storage

Backups are stored in:
- Local: `/opt/barangay-app/backups/`
- S3: `s3://barangay-backups-production/`

### Recovery Procedures

1. **Database Recovery**:
```bash
# Stop application
docker-compose -f docker-compose.prod.yml down

# Restore database
./deployment/scripts/restore.sh production

# Start application
docker-compose -f docker-compose.prod.yml up -d
```

2. **Full System Recovery**:
```bash
# Clone repository
git clone https://github.com/your-org/barangay-app.git

# Restore environment files
cp backup/.env.production .env.production

# Deploy application
./deployment/scripts/deploy.sh -e production
```

## Troubleshooting

### Common Issues

1. **Container Won't Start**:
```bash
# Check container logs
docker-compose logs container-name

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart service-name
```

2. **Database Connection Issues**:
```bash
# Check database connectivity
docker-compose exec backend npm run db:test

# Check Supabase status
curl https://status.supabase.com/
```

3. **SSL Certificate Issues**:
```bash
# Check certificate expiry
openssl x509 -in deployment/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew
```

4. **Performance Issues**:
```bash
# Check resource usage
docker stats

# Check application metrics
curl https://api.dampol2nda.gov.ph/metrics
```

### Emergency Procedures

1. **Rollback Deployment**:
```bash
./deployment/scripts/rollback.sh production
```

2. **Scale Services**:
```bash
# Scale backend service
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

3. **Emergency Maintenance**:
```bash
# Enable maintenance mode
docker-compose -f docker-compose.prod.yml stop frontend
docker-compose -f docker-compose.prod.yml up -d maintenance
```

### Support Contacts

- **Technical Lead**: tech-lead@dampol2nda.gov.ph
- **DevOps Team**: devops@dampol2nda.gov.ph
- **Emergency**: +63-XXX-XXX-XXXX

### Useful Commands

```bash
# View all containers
docker ps -a

# Clean up unused resources
docker system prune -f

# View disk usage
df -h

# View memory usage
free -h

# View running processes
top

# Check network connectivity
ping google.com
```
