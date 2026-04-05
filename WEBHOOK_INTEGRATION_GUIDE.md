# 🐍 Python AI Microservice → RotoGuard Backend Integration

## Webhook Endpoint

```
POST https://your-rotoguard-backend.com/api/machines/{machineId}/ai-result
```

---

## Request Format

### Headers
```
Content-Type: application/json
```

### URL Parameters
| Param | Type | Required | Example |
|-------|------|----------|---------|
| `{machineId}` | Integer | ✅ Yes | `1` |

### Request Body (JSON)
```json
{
  "status": "string",      // AI classification result
  "confidence": 0.87       // Confidence score (0.0 to 1.0)
}
```

---

## Status Values

Use one of these strings for the `status` field:

| Status | Meaning |
|--------|---------|
| `Normal Operating Condition` | Machine operating normally |
| `Slight Bearing Wear` | Minor bearing degradation detected |
| `High Vibration Detected` | Abnormal vibration levels |
| `Critical Mechanical Friction` | Critical failure risk |
| `BEARING_WEAR` | (Alternative: bearing wear detected) |
| `ANOMALY_DETECTED` | Generic anomaly |
| Any custom status | Custom classification results |

---

## Confidence Score

- **Type**: Floating point number
- **Range**: `0.0` to `1.0`
- **Meaning**:
  - `0.0` = 0% confident
  - `0.5` = 50% confident
  - `0.87` = 87% confident
  - `1.0` = 100% confident
- **Validation**: Must be numeric and between 0.0-1.0 (inclusive)

---

## Example Requests

### Example 1: Normal Operating Condition
```bash
curl -X POST \
  https://your-backend.com/api/machines/1/ai-result \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Normal Operating Condition",
    "confidence": 0.95
  }'
```

**Response** (Success):
```json
{
  "success": true,
  "message": "AI result processed and delivered to clients",
  "logId": 42
}
```

---

### Example 2: Bearing Wear Detected
```bash
curl -X POST \
  https://your-backend.com/api/machines/1/ai-result \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Slight Bearing Wear",
    "confidence": 0.72
  }'
```

**Response** (Success):
```json
{
  "success": true,
  "message": "AI result processed and delivered to clients",
  "logId": 43
}
```

---

### Example 3: Critical Issue
```bash
curl -X POST \
  https://your-backend.com/api/machines/1/ai-result \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Critical Mechanical Friction",
    "confidence": 0.98
  }'
```

**Response** (Success):
```json
{
  "success": true,
  "message": "AI result processed and delivered to clients",
  "logId": 44
}
```

---

## Error Responses

### Bad Request (400)
```json
{
  "success": false,
  "error": "Missing required fields: status, confidence"
}
```

**Causes:**
- Missing `status` or `confidence` field
- Empty request body
- Invalid JSON format

---

### Invalid Confidence (400)
```json
{
  "success": false,
  "error": "Invalid confidence: must be between 0.0 and 1.0"
}
```

**Causes:**
- Confidence < 0.0 or > 1.0
- Non-numeric confidence value
- NaN or Infinity values

---

### Machine Not Found (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Causes:**
- Machine ID doesn't exist in database
- Check `/api/machines` endpoint to get valid IDs

---

## Python Implementation Examples

### Example 1: Using `requests` library
```python
import requests
import json

def send_ai_result(machine_id, status, confidence):
    """Send AI inference result to RotoGuard backend"""

    url = f"https://your-backend.com/api/machines/{machine_id}/ai-result"

    payload = {
        "status": status,
        "confidence": confidence
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        response.raise_for_status()

        result = response.json()
        if result.get("success"):
            print(f"✓ Result sent successfully. Log ID: {result.get('logId')}")
            return True
        else:
            print(f"✗ Error: {result.get('error')}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"✗ Request failed: {e}")
        return False

# Usage
send_ai_result(machine_id=1, status="Normal Operating Condition", confidence=0.95)
```

