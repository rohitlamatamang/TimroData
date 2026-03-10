// TimroData - Web Privacy Exposure Demonstration System
// Educational tool to demonstrate browser data exposure

// ==========================================
// 1. BASELINE DATA COLLECTION
// ==========================================

// Detect browser name + full version.
//
// WHY UA STRING IS NOT ENOUGH:
//   Chrome, Edge, Opera, Brave all implement "UA Reduction" — they freeze the UA string
//   to "Chrome/X.0.0.0", so you only ever see the major version + three zeros.
//   The fix is the User-Agent Client Hints API: navigator.userAgentData.getHighEntropyValues()
//   This returns the real full build version (e.g. 145.0.7632.160).
//
// BRAVE SPECIAL CASE:
//   Brave does NOT add itself to the brands list in Client Hints.
//   Its own version number (1.x.x) is not exposed to JS at all.
//   We detect it via navigator.brave.isBrave(), then show the underlying Chromium version.
//
// FIREFOX / SAFARI / SAMSUNG:
//   These do NOT reduce their UA strings, so we read from the UA directly.
async function detectBrowser() {
    const ua = navigator.userAgent;

    // ── Non-Chromium browsers first (UA string is accurate for these) ──

    // Firefox never reduces its UA string
    if (ua.includes('Firefox/')) {
        const m = ua.match(/Firefox\/([\d.]+)/);
        return `Mozilla Firefox ${m ? m[1] : ''}`.trim();
    }
    // Samsung Internet
    if (ua.includes('SamsungBrowser/')) {
        const m = ua.match(/SamsungBrowser\/([\d.]+)/);
        return `Samsung Internet ${m ? m[1] : ''}`.trim();
    }
    // Safari (no Chrome token = real Safari, not a Chromium disguise)
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
        const m = ua.match(/Version\/([\d.]+)/);
        return `Apple Safari ${m ? m[1] : ''}`.trim();
    }

    // ── Chromium-based browsers — prefer Client Hints for real full version ──
    if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === 'function') {
        try {
            // 'fullVersionList' is the only valid high-entropy hint we need here.
            // (Passing invalid hint names like 'brands' causes silent failures in some browsers.)
            const hints = await navigator.userAgentData.getHighEntropyValues(['fullVersionList']);
            const list  = hints.fullVersionList || [];

            // Filter out the randomised "Not?A_Brand" noise entries Chromium injects
            const real  = list.filter(b => !b.brand.includes('Not') && !b.brand.includes('Brand'));

            // ── Brave: detected via its private API, version from Chromium entry ──
            // Brave's own version (1.x.x) is intentionally not in Client Hints or UA string.
            // We show the underlying Chromium engine version instead.
            const isBrave = navigator.brave && await navigator.brave.isBrave().catch(() => false);
            if (isBrave) {
                const cr = real.find(b => b.brand === 'Chromium' || b.brand === 'Google Chrome');
                const ver = cr ? cr.version : ua.match(/Chrome\/([\d]+)/)?.[1] || '';
                return `Brave (Chromium ${ver})`;
            }

            // ── Prioritised brand lookup ──
            // Edge, Opera and Chrome all contain "Google Chrome" + "Chromium" in their list.
            // Edge also adds "Microsoft Edge"; Opera adds "Opera".
            const priority = [
                { brand: 'Microsoft Edge', label: 'Microsoft Edge' },
                { brand: 'Opera',          label: 'Opera'          },
                { brand: 'Google Chrome',  label: 'Google Chrome'  },
                { brand: 'Chromium',       label: 'Chromium'       },
            ];
            for (const { brand, label } of priority) {
                const entry = real.find(b => b.brand === brand);
                if (entry) return `${label} ${entry.version}`;
            }
        } catch (_) {
            // Client Hints blocked or unavailable — fall through to UA string
        }
    }

    // ── UA string fallback for Chromium browsers without Client Hints ──
    // (e.g. older Chromium builds, or if the hints call was blocked)
    // These will show X.0.0.0 due to UA Reduction — nothing we can do without Client Hints.

    const isBrave = navigator.brave && await navigator.brave.isBrave().catch(() => false);
    if (isBrave) {
        const m = ua.match(/Chrome\/([\d]+)/);
        return `Brave (Chromium ${m ? m[1] : 'unknown'})`;
    }
    if (ua.includes('OPR/')) {
        const m = ua.match(/OPR\/([\d.]+)/);
        return `Opera ${m ? m[1] : ''}`.trim();
    }
    if (ua.includes('Opera/')) {
        const m = ua.match(/Opera\/([\d.]+)/);
        return `Opera ${m ? m[1] : ''}`.trim();
    }
    if (ua.includes('Edg/') || ua.includes('EdgA/')) {
        const m = ua.match(/Edg[A]?\/([\d.]+)/);
        return `Microsoft Edge ${m ? m[1] : ''}`.trim();
    }
    if (ua.includes('Chrome/')) {
        const m = ua.match(/Chrome\/([\d.]+)/);
        return `Google Chrome ${m ? m[1] : ''}`.trim();
    }

    return 'Unknown Browser';
}

