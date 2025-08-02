# Notification Service

A microservice for handling asynchronous notifications in the appointment booking system.

## Features

- **Asynchronous Processing**: Uses Redis pub/sub for decoupled communication
- **MongoDB Storage**: Stores notification history and status
- **Real-time Processing**: Processes notifications as they arrive
- **RESTful API**: Provides endpoints for notification management
- **Health Monitoring**: Includes health checks and statistics

## Architecture

```
Booking Service → Redis Pub/Sub → Notification Service → MongoDB
```

## API Endpoints

### Get User Notifications

```
GET /api/notifications/:userId
```

Returns all notifications for a specific user.

### Get Unread Count

```
GET /api/notifications/:userId/unread
```

Returns the count of unread notifications for a user.

### Get Statistics

```
GET /api/stats
```

Returns overall notification statistics (total, sent, pending, failed).

### Health Check

```
GET /api/health
```

Returns service health status.

## Environment Variables

- `PORT`: Service port (default: 3003)
- `MONGODB_URL`: MongoDB connection string (default: mongodb://localhost:27017/notifications)
- `REDIS_URL`: Redis connection string (default: redis://localhost:6379)

## Running the Service

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker

```bash
docker-compose up notification-service
```

## Notification Types

- `APPOINTMENT_CREATED`: When a new appointment is created
- `APPOINTMENT_UPDATED`: When an appointment status is updated

## Integration

The service integrates with the booking service through Redis pub/sub. When appointments are created or updated, the booking service publishes messages to the `notifications` channel, which this service consumes and processes.
