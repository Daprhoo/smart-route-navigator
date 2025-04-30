let map;
let graphData;
let markers = {};
let polyline = null;
let startNode = null;
let endNode = null;
let selectionMode = 'none'; 

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadGraphData();
    setupEventListeners();
});

// Initialize the Leaflet map
function initMap() {
    // Create a map centered on Istanbul coordinates
    map = L.map('map').setView([41.075, 29.02], 14);

    // Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

// load the graph data from the JSON file
function loadGraphData() {
    fetch('graph-data.json')
        .then(response => response.json())
        .then(data => {
            graphData = data;
            createGraphOnMap();
        })
        .catch(error => {
            console.error('Error loading graph data:', error);
            updateStatus('Error loading graph data. Please try again.');
        });
}

// Create the graph visualization on map
function createGraphOnMap() {
    // Add nodes to the map
    Object.keys(graphData.coordinates).forEach(nodeId => {
        const coords = graphData.coordinates[nodeId];
        const marker = L.circleMarker(coords, {
            radius: 8,
            fillColor: '#3388ff',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'node-marker'
        }).addTo(map);
        
        marker.bindTooltip(nodeId, { permanent: false });
        
        markers[nodeId] = marker;
        
        marker.on('click', () => handleNodeClick(nodeId));
    });
    
    Object.keys(graphData.edges).forEach(nodeId => {
        const neighbors = graphData.edges[nodeId];
        neighbors.forEach(neighbor => {
            const sourceCoords = graphData.coordinates[nodeId];
            const targetCoords = graphData.coordinates[neighbor.node];
            
            const line = L.polyline([sourceCoords, targetCoords], {
                color: '#3388ff',
                weight: 3,
                opacity: 0.5
            }).addTo(map);
            
            // Add weight as a tooltip
            const midpoint = [
                (sourceCoords[0] + targetCoords[0]) / 2,
                (sourceCoords[1] + targetCoords[1]) / 2
            ];
            L.circleMarker(midpoint, {
                radius: 0,
                opacity: 0
            }).bindTooltip(neighbor.weight.toString(), {
                permanent: true,
                direction: 'center',
                className: 'weight-tooltip'
            }).addTo(map);
        });
    });
    
    updateStatus('Graph loaded. Select a start point.');
}

// Set up event listeners for the buttons
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => {
        selectionMode = 'start';
        resetButtonStates();
        document.getElementById('startBtn').classList.add('active');
        updateStatus('Click on a node to set as the start point.');
    });
    
    document.getElementById('endBtn').addEventListener('click', () => {
        selectionMode = 'end';
        resetButtonStates();
        document.getElementById('endBtn').classList.add('active');
        updateStatus('Click on a node to set as the end point.');
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

// Handle node click based on the current selection mode
function handleNodeClick(nodeId) {
    if (selectionMode === 'start') {
        setStartNode(nodeId);
    } else if (selectionMode === 'end') {
        setEndNode(nodeId);
    }
}

// Set the start node
function setStartNode(nodeId) {
    // Reset previous start node if exists
    if (startNode) {
        markers[startNode].setStyle({
            fillColor: '#3388ff',
            className: 'node-marker'
        });
    }
    
    // Set new start node
    startNode = nodeId;
    markers[startNode].setStyle({
        fillColor: '#4CAF50',
        className: 'start-marker'
    });
    
    updateStatus(`Start point set to node ${nodeId}. Now select an end point.`);
    selectionMode = 'end';
    resetButtonStates();
    document.getElementById('endBtn').classList.add('active');
}

// Set the end node
function setEndNode(nodeId) {
    // Don't allow same node as start and end
    if (nodeId === startNode) {
        updateStatus('Start and end points cannot be the same. Choose a different node.');
        return;
    }
    
    // Reset previous end node if exists
    if (endNode) {
        markers[endNode].setStyle({
            fillColor: '#3388ff',
            className: 'node-marker'
        });
    }
    
    // Set new end node
    endNode = nodeId;
    markers[endNode].setStyle({
        fillColor: '#f44336',
        className: 'end-marker'
    });
    
    updateStatus(`End point set to node ${nodeId}. Click "Find Shortest Path" to calculate.`);
    selectionMode = 'none';
    resetButtonStates();
}

// Find the shortest path using Dijkstra's algorithm
function findShortestPath() {
    if (!startNode || !endNode) {
        updateStatus('Please select both start and end points first.');
        return;
    }
    
    // Clear previous path if exists
    if (polyline) {
        map.removeLayer(polyline);
    }
    
    // Run Dijkstra's algorithm
    const result = dijkstra(graphData, startNode, endNode);
    
    if (result.distance === Infinity) {
        updateStatus('No path found between the selected nodes.');
        return;
    }
    
    // Create path coordinates for the polyline
    const pathCoordinates = result.path.map(nodeId => graphData.coordinates[nodeId]);
    
    // Draw the path on the map
    polyline = L.polyline(pathCoordinates, {
        color: '#ff4500',
        weight: 5,
        opacity: 0.7
    }).addTo(map);
    
    // Zoom to fit the path
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    
    // Update the info panel
    const pathStr = result.path.join(' → ');
    document.getElementById('distanceInfo').innerHTML = `<strong>Distance:</strong> ${result.distance} units`;
    document.getElementById('pathInfo').innerHTML = `<strong>Path:</strong> ${pathStr}`;
    
    updateStatus('Shortest path found!');
}

// Reset the application
function resetApplication() {
    // Clear selected nodes
    if (startNode) {
        markers[startNode].setStyle({
            fillColor: '#3388ff',
            className: 'node-marker'
        });
        startNode = null;
    }
    
    if (endNode) {
        markers[endNode].setStyle({
            fillColor: '#3388ff',
            className: 'node-marker'
        });
        endNode = null;
    }
    
    // Clear path
    if (polyline) {
        map.removeLayer(polyline);
        polyline = null;
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