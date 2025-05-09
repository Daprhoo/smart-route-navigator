// Global variables
let map;
let markers = [];
let polyline = null;
let startMarker = null;
let endMarker = null;
let routingControl = null;
let selectionMode = 'none'; // 'start', 'end', or 'none'

// Initialize the application when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupEventListeners();
});

// Initialize the Leaflet map
function initMap() {
    // Create a map centered on Istanbul coordinates (approximate)
    map = L.map('map').setView([41.075, 29.02], 14);

    // Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Add click event to the map
    map.on('click', handleMapClick);
}

// Set up event listeners for the buttons
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => {
        selectionMode = 'start';
        resetButtonStates();
        document.getElementById('startBtn').classList.add('active');
        updateStatus('Click on the map to set your start point.');
    });
    
    document.getElementById('endBtn').addEventListener('click', () => {
        selectionMode = 'end';
        resetButtonStates();
        document.getElementById('endBtn').classList.add('active');
        updateStatus('Click on the map to set your end point.');
    });
    
    document.getElementById('findPathBtn').addEventListener('click', findShortestPath);
    document.getElementById('resetBtn').addEventListener('click', resetApplication);
}

// Reset button states (remove active class)
function resetButtonStates() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Handle map click based on the current selection mode
function handleMapClick(e) {
    if (selectionMode === 'start') {
        setStartPoint(e.latlng);
    } else if (selectionMode === 'end') {
        setEndPoint(e.latlng);
    }
}

// Set the start point
function setStartPoint(latlng) {
    // Remove previous start marker if exists
    if (startMarker) {
        map.removeLayer(startMarker);
    }
    
    // Create new start marker
    startMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'start-marker',
            html: '<div style="background-color: #4CAF50; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        })
    }).addTo(map);
    
    // Find nearest street using Nominatim reverse geocoding
    findNearestStreet(latlng, 'start');
    
    updateStatus('Start point set. Now select an end point.');
    selectionMode = 'end';
    resetButtonStates();
    document.getElementById('endBtn').classList.add('active');
}

// Set the end point
function setEndPoint(latlng) {
    // Remove previous end marker if exists
    if (endMarker) {
        map.removeLayer(endMarker);
    }
    
    // Create new end marker
    endMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'end-marker',
            html: '<div style="background-color: #f44336; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        })
    }).addTo(map);
    
    // Find nearest street using Nominatim reverse geocoding
    findNearestStreet(latlng, 'end');
    
    updateStatus('End point set. Click "Find Shortest Path" to calculate the route.');
    selectionMode = 'none';
    resetButtonStates();
}

function findNearestStreet(latlng, pointType) {
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&addressdetails=1`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Extract street name from response
            let locationName = data.address.road || data.address.pedestrian || 'Unknown location';
            
            // Update marker with location information
            if (pointType === 'start') {
                startMarker.bindTooltip(`Start: ${locationName}`);
            }
        });
}
// Find the shortest path using OSRM routing service
function findShortestPath() {
    // Use OSRM for real street routing
    const osrmUrl = 'https://router.project-osrm.org/route/v1/driving/';
    const startCoord = `${startMarker.getLatLng().lng},${startMarker.getLatLng().lat}`;
    const endCoord = `${endMarker.getLatLng().lng},${endMarker.getLatLng().lat}`;
    const url = `${osrmUrl}${startCoord};${endCoord}?overview=full&geometries=geojson`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Get the route coordinates that follow actual streets
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            // Display route, distance and time
            polyline = L.polyline(coordinates, {
                color: 'blue',
                weight: 4,
                opacity: 0.7
            }).addTo(map);
            
            const distanceKm = (route.distance / 1000).toFixed(2);
            const durationMin = Math.round(route.duration / 60);
            
            document.getElementById('distanceInfo').innerHTML = `
                <strong>Distance:</strong> ${distanceKm} km<br>
                <strong>Estimated time:</strong> ${durationMin} minutes
            `;
        });
}

// Reset the application
function resetApplication() {
    // Remove markers
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    
    // Remove polyline
    if (polyline) {
        map.removeLayer(polyline);
        polyline = null;
    }
    
    // Remove routing control if exists
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    
    // Reset info panel
    document.getElementById('distanceInfo').innerHTML = '';
    document.getElementById('pathInfo').innerHTML = '';
    
    // Reset selection mode
    selectionMode = 'none';
    resetButtonStates();
    
    updateStatus('Application reset. Select a start point to begin.');
}

// Update the status message
function updateStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}