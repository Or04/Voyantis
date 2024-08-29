// server.js

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());

// Store queues and their messages
const queues = {};

// Helper function to get queue size
const getQueueSize = (queue) => {
    return queues[queue] ? queues[queue].length : 0;
};

// Endpoint to list all queues and their message counts
app.get('/api/queues', (req, res) => {
    const queueList = {};
    for (const [queue, messages] of Object.entries(queues)) {
        queueList[queue] = messages.length;
    }
    res.json(queueList);
});

// Endpoint to add a message to a queue
app.post('/api/:queue_name', (req, res) => {
    const { queue_name } = req.params;
    const message = req.body;

    if (!queues[queue_name]) {
        queues[queue_name] = []; // Initialize queue if not exists
    }

    if (!message) {
        return res.status(400).json({ error: 'Empty message' });
    }

    queues[queue_name].push(message);
    res.status(200).json({ status: 'Message added' });
});

// Endpoint to get a message from a queue with optional timeout
app.get('/api/:queue_name', (req, res) => {
    const { queue_name } = req.params;
    const timeout = parseInt(req.query.timeout, 10) || 10000; // Default timeout 10 seconds

    if (!queues[queue_name]) {
        return res.status(404).json({ error: 'Queue not found' });
    }

    const queue = queues[queue_name];
    if (queue.length > 0) {
        const message = queue.shift(); // Get and remove the first message
        return res.json(message);
    }

    // If queue is empty, wait for the timeout
    setTimeout(() => {
        if (queue.length === 0) {
            res.sendStatus(204); // No content if still empty after timeout
        } else {
            res.json(queue.shift()); // Return next message if available
        }
    }, timeout);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