// Detect operating system
function detectOS() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform || '';
    let os = "Unknown OS";

    // Android must be checked BEFORE Linux — Android UA contains "Linux"
    if (/Android/.test(userAgent)) {
        const match = userAgent.match(/Android ([\d.]+)/);
        os = match ? `Android ${match[1]}` : 'Android';

    // iPhone / iPad must be checked BEFORE Mac — iPads can report as Mac
    } else if (/iPhone/.test(userAgent) || /iPad/.test(userAgent) || /iPod/.test(userAgent)) {
        const match = userAgent.match(/OS ([\d_]+) like Mac/);
        const ver = match ? match[1].replace(/_/g, '.') : '';
        os = `iOS ${ver}`;

    // Windows
    } else if (/Windows NT/.test(userAgent)) {
        const match = userAgent.match(/Windows NT ([\d.]+)/);
        const ntMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista' };
        const ver = match ? (ntMap[match[1]] || match[1]) : '';
        os = `Windows ${ver}`;

    // macOS
    } else if (/Macintosh|MacIntel|MacPPC/.test(userAgent)) {
        const match = userAgent.match(/Mac OS X ([\d_]+)/);
        const ver = match ? match[1].replace(/_/g, '.') : '';
        os = `macOS ${ver}`;

    // Linux (only after Android is ruled out)
    } else if (/Linux/.test(userAgent) || /Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}

// Get timezone information
function getTimezone() {
    try {
        const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Get current UTC offset for the timezone (handles DST correctly)
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en', {
            timeZone: timezoneName,
            timeZoneName: 'shortOffset'
        });
        const parts = formatter.formatToParts(now);
        const offsetPart = parts.find(p => p.type === 'timeZoneName');
        const utcOffset = offsetPart ? offsetPart.value : 'UTC';

        return `${timezoneName} (${utcOffset})`;
    } catch (e) {
        // Fallback if Intl is not fully supported
        const offset = new Date().getTimezoneOffset();
        const hours = Math.abs(Math.floor(offset / 60)).toString().padStart(2, '0');
        const minutes = Math.abs(offset % 60).toString().padStart(2, '0');
        const sign = offset <= 0 ? '+' : '-';
        return `UTC${sign}${hours}:${minutes}`;
    }
}

// Get screen resolution
// window.screen.width/height = CSS logical pixels (already divided by OS scaling)
// Native physical pixels = logical * devicePixelRatio
function getScreenSize() {
    const dpr = window.devicePixelRatio || 1;
    // Native resolution (what the display actually runs at)
    const nativeW = Math.round(window.screen.width * dpr);
    const nativeH = Math.round(window.screen.height * dpr);
    // Scaling percentage Windows is set to
    const scalePercent = Math.round(dpr * 100);

    if (dpr !== 1) {
        return `${nativeW} × ${nativeH} px (${scalePercent}% scaling)`;
    }
    return `${nativeW} × ${nativeH} px`;
}

// Get language
function getLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    const languages = navigator.languages ? navigator.languages.join(', ') : lang;
    return languages;
}

