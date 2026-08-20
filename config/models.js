const MODELS_CONFIG = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model from OpenAI',
    provider: 'openai',
    enabled: true,
    capabilities: ['chat', 'reasoning'],
    modelName: 'gpt-4'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Faster and more cost-effective GPT-4',
    provider: 'openai',
    enabled: true,
    capabilities: ['chat', 'reasoning'],
    modelName: 'gpt-4-turbo-preview'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient model from OpenAI',
    provider: 'openai',
    enabled: true,
    capabilities: ['chat'],
    modelName: 'gpt-3.5-turbo'
  },
  {
    id: 'llama-2-70b',
    name: 'Llama 2 70B',
    description: 'Meta\'s Llama 2 70B model (via Groq)',
    provider: 'groq',
    enabled: true,
    capabilities: ['chat'],
    modelName: 'llama2-70b-4096'
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    description: 'Mistral\'s Mixtral mixture of experts model (via Groq)',
    provider: 'groq',
    enabled: true,
    capabilities: ['chat'],
    modelName: 'mixtral-8x7b-32768'
  },
  {
    id: 'qwen-72b',
    name: 'Qwen 72B',
    description: 'Alibaba\'s Qwen 72B model',
    provider: 'openrouter',
    enabled: true,
    capabilities: ['chat'],
    modelName: 'qwen/qwen-72b-chat'
  }
];

const PROVIDERS_CONFIG = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    endpoint: '/chat/completions',
    apiKeyEnv: 'OPENAI_API_KEY',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    endpoint: '/chat/completions',
    apiKeyEnv: 'GROQ_API_KEY',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    endpoint: '/chat/completions',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/xbm-studios/unlimated-api-key-',
      'X-Title': 'Online Labs API',
      'Content-Type': 'application/json'
    })
  }
};

const loadModelsConfig = async () => {
  const enabledModels = [];
  const disabledModels = [];
  const errors = [];
  
  for (const model of MODELS_CONFIG) {
    if (!model.enabled) {
      disabledModels.push(model);
      continue;
    }
    
    const provider = PROVIDERS_CONFIG[model.provider];
    if (!provider) {
      errors.push(`Model "${model.id}" references unknown provider "${model.provider}"`);
      continue;
    }
    
    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey || apiKey.trim() === '') {
      console.warn(`⚠️  Model "${model.id}" disabled - Provider "${provider.name}" not configured (missing ${provider.apiKeyEnv})`);
      continue;
    }
    
    enabledModels.push(model);
  }
  
  if (errors.length > 0) {
    console.warn('⚠️  Configuration errors:');
    errors.forEach(err => console.warn(`   - ${err}`));
  }
  
  return {
    models: enabledModels,
    disabledModels: disabledModels,
    providers: PROVIDERS_CONFIG
  };
};

const getModelById = (modelId, config) => {
  return config.models.find(m => m.id === modelId);
};

const getProviderConfig = (providerId) => {
  return PROVIDERS_CONFIG[providerId];
};

const getProviderApiKey = (providerId) => {
  const provider = getProviderConfig(providerId);
  if (!provider) return null;
  return process.env[provider.apiKeyEnv] || null;
};

module.exports = {
  loadModelsConfig,
  getModelById,
  getProviderConfig,
  getProviderApiKey,
  MODELS_CONFIG,
  PROVIDERS_CONFIG
};
