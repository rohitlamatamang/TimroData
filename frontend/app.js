// TimroData - Web Privacy Exposure Demonstration System
// Educational tool to demonstrate browser data exposure

// ==========================================
// 1. BASELINE DATA COLLECTION
// ==========================================

// Detect and display browser information
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    
    if (userAgent.indexOf("Firefox") > -1) {
        browser = "Mozilla Firefox";
    } else if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
        browser = "Google Chrome";
    } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
        browser = "Apple Safari";
    } else if (userAgent.indexOf("Edg") > -1) {
        browser = "Microsoft Edge";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browser = "Opera";
    }
    
    return browser;
}

// Detect operating system
function detectOS() {
    const userAgent = navigator.userAgent;
    let os = "Unknown OS";
    
    if (userAgent.indexOf("Win") > -1) {
        os = "Windows";
    } else if (userAgent.indexOf("Mac") > -1) {
        os = "MacOS";
    } else if (userAgent.indexOf("Linux") > -1) {
        os = "Linux";
    } else if (userAgent.indexOf("Android") > -1) {
        os = "Android";
    } else if (userAgent.indexOf("iOS") > -1 || userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) {
        os = "iOS";
    }
    
    return os;
}

// Get timezone information
function getTimezone() {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    const sign = offset <= 0 ? '+' : '-';
    
    const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${timezoneName} (UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')})`;
}

// Get screen resolution
function getScreenSize() {
    return `${window.screen.width} × ${window.screen.height} px`;
}

// Get language
function getLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    const languages = navigator.languages ? navigator.languages.join(', ') : lang;
    return languages;
}

// Fetch IP address and location from external API
async function fetchIPInfo() {
    try {
        // Using ipapi.co free API (no key required)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        document.getElementById('ip-address').textContent = data.ip || 'Unable to detect';
        document.getElementById('rough-location').textContent = 
            data.city && data.country_name ? `${data.city}, ${data.country_name}` : 'Unable to detect';
        document.getElementById('isp').textContent = data.org || 'Unable to detect';
    } catch (error) {
        console.error('Error fetching IP info:', error);
        document.getElementById('ip-address').textContent = 'Error fetching data';
        document.getElementById('rough-location').textContent = 'Error fetching data';
        document.getElementById('isp').textContent = 'Error fetching data';
    }
}

// Initialize baseline data display
function initializeBaselineData() {
    document.getElementById('browser').textContent = detectBrowser();
    document.getElementById('os').textContent = detectOS();
    document.getElementById('language').textContent = getLanguage();
    document.getElementById('timezone').textContent = getTimezone();
    document.getElementById('screen-size').textContent = getScreenSize();
    
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
    badge.className = 'badge';
    
    switch (state) {
        case 'granted':
            badge.classList.add('badge-success');
            badge.textContent = 'Granted';
            break;
        case 'denied':
            badge.classList.add('badge-danger');
            badge.textContent = 'Denied';
            break;
        case 'prompt':
            badge.classList.add('badge-warning');
            badge.textContent = 'Prompt';
            break;
        default:
            badge.classList.add('badge-info');
            badge.textContent = 'Unknown';
    }
}

// ==========================================
// 3. LOCATION PERMISSION DEMO
// ==========================================

// Request and display location information
function requestLocation() {
    const errorDiv = document.getElementById('location-error');
    const infoDiv = document.getElementById('location-info');
    
    errorDiv.style.display = 'none';
    
    if (!navigator.geolocation) {
        errorDiv.textContent = '❌ Geolocation is not supported by your browser';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Request location
    navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
            displayLocationData(position);
        },
        // Error callback
        (error) => {
            handleLocationError(error);
        },
        // Options
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Display location data
function displayLocationData(position) {
    const { latitude, longitude, accuracy, altitude } = position.coords;
    
    document.getElementById('latitude').textContent = latitude.toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
    document.getElementById('accuracy').textContent = `±${accuracy.toFixed(2)} meters`;
    document.getElementById('altitude').textContent = altitude ? `${altitude.toFixed(2)} meters` : 'Not available';
    
    document.getElementById('coordinates-display').textContent = 
        `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    
    document.getElementById('location-info').style.display = 'block';
    
    // Update permission status
    checkPermissions();
}

// Handle location errors
function handleLocationError(error) {
    const errorDiv = document.getElementById('location-error');
    let errorMessage = '';
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = '❌ Location permission denied. You blocked the request.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = '❌ Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage = '❌ The request to get your location timed out.';
            break;
        default:
            errorMessage = '❌ An unknown error occurred while requesting location.';
            break;
    }
    
    errorDiv.textContent = errorMessage;
    errorDiv.style.display = 'block';
    
    // Update permission status
    checkPermissions();
}

// ==========================================
// 4. EVENT LISTENERS AND INITIALIZATION
// ==========================================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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