// Fetch IP address and location from external API
// Primary: ip-api.com (free, no key needed, very accurate ISP/location)
// Fallback: ipapi.co (free tier, no key needed)
async function fetchIPInfo() {
    // Set loading state
    document.getElementById('ip-address').textContent = 'Detecting...';
    document.getElementById('rough-location').textContent = 'Detecting...';
    document.getElementById('isp').textContent = 'Detecting...';

    try {
        // ip-api.com returns isp, org, city, country, region — all in one call
        const response = await fetch('http://ip-api.com/json/?fields=status,message,country,regionName,city,isp,org,query');
        const data = await response.json();

        if (data.status === 'success') {
            const ipEl  = document.getElementById('ip-address');
            const locEl = document.getElementById('rough-location');
            const ispEl = document.getElementById('isp');

            ipEl.classList.remove('skeleton');
            locEl.classList.remove('skeleton');
            ispEl.classList.remove('skeleton');

            ipEl.textContent = data.query || 'Unable to detect';
            const city = data.city || '';
            const region = data.regionName || '';
            const country = data.country || '';
            const location = [city, region, country].filter(Boolean).join(', ');
            locEl.textContent = location || 'Unable to detect';
            // Show ISP and organisation if different
            const ispText = (data.isp && data.org && data.isp !== data.org)
                ? `${data.isp} (${data.org})`
                : (data.isp || data.org || 'Unable to detect');
            ispEl.textContent = ispText;
            ['ip-address','rough-location','isp'].forEach(flashLoaded);
            return;
        }
        throw new Error(data.message || 'ip-api returned failure status');
    } catch (primaryError) {
        console.warn('Primary IP API failed, trying fallback:', primaryError.message);
        try {
            // Fallback: ipapi.co
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.error) throw new Error(data.reason || 'ipapi.co error');

            const ipEl2  = document.getElementById('ip-address');
            const locEl2 = document.getElementById('rough-location');
            const ispEl2 = document.getElementById('isp');
            ipEl2.classList.remove('skeleton');
            locEl2.classList.remove('skeleton');
            ispEl2.classList.remove('skeleton');
            ipEl2.textContent  = data.ip || 'Unable to detect';
            const location = [data.city, data.region, data.country_name].filter(Boolean).join(', ');
            locEl2.textContent = location || 'Unable to detect';
            ispEl2.textContent = data.org || 'Unable to detect';
            ['ip-address','rough-location','isp'].forEach(flashLoaded);
        } catch (fallbackError) {
            console.error('Both IP APIs failed:', fallbackError);
            document.getElementById('ip-address').textContent = 'Unable to detect';
            document.getElementById('rough-location').textContent = 'Unable to detect';
            document.getElementById('isp').textContent = 'Unable to detect';
        }
    }
}

// Flash a 'loaded' border on a card when data is ready
function flashLoaded(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const card = el.closest('.data-card');
    if (card) {
        card.classList.add('loaded');
        setTimeout(() => card.classList.remove('loaded'), 2000);
    }
}

// Initialize baseline data display
async function initializeBaselineData() {
    // detectBrowser is async (Client Hints + Brave check require Promises)
    document.getElementById('browser').textContent = 'Detecting...';
    document.getElementById('browser').textContent = await detectBrowser();
    document.getElementById('os').textContent = detectOS();
    document.getElementById('language').textContent = getLanguage();
    document.getElementById('timezone').textContent = getTimezone();
    document.getElementById('screen-size').textContent = getScreenSize();

    // Flash loaded state on synchronous cards
    ['browser','os','language','timezone','screen-size'].forEach(flashLoaded);

    // Fetch IP and location info
    fetchIPInfo();
}

// ==========================================
// 2. PERMISSION STATUS DETECTION
// ==========================================

// Check permission status for various APIs
async function checkPermissions() {
    if (!navigator.permissions) {
        console.log('Permissions API not supported');
        return;
    }
    
    // Location Permission
    try {
        const locationStatus = await navigator.permissions.query({ name: 'geolocation' });
        updatePermissionBadge('location-status', locationStatus.state);
        
        locationStatus.onchange = () => {
            updatePermissionBadge('location-status', locationStatus.state);
        };
    } catch (error) {
        console.error('Error checking location permission:', error);
    }
    
    // Camera Permission
    try {
        const cameraStatus = await navigator.permissions.query({ name: 'camera' });
        updatePermissionBadge('camera-status', cameraStatus.state);
        
        cameraStatus.onchange = () => {
            updatePermissionBadge('camera-status', cameraStatus.state);
        };
    } catch (error) {
        console.error('Error checking camera permission:', error);
    }
    
    // Microphone Permission
    try {
        const microphoneStatus = await navigator.permissions.query({ name: 'microphone' });
        updatePermissionBadge('microphone-status', microphoneStatus.state);
        
        microphoneStatus.onchange = () => {
            updatePermissionBadge('microphone-status', microphoneStatus.state);
        };
    } catch (error) {
        console.error('Error checking microphone permission:', error);
    }
    
    // Notification Permission
    try {
        const notificationStatus = await navigator.permissions.query({ name: 'notifications' });
        updatePermissionBadge('notification-status', notificationStatus.state);
        
        notificationStatus.onchange = () => {
            updatePermissionBadge('notification-status', notificationStatus.state);
        };
    } catch (error) {
        console.error('Error checking notification permission:', error);
    }
}

