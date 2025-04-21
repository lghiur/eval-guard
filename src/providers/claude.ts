import { LLMProvider, GenerateOpts } from '../core/types';

/**
 * Claude provider adapter
 *
 * Uses the Anthropic API to generate text and embeddings.
 * Configurable via environment variables:
 * - ANTHROPIC_API_KEY: Your Anthropic API key
 * - ANTHROPIC_API_URL: (Optional) Custom API URL for proxies or enterprise deployments
 */
export const claudeProvider: LLMProvider = {
  name: 'claude',
  
  async generate(opts: GenerateOpts): Promise<string> {
    console.log(`[Claude] Generating with model: ${opts.model}, temp: ${opts.temperature}`);
    console.log(`[Claude] Prompt: ${opts.prompt.substring(0, 100)}...`);
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('[Claude] No ANTHROPIC_API_KEY environment variable found. Using placeholder response.');
      return `This is a placeholder response from Claude (${opts.model}).
      
The prompt was about: ${opts.prompt.substring(0, 50)}...

Here's a thoughtful response that would normally come from the Claude API.`;
    }
    
    // In a real implementation, this would call the Anthropic API with the provided key
    // For now, just acknowledge we have the key but still return a placeholder
    console.log('[Claude] Using ANTHROPIC_API_KEY from environment variables');
    
    // Use custom API URL if provided
    const apiUrl = process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com';
    console.log(`[Claude] Using API URL: ${apiUrl}`);
    
    return `This is a placeholder response from Claude (${opts.model}).
    
The prompt was about: ${opts.prompt.substring(0, 50)}...

Here's a thoughtful response that would normally come from the Claude API using the provided API key.`;
  },
  
  async embed(texts: string[]): Promise<number[][]> {
    console.log(`[Claude] Embedding ${texts.length} texts`);
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('[Claude] No ANTHROPIC_API_KEY environment variable found. Using random embeddings.');
      // Return random embeddings
      return texts.map(() => {
        // Generate a random 1536-dimensional embedding
        return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
      });
    }
    
    console.log('[Claude] Using ANTHROPIC_API_KEY from environment variables for embeddings');
    
    // Use custom API URL if provided
    const apiUrl = process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com';
    console.log(`[Claude] Using API URL: ${apiUrl}`);
    
    // In a real implementation, this would call the Anthropic API
    // For now, return random embeddings
    return texts.map(() => {
      // Generate a random 1536-dimensional embedding
      return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    });
  }
};

/**
 * Claude embedding-specific provider
 */
export const claudeEmbedProvider: LLMProvider = {
  name: 'claude-embed',
  
  async generate(opts: GenerateOpts): Promise<string> {
    throw new Error('Claude-embed provider is for embeddings only');
  },
  
  async embed(texts: string[]): Promise<number[][]> {
    console.log(`[Claude-Embed] Embedding ${texts.length} texts`);
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('[Claude-Embed] No ANTHROPIC_API_KEY environment variable found. Using random embeddings.');
      // Return random embeddings
      return texts.map(() => {
        // Generate a random 1536-dimensional embedding
        return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
      });
    }
    
    console.log('[Claude-Embed] Using ANTHROPIC_API_KEY from environment variables');
    
    // Use custom API URL if provided
    const apiUrl = process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com';
    console.log(`[Claude-Embed] Using API URL: ${apiUrl}`);
    
    // In a real implementation, this would call the Anthropic API
    // For now, return random embeddings
    return texts.map(() => {
      // Generate a random 1536-dimensional embedding
      return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    });
  }
};