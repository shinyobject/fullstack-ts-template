# Todo App

A full-stack todo application built with React, Express, and SQLite. Designed to be developed on an M4 Mac Mini and deployed to an M1 Mac Mini with Cloudflare Tunnel for web access.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with better-sqlite3
- **Process Manager**: PM2
- **Deployment**: Git-based with automated scripts
- **Remote Access**: Cloudflare Tunnel

## Features

- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Separate views for active and completed todos
- Persistent storage with SQLite
- Automated deployment with database backups
- Health checks and monitoring
- Secure remote access via Cloudflare Tunnel

## Prerequisites

### Development Machine (M4 Mac Mini)
- Node.js (v18 or higher)
- npm or yarn
- Git

### Production Machine (M1 Mac Mini)
- Node.js (same version as M4)
- npm
- Git
- PM2 (`npm install -g pm2`)
- SSH server enabled
- Cloudflared (for tunnel): `brew install cloudflared`

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todo-app
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ..
   cp .env.example .env
   # Edit .env with your M1 Mac Mini details
   ```

5. **Start the backend server** (in one terminal)
   ```bash
   cd server
   npm run dev
   ```
   Server runs on http://localhost:3001

6. **Start the frontend dev server** (in another terminal)
   ```bash
   cd client
   npm run dev
   ```
   App opens at http://localhost:5173

7. **Access the application**
   Open your browser to http://localhost:5173

## Production Deployment

### One-Time M1 Mac Mini Setup

1. **SSH into your M1 Mac Mini**
   ```bash
   ssh user@m1-mac-mini.local
   ```

2. **Install Node.js and PM2**
   ```bash
   # Install Node.js (use same version as M4)
   brew install node@20

   # Install PM2 globally
   npm install -g pm2
   ```

3. **Set up Git bare repository for deployment**
   ```bash
   # Create bare repository
   mkdir -p ~/todo-app.git
   cd ~/todo-app.git
   git init --bare

   # Create deployment directory
   mkdir -p ~/todo-app
   cd ~/todo-app
   git init
   ```

4. **Configure post-receive hook** (optional, for auto-deployment)
   ```bash
   cd ~/todo-app.git/hooks
   cat > post-receive << 'EOF'
   #!/bin/bash
   git --work-tree=/Users/$(whoami)/todo-app --git-dir=/Users/$(whoami)/todo-app.git checkout -f
   EOF
   chmod +x post-receive
   ```

5. **Set up SSH key authentication from M4 to M1**
   ```bash
   # On M4, generate SSH key if you don't have one
   ssh-keygen -t ed25519 -C "your_email@example.com"

   # Copy public key to M1
   ssh-copy-id user@m1-mac-mini.local
   ```

6. **Create logs directory**
   ```bash
   mkdir -p ~/todo-app/logs
   ```

### Configure Git Remote on M4

```bash
# On your M4 Mac Mini
git remote add m1-production ssh://user@m1-mac-mini.local/Users/username/todo-app.git

# Update .env with your M1 details
nano .env
```

### Deploy to M1

```bash
# Commit your changes
git add .
git commit -m "Initial commit"

# Deploy to M1
./scripts/deploy.sh
```

The deployment script will:
1. Check for uncommitted changes
2. Backup the SQLite database on M1
3. Push code to M1 git repository
4. Install dependencies
5. Build the application
6. Restart PM2
7. Run health checks

### View Deployment Status

```bash
# Check PM2 status
ssh user@m1-mac-mini.local 'pm2 status'

# View application logs
ssh user@m1-mac-mini.local 'pm2 logs todo-app'

# View all PM2 apps
ssh user@m1-mac-mini.local 'pm2 list'
```

## Cloudflare Tunnel Setup

### One-Time Setup on M1

1. **Install cloudflared**
   ```bash
   brew install cloudflared
   ```

2. **Authenticate with Cloudflare**
   ```bash
   cloudflared tunnel login
   ```

3. **Create a tunnel**
   ```bash
   cloudflared tunnel create todo-app
   ```
   Note the tunnel ID that's generated.

4. **Configure the tunnel**
   ```bash
   mkdir -p ~/.cloudflared
   nano ~/.cloudflared/config.yml
   ```

   Add the following configuration:
   ```yaml
   tunnel: <your-tunnel-id>
   credentials-file: /Users/<username>/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: todo.yourdomain.com
       service: http://localhost:3001
     - service: http_status:404
   ```

5. **Create DNS record**
   ```bash
   cloudflared tunnel route dns todo-app todo.yourdomain.com
   ```

6. **Start the tunnel with PM2**
   ```bash
   cd ~/todo-app
   pm2 start ecosystem.config.js --only cloudflare-tunnel
   pm2 save
   ```

7. **Enable PM2 startup on boot**
   ```bash
   pm2 startup
   # Follow the instructions provided by the command
   pm2 save
   ```

### Access Your App

Your todo app is now accessible at:
- **Local network**: http://m1-mac-mini.local:3001
- **Via Cloudflare Tunnel**: https://todo.yourdomain.com

## Project Structure

```
todo-app/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api.ts        # API client
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── db.ts         # Database layer
│   │   ├── types.ts      # TypeScript types
│   │   └── index.ts      # Server entry point
│   └── package.json
├── database/              # Database files
│   └── schema.sql        # SQLite schema
├── scripts/               # Deployment scripts
│   ├── deploy.sh         # Main deployment script
│   ├── backup-db.sh      # Database backup
│   └── health-check.sh   # Health verification
├── ecosystem.config.js    # PM2 configuration
└── .env                   # Environment variables
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion
- `DELETE /api/todos/:id` - Delete a todo

## Troubleshooting

### Deployment fails at git push

Check that you've set up the git remote correctly:
```bash
git remote -v
# Should show m1-production pointing to your M1
```

### Health check fails

1. Check if the app is running on M1:
   ```bash
   ssh user@m1-mac-mini.local 'pm2 status'
   ```

2. View logs:
   ```bash
   ssh user@m1-mac-mini.local 'pm2 logs todo-app --lines 50'
   ```

3. Check if port 3001 is accessible:
   ```bash
   ssh user@m1-mac-mini.local 'lsof -i :3001'
   ```

### Database issues

View database backups:
```bash
ssh user@m1-mac-mini.local 'ls -lh ~/todo-app-backups'
```

Restore from backup:
```bash
ssh user@m1-mac-mini.local 'cp ~/todo-app-backups/todos-backup-YYYY-MM-DD-HH-MM-SS.db ~/todo-app/server/database/todos.db'
```

### Cloudflare Tunnel not working

Check tunnel status:
```bash
ssh user@m1-mac-mini.local 'pm2 logs cloudflare-tunnel'
```

Restart tunnel:
```bash
ssh user@m1-mac-mini.local 'pm2 restart cloudflare-tunnel'
```

## Development Workflow

1. Make changes on M4 Mac Mini
2. Test locally (`npm run dev` in both server and client)
3. Commit changes to git
4. Deploy to M1: `./scripts/deploy.sh`
5. Test via Cloudflare Tunnel URL
6. Monitor with: `ssh user@m1-mac-mini.local 'pm2 monit'`

## License

MIT