// Update permission badge appearance based on state
function updatePermissionBadge(elementId, state) {
    const badge = document.getElementById(elementId);
    // Reset to base class
    badge.className = 'perm-badge';

    switch (state) {
        case 'granted':
            badge.classList.add('granted');
            badge.textContent = '✓ Granted';
            break;
        case 'denied':
            badge.classList.add('denied');
            badge.textContent = '✕ Denied';
            break;
        case 'prompt':
            badge.classList.add('prompt');
            badge.textContent = '? Not Set';
            break;
        default:
            badge.textContent = 'Unknown';
    }
}

// ==========================================
// 3. LOCATION PERMISSION DEMO
// ==========================================

// Request and display location information
// Uses a two-attempt strategy:
//   Attempt 1: enableHighAccuracy: false  → fast, works on PC via Wi-Fi/IP positioning
//   Attempt 2: enableHighAccuracy: true   → slower, better for mobile GPS, longer timeout
function requestLocation() {
    const errorDiv = document.getElementById('location-error');
    const btn = document.getElementById('request-location');

    errorDiv.style.display = 'none';
    document.getElementById('location-info').style.display = 'none';

    if (!navigator.geolocation) {
        const errorText = document.getElementById('location-error-text');
        if (errorText) errorText.textContent = 'Geolocation is not supported by your browser.';
        errorDiv.style.display = 'flex';
        return;
    }

    // Show loading state on button
    btn.textContent = 'Detecting location...';
    btn.disabled = true;

    // --- Attempt 1: Low accuracy, fast (30s timeout) ---
    // enableHighAccuracy: false = uses Wi-Fi/IP on PC, much faster
    navigator.geolocation.getCurrentPosition(
        (position) => {
            displayLocationData(position);
        },
        (error) => {
            if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
                // Attempt 1 timed out — retry with high accuracy and longer wait
                btn.textContent = 'Still detecting... (retrying)';

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        displayLocationData(position);
                    },
                    (error2) => {
                        btn.textContent = 'Retry Location';
                        btn.disabled = false;
                        handleLocationError(error2);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 30000,   // 30 seconds for GPS on mobile
                        maximumAge: 60000 // accept a cached position up to 1 min old
                    }
                );
            } else {
                // Permission denied or other non-timeout error — no point retrying
                btn.textContent = 'Request Location Permission';
                btn.disabled = false;
                handleLocationError(error);
            }
        },
        {
            enableHighAccuracy: false, // Fast path: Wi-Fi/IP on PC, network on mobile
            timeout: 10000,            // 10 seconds is plenty for low-accuracy
            maximumAge: 60000          // accept a cached position up to 1 min old
        }
    );
}

// Display location data
function displayLocationData(position) {
    const { latitude, longitude, accuracy, altitude } = position.coords;

    // Reset button
    const btn = document.getElementById('request-location');
    btn.textContent = 'Refresh Location';
    btn.disabled = false;

    document.getElementById('latitude').textContent = latitude.toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
    // accuracy can be null on some desktop browsers
    document.getElementById('accuracy').textContent = (accuracy != null)
        ? `±${accuracy.toFixed(2)} meters`
        : 'Not available';
    // altitude is null when device has no altimeter
    document.getElementById('altitude').textContent = (altitude != null)
        ? `${altitude.toFixed(2)} meters`
        : 'Not available';

    document.getElementById('coordinates-display').textContent =
        `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    // Enable the OpenStreetMap link
    const mapLink = document.getElementById('map-link');
    if (mapLink) {
        const zoom = 15;
        mapLink.href = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=${zoom}`;
        mapLink.style.display = 'inline-flex';
        lucide.createIcons();
    }

    document.getElementById('location-info').style.display = 'block';

    // Update permission status
    checkPermissions();
}

