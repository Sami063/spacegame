// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 4000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});