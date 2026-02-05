# API Contract Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T12:00:00Z"
}
```

---

### 2. Baseline Data
**POST** `/api/baseline`

**Request Body:**
```json
{
  "user_agent": "Mozilla/5.0...",
  "language": "en-US",
  "screen_width": 1920,
  "screen_height": 1080,
  "timezone": "America/New_York"
}
```

**Response:**
```json
{
  "ip": "192.168.1.1",
  "browser": "Chrome 120",
  "os": "Windows 10",
  "location": {
    "city": "New York",
    "country": "United States",
    "isp": "ISP Name"
  }
}
```

---

### 3. Location Data (Week 4+)
**POST** `/api/location`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Location data recorded"
}
```

---

### 4. Statistics (Week 6+)
**GET** `/api/stats`

**Response:**
```json
{
  "total_visits": 150,
  "top_browsers": ["Chrome", "Firefox", "Safari"],
  "top_countries": ["US", "UK", "CA"]
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error description",
  "status": 400
}
```

## Status Codes
- `200` - Success
- `400` - Bad Request
- `500` - Internal Server Error
