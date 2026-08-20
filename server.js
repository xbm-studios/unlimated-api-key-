const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { authenticateRequest } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const modelsRoutes = require('./routes/models');
const chatRoutes = require('./routes/chat');
const { loadModelsConfig } = require('./config/models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api/health', healthRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/chat/completions', authenticateRequest, chatRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      type: 'not_found',
      param: null,
      code: 'not_found'
    }
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    const config = await loadModelsConfig();
    console.log(`\n🚀 Online Labs API Server Starting...`);
    console.log(`📦 Loaded ${config.models.length} models from configuration`);
    console.log(`🔑 API authentication using freeapikey.txt`);
    
    app.listen(PORT, () => {
      console.log(`\n✅ Online Labs API running on http://localhost:${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`\n🔗 Available endpoints:`);
      console.log(`   GET  /api/health              - Server health check`);
      console.log(`   GET  /api/models              - List available models`);
      console.log(`   POST /api/chat/completions    - Chat completions (requires auth)`);
      console.log(`\n🏢 Online Labs — Build. Connect. Create. 🚀\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
module.exports = app;
