# Week 1 - Frontend-Backend Communication & Basic Data Collection

## Week 1 Objective (What "Done" Means)

By the end of Week 1:

- ✅ You can open the frontend page in the browser
- ✅ On page load, the frontend collects:
  - timezone
  - language
  - screen size
  - userAgent
- ✅ It sends that JSON to Flask: `POST /api/baseline`
- ✅ Flask receives it, logs it, and returns JSON (echo + server values)
- ✅ Frontend renders returned fields into the UI

**Week 1 is only:** Frontend ↔ Backend communication + basic data collection.

**NOT included:** Database, GeoIP, permissions, map.

---

## 1. What to Learn First (And How Much)

### A) HTTP Basics (Learn Just This)

You only need:

- **GET** = fetch something (read)
- **POST** = send something (write)
- Request has: method + URL + headers + body
- Response has: status + JSON

**Tip:** Don't read long networking chapters. Learn by doing:
- Open DevTools → Network tab → see the POST request

### B) JSON Basics (Learn Just This)

You must understand:

- JSON is like a JS object / Python dict
- Key/value pairs
- `JSON.stringify()` converts JS object → JSON string
- `res.json()` converts JSON response → JS object

**Tip:** Practice with 2–3 small JSON examples, then move on.

### C) JavaScript Basics Needed (Only)

#### 1) DOM Update
```javascript
document.getElementById("id").textContent = "...";
```

#### 2) Fetch API (Most Important)
```javascript
fetch(url, { method, headers, body })
```

#### 3) async/await + try/catch (Just Enough)
- Use `async function`
- Use `await fetch(...)`
- Wrap network calls in `try/catch`

**Tip:** Don't study full JS. Learn these 3 patterns only.

### D) Flask Basics Needed (Only)

Create app → Create routes → Read JSON body → Return JSON

You must know:

```python
@app.get("/api/health")
@app.post("/api/baseline")
request.get_json()
jsonify(...)
```

**Tip:** You don't need templates, blueprints, or SQL yet.

### E) Debugging (Must Learn)

This is what will make you progress fast:

**Browser DevTools:**
- Console: see JS errors
- Network: see request payload + response body

**Terminal:**
- Flask prints logs/errors
- Read error trace top to bottom

**Tip:** Every time something breaks, check:
1. Console
2. Network
3. Flask terminal

---

## 2. Week 1 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML + CSS + Vanilla JS |
| Backend | Python + Flask |
| Data Format | JSON |
| Tools | VS Code + Browser DevTools |

**Local Servers:**
- Flask on `http://127.0.0.1:5000`
- Frontend on `http://127.0.0.1:5500` (Live Server or python http.server)

---

## 3. Folder + Files to Build in Week 1

Use this structure (only Week 1 parts):

```
timrodata/
├── 1/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
└── backend/
    ├── app.py
    ├── requirements.txt
    └── venv/              (created locally, don't commit)
```

**What Goes Where:**

- `1/app.js` → collects browser data, calls backend, updates UI
- `backend/app.py` → defines API endpoints and returns JSON
- `backend/requirements.txt` → Flask dependency

---

## 4. Step-by-Step Process (Complete)

### Step 0 — Prep Checklist (10 minutes)

Make sure you have:

- [ ] Python 3 installed
- [ ] VS Code
- [ ] A browser (Chrome recommended)

Verify Python:
```bash
python --version
```

---

### Step 1 — Create Folders (5 minutes)

Create:
- `timrodata/1`
- `timrodata/backend`

```bash
mkdir -p timrodata/1
mkdir -p timrodata/backend
```

---

### Step 2 — Backend Setup (Flask)

#### 2.1 Create Python Virtual Environment

In `backend/`:

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

**Checkpoint:** Your terminal should show `(venv)` ✅

#### 2.2 Install Flask

```bash
pip install Flask flask-cors
```

#### 2.3 Save Dependencies

```bash
pip freeze > requirements.txt
```

#### 2.4 Create `backend/app.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }), 200

@app.route('/api/baseline', methods=['POST'])
def baseline():
    # Get JSON from frontend
    data = request.get_json()
    
    # Log it (for debugging)
    print("BASELINE RECEIVED:", data)
    
    # Prepare response
    response = {
        'received': data,
        'server_data': {
            'ip_guess': request.remote_addr,
            'ua_header': request.headers.get('User-Agent'),
            'server_time': datetime.utcnow().isoformat() + 'Z'
        }
    }
    
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

#### 2.5 Run Flask

```bash
python app.py
```

