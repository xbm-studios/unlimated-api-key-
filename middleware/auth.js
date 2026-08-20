const fs = require('fs');

const authenticateRequest = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Missing or invalid authorization header. Use: Authorization: Bearer YOUR_API_KEY',
          type: 'invalid_request_error',
          param: 'authorization',
          code: 'invalid_api_key'
        }
      });
    }
    
    const providedApiKey = authHeader.slice(7);
    
    let validApiKey;
    try {
      const keyFilePath = process.env.ONLINE_LABS_API_KEY_FILE || './freeapikey.txt';
      validApiKey = fs.readFileSync(keyFilePath, 'utf8').trim();
    } catch (error) {
      console.error('❌ Error reading API key file:', error.message);
      return res.status(500).json({
        error: {
          message: 'Internal server error: Unable to validate API key',
          type: 'server_error',
          param: null,
          code: 'internal_error'
        }
      });
    }
    
    if (providedApiKey !== validApiKey) {
      return res.status(401).json({
        error: {
          message: 'Invalid API key. Get your API key from: https://github.com/xbm-studios/unlimated-api-key-/blob/main/freeapikey.txt',
          type: 'invalid_request_error',
          param: 'api_key',
          code: 'invalid_api_key'
        }
      });
    }
    
    req.apiKey = providedApiKey;
    req.apiKeyValid = true;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    res.status(500).json({
      error: {
        message: 'Internal server error during authentication',
        type: 'server_error',
        param: null,
        code: 'internal_error'
      }
    });
  }
};

module.exports = { authenticateRequest };