// Handle location errors
function handleLocationError(error) {
    const errorBox  = document.getElementById('location-error');
    const errorText = document.getElementById('location-error-text');
    let errorMessage = '';

    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access in your browser settings and try again.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Your device could not determine your position. Make sure Wi-Fi is enabled (even if not connected — it helps with positioning on PC).';
            break;
        case error.TIMEOUT:
            errorMessage = 'Location timed out. On PC, make sure Wi-Fi is turned on (browsers use nearby Wi-Fi networks to triangulate position). Also check: Windows Settings → Privacy → Location is ON.';
            break;
        default:
            errorMessage = `An unknown error occurred (code: ${error.code}). Try refreshing the page.`;
            break;
    }

    if (errorText) errorText.textContent = errorMessage;
    errorBox.style.display = 'flex';

    // Update permission status
    checkPermissions();
}

// ==========================================
// 4. EVENT LISTENERS AND INITIALIZATION
// ==========================================

// Live clock in navbar
function startClock() {
    const el = document.getElementById('nav-clock');
    if (!el) return;
    function tick() {
        const now = new Date();
        el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    tick();
    setInterval(tick, 1000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Start live clock
    startClock();

    // Initialize baseline data
    initializeBaselineData();
    
    // Check permission statuses
    checkPermissions();
    
    // Location request button
    const locationBtn = document.getElementById('request-location');
    locationBtn.addEventListener('click', requestLocation);
    
    // Initialize todo sidebar
    initializeTodo();
    
    console.log('🔒 TimroData initialized - Educational privacy demo');
    console.log('ℹ️ No data is being transmitted or stored');
});

// ==========================================
// 5. NOTEPAD SIDEBAR FUNCTIONALITY
// ==========================================

// Notepad state management
let notes = [];

// Load notes from localStorage
function loadNotes() {
    const stored = localStorage.getItem('timrodata_notes');
    if (stored) {
        notes = JSON.parse(stored);
    }
    renderNotes();
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('timrodata_notes', JSON.stringify(notes));
}

// Render note list
function renderNotes() {
    const noteList = document.getElementById('todoList');
    noteList.innerHTML = '';
    
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${note.type === 'note' ? 'note' : ''} ${note.completed ? 'completed' : ''}`;
        
        // Add checkbox only for tasks
        if (note.type === 'task') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = note.completed;
            checkbox.addEventListener('change', () => toggleNote(index));
            li.appendChild(checkbox);
        }
        
        const text = document.createElement('span');
        text.className = 'todo-text';
        text.textContent = note.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-delete';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => deleteNote(index));
        
        li.appendChild(text);
        li.appendChild(deleteBtn);
        noteList.appendChild(li);
    });
}

// Add new note
function addNote(type) {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        notes.push({
            text: text,
            type: type,
            completed: false,
            timestamp: Date.now()
        });
        input.value = '';
        saveNotes();
        renderNotes();
    }
}

// Toggle task completion
function toggleNote(index) {
    if (notes[index].type === 'task') {
        notes[index].completed = !notes[index].completed;
        saveNotes();
        renderNotes();
    }
}

// Delete note
function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
}

// Toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('todoSidebar');
    const openBtn = document.getElementById('todoOpenBtn');
    
    sidebar.classList.toggle('open');
    
    if (sidebar.classList.contains('open')) {
        openBtn.classList.add('hidden');
    } else {
        openBtn.classList.remove('hidden');
    }
}

// Initialize notepad functionality
function initializeTodo() {
    loadNotes();
    
    // Add note button
    document.getElementById('addNote').addEventListener('click', () => addNote('note'));
    
    // Add task button
    document.getElementById('addTodo').addEventListener('click', () => addNote('task'));
    
    // Enter key to add note
    document.getElementById('todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNote('note');
        }
    });
    
    // Toggle sidebar
    document.getElementById('todoToggle').addEventListener('click', toggleSidebar);
    document.getElementById('todoOpenBtn').addEventListener('click', toggleSidebar);
}

// ==========================================
// 6. ADDITIONAL UTILITY FUNCTIONS
// ==========================================

// Log privacy awareness message
console.log('%c🔒 Privacy Notice', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('%cThis is an educational demonstration tool.', 'color: #374151; font-size: 12px;');
console.log('%cAll data remains in your browser and is not transmitted anywhere.', 'color: #374151; font-size: 12px;');
console.log('%cBe cautious when granting permissions on real websites!', 'color: #ef4444; font-size: 12px; font-weight: bold;');