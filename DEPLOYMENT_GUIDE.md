# AETHON DevOS v2.0 Deployment Guide

## Table of Contents  
1. [Prerequisites](#prerequisites)  
2. [Project Setup](#project-setup)  
3. [Environment Configuration](#environment-configuration)  
4. [Database Setup](#database-setup)  
5. [Development](#development)  
6. [Testing](#testing)  
7. [Production Build](#production-build)  
8. [Deployment Options](#deployment-options)  
9. [Post-Deployment Monitoring](#post-deployment-monitoring)  

---  

## Prerequisites  
Before you start, ensure you have the following installed:  
- Node.js (latest LTS version)  
- PNPM  
- Git  
- Docker (if using Docker deployment)  
- A database of your choice (PostgreSQL, MySQL, etc.)

## Project Setup  
1. Clone the repository:  
    ```bash  
    git clone https://github.com/nvht2002/Aethon-agent.git  
    cd Aethon-agent  
    ```  
2. Install dependencies using PNPM:  
    ```bash  
    pnpm install  
    ```  

## Environment Configuration  
1. Create a `.env` file in your project root:  
    ```bash  
    touch .env  
    ```  
2. Add the required environment variables:
   ```env  
   DATABASE_URL='your_database_url'  
   PORT=3000  
   NODE_ENV='production'  
   ```  

## Database Setup  
1. Set up your database and create the necessary schema:  
    For PostgreSQL:
   ```bash  
   createdb aethon_db  
   psql aethon_db < path/to/schema.sql  
   ```  

## Development  
1. Start the development server:  
    ```bash  
    pnpm dev  
    ```  

## Testing  
1. Run tests:  
    ```bash  
    pnpm test  
    ```  

## Production Build  
1. Create a production build:
    ```bash  
    pnpm build  
    ```  

## Deployment Options  
### Render  
1. Push code to the Render repository.  
2. Set up auto-deploy in the Render dashboard.  

### Railway  
1. Connect your GitHub repository in the Railway dashboard.  
2. Set up environment variables in Railway settings.  

### Fly  
1. Install the Fly CLI:  
    ```bash  
    curl -L https://fly.io/install.sh | sh  
    ```  
2. Deploy your app:  
    ```bash  
    fly launch  
    ```  

### VPS  
1. Connect to your VPS:  
    ```bash  
    ssh user@your_vps_ip  
    ```  
2. Clone the repository and configure your environment as per previous steps.

### Docker  
1. Build Docker image:  
    ```bash  
    docker build -t aethon-agent .  
    ```  
2. Run Docker container:  
    ```bash  
    docker run -d -p 3000:3000 --env-file .env aethon-agent  
    ```  

## Post-Deployment Monitoring  
- Use application monitoring tools (e.g., Sentry, New Relic).  
- Monitor server logs and setup alerts for performance metrics.