**Checkpoint:** Terminal should show:
```
* Running on http://127.0.0.1:5000
```

---

### Step 3 — Test Backend Directly (10 minutes)

Open in browser:
```
http://127.0.0.1:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T12:00:00Z"
}
```

**Checkpoint:** Backend responds ✅

---

### Step 4 — Serve Frontend Correctly (Avoid Common Mistake)

**Do NOT open index.html using `file://`**

#### Option A: Python Server

In `1/`:
```bash
python -m http.server 5500
```

Open:
```
http://127.0.0.1:5500
```

#### Option B: VS Code Live Server (Recommended)

1. Install "Live Server" extension in VS Code
2. Right click `index.html` → **Open with Live Server**

**Checkpoint:** Frontend runs on `http://` not `file://` ✅

---

### Step 5 — Frontend Code (30 minutes)

#### Update `1/app.js`

Add this function to send data to backend:

```javascript
// Send baseline data to backend
async function sendBaselineData() {
    const data = {
        user_agent: navigator.userAgent,
        language: navigator.language,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    try {
        const response = await fetch('http://127.0.0.1:5000/api/baseline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Backend response:', result);
        
        // Update UI with server data
        displayServerData(result);
        
    } catch (error) {
        console.error('Error sending baseline data:', error);
    }
}

// Display server response in UI
function displayServerData(result) {
    if (result.server_data) {
        document.getElementById('ip-address').textContent = result.server_data.ip_guess;
        document.getElementById('browser').textContent = detectBrowser();
        document.getElementById('os').textContent = detectOS();
        // ... update other fields
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeBaselineData();
    checkPermissions();
    initializeTodo();
    
    // NEW: Send data to backend
    sendBaselineData();
    
    const locationBtn = document.getElementById('request-location');
    locationBtn.addEventListener('click', requestLocation);
});
```

---

### Step 6 — Validate Week 1 End-to-End (20 minutes)

#### Check in DevTools → Network

1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload page
4. Find request to `/api/baseline`

**Confirm:**
- Request Payload contains your fields
- Response contains `ip_guess`, `ua_header`, `server_time`

#### Check Flask Terminal

You should see:
```
BASELINE RECEIVED: { 'user_agent': '...', 'language': '...', ... }
```

**Checkpoint:** Data flowed properly ✅

---

## 5. Common Issues & Solutions

### Issue 1: CORS Error

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:** Make sure Flask has:
```python
from flask_cors import CORS
CORS(app)
```

### Issue 2: Connection Refused

**Error:** `net::ERR_CONNECTION_REFUSED`

**Solution:** 
- Check if Flask is running
- Verify URL is `http://127.0.0.1:5000`

### Issue 3: 404 Not Found

**Error:** `404 Not Found`

**Solution:**
- Check route spelling: `/api/baseline`
- Verify method matches: `POST`

### Issue 4: Empty Request Body

**Error:** `request.get_json()` returns `None`

**Solution:**
- Check `Content-Type: application/json` header
- Verify `JSON.stringify(data)` in fetch

---

## 6. Week 1 Checklist

Before moving to Week 2, verify:

- [ ] Flask backend running on port 5000
- [ ] Frontend served via HTTP (not file://)
- [ ] `/api/health` returns JSON
- [ ] `/api/baseline` receives POST data
- [ ] Browser DevTools shows successful request
- [ ] Flask terminal logs incoming data
- [ ] Frontend updates UI with server response

---

## 7. What's Next?

**Week 2 will add:**
- User agent parsing (browser/OS detection)
- Configuration management
- Better error handling
- Code organization (blueprints)

**For now:** Focus on getting Week 1 working perfectly. Everything else builds on this foundation.

---

## 8. Learning Resources (Optional)

- **HTTP/JSON basics:** MDN Web Docs
- **Fetch API:** [MDN Fetch Guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- **Flask quickstart:** [Flask Documentation](https://flask.palletsprojects.com/en/latest/quickstart/)
- **DevTools:** Chrome DevTools → Network tab tutorial

---

## 9. Debug Workflow Template

When something breaks, follow this:

1. **Check Browser Console** (F12 → Console)
   - Look for red errors
   - Note the error message

2. **Check Network Tab** (F12 → Network)
   - Find the failed request
   - Check Request headers/body
   - Check Response status/body

3. **Check Flask Terminal**
   - Look for Python errors
   - Check if route was hit
   - Verify printed data

4. **Fix → Test → Repeat**

---

**Remember:** Week 1 is just about making frontend and backend talk to each other. Keep it simple!
