// Azure OpenAI Configuration Validator
const validateAzureConfig = () => {
  const requiredEnvVars = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_DEPLOYMENT_NAME',
    'AZURE_OPENAI_API_VERSION'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Azure OpenAI Configuration Error:');
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('\nPlease check your server/.env file and ensure all Azure OpenAI settings are configured.');
    return false;
  }

  console.log('✅ Azure OpenAI Configuration Valid');
  console.log(`📍 Endpoint: ${process.env.AZURE_OPENAI_ENDPOINT}`);
  console.log(`🚀 Deployment: ${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`);
  console.log(`📋 API Version: ${process.env.AZURE_OPENAI_API_VERSION}`);
  
  return true;
};

module.exports = { validateAzureConfig };
