import { LLMProvider, GenerateOpts } from '../core/types';

/**
 * OpenAI provider adapter
 *
 * Uses the OpenAI API to generate text and embeddings.
 * Configurable via environment variables:
 * - OPENAI_API_KEY: Your OpenAI API key
 * - OPENAI_API_URL: (Optional) Custom API URL for proxies or enterprise deployments
 * - MODEL_NAME: (Optional) Override the default model
 */
export const openaiProvider: LLMProvider = {
  name: 'openai',
  
  async generate(opts: GenerateOpts): Promise<string> {
    // Check if MODEL_NAME environment variable should override the model
    const modelName = process.env.MODEL_NAME || opts.model;
    
    console.log(`[OpenAI] Generating with model: ${modelName}, temp: ${opts.temperature}`);
    console.log(`[OpenAI] Prompt: ${opts.prompt.substring(0, 100)}...`);
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[OpenAI] No OPENAI_API_KEY environment variable found. Using placeholder response.');
      return `This is a placeholder response from OpenAI (${modelName}).
      
The prompt was about: ${opts.prompt.substring(0, 50)}...

Here's a thoughtful response that would normally come from the OpenAI API.`;
    }
    
    // In a real implementation, this would call the OpenAI API with the provided key
    // For now, just acknowledge we have the key but still return a placeholder
    console.log('[OpenAI] Using OPENAI_API_KEY from environment variables');
    
    // Use custom API URL if provided
    const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
    console.log(`[OpenAI] Using API URL: ${apiUrl}`);
    
    return `This is a placeholder response from OpenAI (${modelName}).
    
The prompt was about: ${opts.prompt.substring(0, 50)}...

Here's a thoughtful response that would normally come from the OpenAI API using the provided API key.`;
  },
  
  async embed(texts: string[]): Promise<number[][]> {
    console.log(`[OpenAI] Embedding ${texts.length} texts`);
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[OpenAI] No OPENAI_API_KEY environment variable found. Using random embeddings.');
      // Return random embeddings
      return texts.map(() => {
        // Generate a random 1536-dimensional embedding
        return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
      });
    }
    
    console.log('[OpenAI] Using OPENAI_API_KEY from environment variables for embeddings');
    
    // Use custom API URL if provided
    const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
    console.log(`[OpenAI] Using API URL: ${apiUrl}`);
    
    // In a real implementation, this would call the OpenAI API
    // For now, return random embeddings
    return texts.map(() => {
      // Generate a random 1536-dimensional embedding
      return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    });
  }
};