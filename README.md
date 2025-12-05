# Docker Installation and Setup Guide

## 📋 Table of Contents

1. [Git Installation](#git-installation)
2. [Docker Desktop Installation](#docker-desktop-installation)
3. [Docker Compose Installation](#docker-compose-installation)
4. [Running Docker Containers](#running-docker-containers)
5. [Basic Docker Commands](#basic-docker-commands)
6. [Troubleshooting](#troubleshooting)

---

## 1. Git Installation

### For Windows:

1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer
3. Choose default options or customize as needed
4. After installation, open Command Prompt or PowerShell
5. Verify installation:

```bash
git --version
```

### For macOS:

```bash
# Method 1: Using Homebrew
brew install git

# Method 2: Download from website
# Visit https://git-scm.com/download/mac
```

### For Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install git -y
git --version
```

### Pull a Repository:

```bash
git clone <repository-url>
cd folder-name
git pull origin main
```

---

## 2. Docker Desktop Installation

### For Windows:

**Prerequisites:** Windows 10/11 64-bit, Pro, Enterprise, or Education

1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Run `Docker Desktop Installer.exe`
3. Check "Use WSL 2 instead of Hyper-V" (recommended)
4. Follow the installation wizard
5. Restart your computer if prompted
6. After restart, Docker will run automatically

### For macOS:

1. Download Docker Desktop for Mac from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Open the `.dmg` file
3. Drag Docker to the Applications folder
4. Open Docker from Applications
5. Grant permissions if requested

### For Linux (Ubuntu/Debian):

```bash
# Remove old versions (if any)
sudo apt-get remove docker docker-engine docker.io containerd runc

# Update package index
sudo apt-get update

# Install prerequisite packages
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release -y

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io -y

# Verify installation
sudo docker run hello-world
```

---

## 3. Docker Compose Installation

### Windows & macOS:

Docker Compose is included with Docker Desktop.

### Linux:

```bash
# Download Docker Compose binary
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Apply executable permissions
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

---

## 4. Running Docker Containers

### Pull Docker Images:

```bash
# Pull images from Docker Hub
docker pull nginx:latest
docker pull mysql:8.0
docker pull postgres:13
```

### Run Containers:

```bash
# Run simple container
docker run -d --name nginx-container -p 8080:80 nginx:latest

# Run with volume
docker run -d --name mysql-container \
  -e MYSQL_ROOT_PASSWORD=password \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0

# Run with environment variables
docker run -d --name postgres-container \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=user \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 \
  postgres:13
```

### Using Docker Compose:

1. Create a `docker-compose.yml` file:

```yaml
version: "3.8"
services:
  web:
    image: nginx:latest
    container_name: my-nginx
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
  db:
    image: postgres:13
    container_name: my-postgres
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_USER: user
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Run with docker-compose:

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View running services
docker-compose ps

# Rebuild and start services
docker-compose up -d --build
```

---

## 5. Basic Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View available images
docker images

# Stop a container
docker stop <container_name>

# Start a container
docker start <container_name>

# Restart a container
docker restart <container_name>

# Remove a container
docker rm <container_name>

# Remove an image
docker rmi <image_name>

# View container logs
docker logs <container_name>

# Enter a container (exec)
docker exec -it <container_name> /bin/bash

# Build an image from Dockerfile
docker build -t my-image:latest .

# Push image to registry
docker tag my-image:latest username/my-image:latest
docker push username/my-image:latest

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a

# View Docker information
docker info
```

---

## 6. Troubleshooting

### Common Issues:

**"Docker Desktop is not running"**

- Ensure Docker Desktop is started
- Try restarting Docker Desktop
- For Linux: `sudo systemctl start docker`

**Permission denied on Linux**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in
```

**Port already in use**

```bash
# Check processes using the port
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # macOS/Linux

# Change port in docker run command
docker run -d -p 8081:80 nginx
```

**Out of memory**

- In Docker Desktop: Settings → Resources → Memory
- On Linux: Adjust in `/etc/docker/daemon.json`

**Container exits immediately**

```bash
# Check container logs
docker logs <container_name>

# Run in interactive mode to debug
docker run -it <image_name> /bin/sh
```

### Installation Verification:

```bash
# Check all tool versions
git --version
docker --version
docker-compose --version

# Test Docker installation
docker run hello-world

# Test Docker Compose
docker-compose --version
```

### Useful Tips:

- Always check Docker Desktop status in system tray (Windows/macOS)
- Use `--help` for command documentation: `docker --help`
- Keep Docker Desktop updated for latest features and security patches
- Use `.dockerignore` file to exclude unnecessary files from builds
- Consider using Docker volumes for persistent data storage

### Additional Resources:

- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Community Forums](https://forums.docker.com/)
