# Smart Route Navigator: Shortest Path Finder

This web application computes and displays the shortest path between two user-selected points using Dijkstra's Algorithm, visualized on an interactive Leaflet.js map.

## Features

- Interactive Leaflet map with predefined nodes and edges
- Implementation of Dijkstra's algorithm for shortest path computation
- Visual representation of the graph with nodes and weighted edges
- User-friendly interface to select start and end points
- Path visualization with distance calculation
- Responsive design for different screen sizes

## Setup Instructions

1. **Clone the repository**
   ```
   clone git project (git clone https://github.com/Daprhoo/smart-route-navigator.git)
   cd smart-route-navigator
   ```

2. **Running the application**
      1: Use a local server (I used Live Server extension by Ritwick Dey can be download on vscode extensions part)
   -  2: Open `index.html` directly in a modern web browser

     Then access the application at http://localhost:8000

## Project Structure

- `index.html` - Main HTML file with the application layout
- `style.css` - CSS styles for the application
- `script.js` - Main JavaScript file for application logic
- `dijkstra.js` - Implementation of Dijkstra's algorithm
- `graph-data.json` - JSON file containing the graph data (nodes, edges, coordinates)

## How to Use

1. Open the application in your web browser
2. Click the "Set Start Point" button, then click on a node on the map
3. Click the "Set End Point" button, then click on a different node
4. Click "Find Shortest Path" to calculate and display the shortest path
5. The path will be shown on the map, and the distance information will be displayed
6. Use the "Reset" button to clear selections and start over

## Implementation Details

### Graph Representation

The graph is represented as a JSON structure with:
- Nodes: Unique identifiers for locations
- Edges: Connections between nodes with weights (distances)
- Coordinates: Geographic coordinates for each node

### Dijkstra's Algorithm

The application implements Dijkstra's algorithm using a priority queue to efficiently find the shortest path between two nodes. The algorithm:
1. Initializes distances to all nodes as infinity except the start node (0)
2. Processes nodes in order of increasing distance
3. For each node, updates the distances to its neighbors if a shorter path is found
4. Reconstructs the path by tracing back from the end node to the start node

## Technologies Used

- HTML, CSS, JavaScript
- Leaflet.js for map visualization
- Custom implementation of Dijkstra's algorithm

## Future Enhancements

- Add support for user-defined nodes and edges
- Implement alternative path algorithms (A*, Bellman-Ford)
- Add real-time traffic data integration
- Include turn-by-turn directions
- Support for waypoints and multiple destinations