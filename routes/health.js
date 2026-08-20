const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Online Labs API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'Online Labs API'
  });
});

module.exports = router;
