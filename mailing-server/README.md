# Mailing Server

Express server with Redis integration and BullMQ job queues, containerized with Docker.

## Features

- Express.js REST API
- Redis caching and data storage
- BullMQ job queue system
- Background workers for processing jobs
- Docker and Docker Compose setup
- Health check endpoints
- Queue management endpoints
- Graceful shutdown handling

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)

## Quick Start

### Using Docker Compose (Recommended)

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. Check the health:
   ```bash
   curl http://localhost:3000/health
   ```

The Docker Compose setup includes:
- **Redis** - Cache and queue storage
- **Server** - Express API server
- **Worker** - BullMQ worker for processing jobs

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure Redis is running (via Docker or locally):
   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Redis configuration:
   ```
   REDIS_URL=redis://localhost:6379
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

5. Start the server (in one terminal):
   ```bash
   npm run dev
   ```

6. Start the worker (in another terminal):
   ```bash
   npm run dev:worker
   ```

## API Endpoints

### Health Check
- `GET /health` - Check server, Redis, and queue status

### Data Operations
- `GET /api/data/:key` - Get data from Redis cache
- `POST /api/data` - Store data in Redis
  ```json
  {
    "key": "my-key",
    "value": { "data": "example" },
    "ttl": 3600
  }
  ```
- `DELETE /api/data/:key` - Delete data from Redis

### Queue Operations (BullMQ)

#### Add Email Job
- `POST /api/queue/email` - Add an email job to the queue
  ```json
  {
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "This is a test email",
    "template": "plain",
    "delay": 0,
    "priority": 0
  }
  ```

#### Get Job Status
- `GET /api/queue/email/:jobId` - Get status of a specific job

#### Queue Statistics
- `GET /api/queue/email/stats` - Get queue statistics (waiting, active, completed, failed, delayed)

#### Retry Failed Job
- `POST /api/queue/email/:jobId/retry` - Retry a failed job

#### Remove Job
- `DELETE /api/queue/email/:jobId` - Remove a job from the queue

#### Clean Queue
- `POST /api/queue/email/clean` - Clean completed/failed jobs
  ```json
  {
    "grace": 5000,
    "limit": 1000,
    "status": "completed"
  }
  ```

## Docker Commands

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f server
docker-compose logs -f worker
docker-compose logs -f redis

# View all logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild after changes
docker-compose up -d --build
```

## Project Structure

```
mailing-server/
├── server.js              # Express server with Redis and BullMQ
├── worker.js              # BullMQ worker entry point
├── package.json           # Dependencies
├── Dockerfile             # Docker image configuration
├── docker-compose.yaml    # Docker Compose configuration
├── queues/
│   └── emailQueue.js      # Email queue configuration
├── workers/
│   └── emailWorker.js     # Email worker processor
├── env.example            # Environment variables template
└── README.md              # This file
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)
- `REDIS_URL` - Redis connection URL (default: redis://redis:6379)
- `REDIS_HOST` - Redis host (default: redis)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)
- `QUEUE_CONCURRENCY` - Number of jobs processed simultaneously (default: 5)

## BullMQ Features

- **Job Queues**: Reliable job processing with Redis
- **Retry Logic**: Automatic retry with exponential backoff
- **Job Priorities**: Process high-priority jobs first
- **Delayed Jobs**: Schedule jobs to run in the future
- **Job Status Tracking**: Monitor job progress and status
- **Rate Limiting**: Control job processing rate
- **Job Cleanup**: Automatic cleanup of completed/failed jobs

## Example Usage

### Add an email job:
```bash
curl -X POST http://localhost:3000/api/queue/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Welcome!",
    "body": "Welcome to our service!",
    "priority": 1
  }'
```

### Check job status:
```bash
curl http://localhost:3000/api/queue/email/{jobId}
```

### Get queue statistics:
```bash
curl http://localhost:3000/api/queue/email/stats
```

## Notes

- Redis data is persisted in a Docker volume
- The server automatically reconnects to Redis on startup
- Health checks are configured for all services
- Workers process jobs asynchronously in the background
- Jobs are automatically retried on failure (3 attempts with exponential backoff)
- You can scale workers by running multiple worker containers

