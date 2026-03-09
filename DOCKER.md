# Docker Setup Guide

## Overview

This project includes Docker configuration for containerizing the **app-documents** application. The setup uses a multi-stage build to optimize image size and includes a docker-compose configuration for easy deployment.

## Building the Docker Image

### Using Docker CLI

```bash
docker build -t app-documents:latest .
```

### Using Docker Compose

```bash
docker-compose build
```

## Running the Application

### Using Docker CLI

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=./data/profiles.db \
  -e DOCS_REPO_PATH=./data/docs-repo \
  -e BETTER_AUTH_SECRET=your-32-character-secret-key-here \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -v $(pwd)/data:/app/data \
  app-documents:latest
```

### Using Docker Compose

1. Create a `.env` file with your configuration:

```bash
BETTER_AUTH_SECRET=your-32-character-secret-key-here
```

2. Start the service:

```bash
docker-compose up -d
```

3. View logs:

```bash
docker-compose logs -f
```

4. Stop the service:

```bash
docker-compose down
```

## Environment Variables

The following environment variables are required:

- **DATABASE_URL**: Path to SQLite database file (default: `./data/profiles.db`)
- **DOCS_REPO_PATH**: Path to documents repository directory (default: `./data/docs-repo`)
- **BETTER_AUTH_SECRET**: Secret key for authentication (minimum 32 characters, **required**)
- **BETTER_AUTH_URL**: URL of the application (default: `http://localhost:3000`)
- **NODE_ENV**: Environment mode (default: `production`)

## Data Persistence

The application uses volume mounting to persist data:

- `/app/data` - Mounted to `./data` on the host machine
  - `profiles.db` - SQLite database file
  - `docs-repo/` - Document repository directory

Ensure the `./data` directory exists and has proper permissions:

```bash
mkdir -p ./data
chmod 755 ./data
```

## Health Check

The Docker image includes a health check that verifies the application is responding on port 3000. The status can be checked with:

```bash
docker ps
# Look for "healthy" status in the HEALTHCHECK column
```

## Troubleshooting

### Container exits immediately

Check the logs:

```bash
docker-compose logs app
```

Ensure all required environment variables are set, especially `BETTER_AUTH_SECRET`.

### Database file not persisting

Verify the volume is properly mounted:

```bash
docker inspect <container_id> | grep -A 5 Mounts
```

### Permission denied errors

Ensure the `./data` directory is writable:

```bash
chmod 777 ./data
```

## Production Deployment

For production deployment:

1. Set a strong `BETTER_AUTH_SECRET` (32+ characters, use a secure random string)
2. Set `BETTER_AUTH_URL` to your production domain
3. Use a production-grade reverse proxy (Nginx, Caddy)
4. Configure HTTPS/TLS certificates
5. Use environment variable management (Docker secrets or external services)
6. Consider using a persistent database solution outside the container
7. Set up proper logging and monitoring

## Multi-Architecture Builds

To build for multiple architectures:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t app-documents:latest .
```

## Performance Notes

- The multi-stage build reduces the final image size by excluding build dependencies
- The base image uses Alpine Linux for minimal footprint
- Build time depends on npm dependencies (typical: 2-3 minutes)
- First startup may take longer as database migrations are applied
