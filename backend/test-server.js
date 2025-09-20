// Simple test to verify backend functionality
const express = require('express');
const app = express();

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString() 
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`🧪 Test server running on port ${port}`);
  console.log(`🌐 Test endpoint: http://localhost:${port}/test`);
});