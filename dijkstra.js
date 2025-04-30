// Dijkstra's Algorithm Implementation
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

function dijkstra(graph, startNode, endNode) {
    // Initialize distances and previous nodes
    const distances = {};
    const previousNodes = {};
    const queue = new PriorityQueue();

    for (const node of graph.nodes) {
        distances[node] = node === startNode ? 0 : Infinity;
        previousNodes[node] = null;
    }

    // Enqueue start node with priority 0
    queue.enqueue(startNode, 0);

    while (!queue.isEmpty()) {
        const currentNode = queue.dequeue();

        // If we reached the end node, we can stop
        if (currentNode === endNode) {
            break;
        }

        // Skip if there are no edges from this node
        if (!graph.edges[currentNode]) {
            continue;
        }

        // For each neighbor of the current node
        for (const neighbor of graph.edges[currentNode]) {
            const potentialDistance = distances[currentNode] + neighbor.weight;

            // If we found a shorter path to the neighbor
            if (potentialDistance < distances[neighbor.node]) {
                distances[neighbor.node] = potentialDistance;
                previousNodes[neighbor.node] = currentNode;
                queue.enqueue(neighbor.node, potentialDistance);
            }
        }
    }

    // Reconstruct the path
    const path = [];
    let current = endNode;

    // If the end node is unreachable
    if (previousNodes[endNode] === null) {
        return { path: [], distance: Infinity };
    }

    while (current !== null) {
        path.unshift(current);
        current = previousNodes[current];
    }

    return {
        path: path,
        distance: distances[endNode]
    };
}