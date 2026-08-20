const express = require('express');
const router = express.Router();
const axios = require('axios');
const { loadModelsConfig, getModelById, getProviderConfig, getProviderApiKey } = require('../config/models');

router.post('/', async (req, res, next) => {
  try {
    const { model, messages, temperature, top_p, max_tokens, stream } = req.body;
    
    if (!model) {
      return res.status(400).json({
        error: {
          message: 'Missing required field: model',
          type: 'invalid_request_error',
          param: 'model',
          code: 'missing_field'
        }
      });
    }
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: {
          message: 'Missing required field: messages (must be an array)',
          type: 'invalid_request_error',
          param: 'messages',
          code: 'invalid_type'
        }
      });
    }
    
    if (messages.length === 0) {
      return res.status(400).json({
        error: {
          message: 'Messages array cannot be empty',
          type: 'invalid_request_error',
          param: 'messages',
          code: 'empty_array'
        }
      });
    }
    
    if (stream === true) {
      return res.status(400).json({
        error: {
          message: 'Streaming is not currently supported. Please set stream to false.',
          type: 'invalid_request_error',
          param: 'stream',
          code: 'unsupported'
        }
      });
    }
    
    const config = await loadModelsConfig();
    const selectedModel = getModelById(model, config);
    
    if (!selectedModel) {
      return res.status(404).json({
        error: {
          message: `Model "${model}" not found or not available. Available models: ${config.models.map(m => m.id).join(', ')}`,
          type: 'invalid_request_error',
          param: 'model',
          code: 'model_not_found'
        }
      });
    }
    
    const providerConfig = getProviderConfig(selectedModel.provider);
    const providerApiKey = getProviderApiKey(selectedModel.provider);
    
    if (!providerApiKey) {
      return res.status(503).json({
        error: {
          message: `Provider "${selectedModel.provider}" is not configured. Missing API key.`,
          type: 'service_unavailable',
          param: null,
          code: 'provider_not_configured'
        }
      });
    }
    
    const providerRequest = {
      model: selectedModel.modelName,
      messages: messages,
      ...(temperature !== undefined && { temperature }),
      ...(top_p !== undefined && { top_p }),
      ...(max_tokens !== undefined && { max_tokens })
    };
    
    console.log(`📡 Routing request to ${selectedModel.provider} for model ${selectedModel.id}`);
    
    const providerUrl = `${providerConfig.baseUrl}${providerConfig.endpoint}`;
    const headers = providerConfig.headers(providerApiKey);
    
    const providerResponse = await axios.post(providerUrl, providerRequest, { headers });
    
    res.status(200).json(providerResponse.data);
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
