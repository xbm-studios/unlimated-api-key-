const express = require('express');
const router = express.Router();
const { loadModelsConfig } = require('../config/models');

router.get('/', async (req, res, next) => {
  try {
    const config = await loadModelsConfig();
    
    if (config.models.length === 0) {
      return res.status(503).json({
        error: {
          message: 'No models currently available. Please configure at least one provider with an API key.',
          type: 'service_unavailable',
          param: null,
          code: 'no_models_available'
        }
      });
    }
    
    res.status(200).json({
      object: 'list',
      data: config.models.map(model => ({
        id: model.id,
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: model.provider,
        name: model.name,
        description: model.description,
        provider: model.provider,
        capabilities: model.capabilities
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