---

### Example 2: Using `httpx` (async)
```python
import httpx
import asyncio

async def send_ai_result_async(machine_id, status, confidence):
    """Async version using httpx"""

    url = f"https://your-backend.com/api/machines/{machine_id}/ai-result"

    payload = {
        "status": status,
        "confidence": confidence
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=5.0)
            result = response.json()

            if result.get("success"):
                print(f"✓ Sent successfully. Log ID: {result.get('logId')}")
                return True
            else:
                print(f"✗ Error: {result.get('error')}")
                return False

        except httpx.RequestError as e:
            print(f"✗ Request failed: {e}")
            return False

# Usage
asyncio.run(send_ai_result_async(1, "BEARING_WEAR", 0.87))
```

---

### Example 3: Validation Helper
```python
def validate_ai_result(status, confidence):
    """Validate AI result before sending"""

    if not isinstance(status, str) or not status.strip():
        return False, "Status must be a non-empty string"

    if not isinstance(confidence, (int, float)):
        return False, "Confidence must be numeric"

    if confidence < 0.0 or confidence > 1.0:
        return False, "Confidence must be between 0.0 and 1.0"

    return True, "Valid"

# Usage
valid, message = validate_ai_result("BEARING_WEAR", 0.87)
if valid:
    send_ai_result(1, "BEARING_WEAR", 0.87)
else:
    print(f"Validation failed: {message}")
```

---

## Integration Checklist

- [ ] Python AI service can reach backend endpoint
- [ ] Ngrok/public URL correctly configured
- [ ] Request format matches JSON schema exactly
- [ ] Confidence score is always between 0.0-1.0
- [ ] Status field is populated with meaningful value
- [ ] Error handling implemented
- [ ] Timeout set (recommended: 5 seconds)
- [ ] Logging implemented for debugging
- [ ] Tested with curl command above
- [ ] Tested with real audio samples

---

## Real-Time Dashboard Flow

When your Python AI sends a result via webhook:

```
1. Python AI → POST /api/machines/{id}/ai-result
                      ↓
2. Backend validates & stores in database
                      ↓
3. Backend broadcasts via SSE to all connected React clients
                      ↓
4. React LiveFeed updates in real-time <100ms
                      ↓
5. React AcousticHistory chart updates with new data point
```

---

## Monitoring

### Backend Logs (Real-time)
```bash
# SSH into backend and tail logs
tail -f /var/log/rotoguard/backend.log | grep "AI result received"
```

### Expected Log Entry
```
[2026-04-04 10:30:45] INFO  [MachineController] AI result received for Machine 1: BEARING_WEAR (confidence: 0.87)
```

### Browser DevTools (Client View)
1. Open `http://localhost:5173` in browser
2. Open DevTools → Network tab
3. Filter by "EventStream"
4. Watch for SSE connections and events:
```
GET /api/machines/1/stream?token=...
Status: 101
Event: machine-alert
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Missing fields | Check JSON payload has `status` and `confidence` |
| 400 Bad Request | Invalid confidence | Ensure `0.0 ≤ confidence ≤ 1.0` |
| 500 Server Error | Machine not found | Check machine ID exists in database |
| Connection timeout | Backend unreachable | Verify ngrok URL is correct |
| No real-time update | SSE not connected | Check browser DevTools → Network tab |
| Wrong machine ID | Routing error | Verify `{machineId}` in URL matches database |

---

## Production Checklist

Before going live:

- [ ] Ngrok endpoint tested and stable
- [ ] HTTPS/TLS certificate valid
- [ ] Timeout handling implemented
- [ ] Retry logic implemented (optional)
- [ ] Logging comprehensive
- [ ] Error alerts configured
- [ ] Rate limiting considered (optional)
- [ ] Monitor dashboard working
- [ ] Team trained on troubleshooting

---

**Last Updated**: 2026-04-04
**Version**: 1.0
**Status**: Production Ready
