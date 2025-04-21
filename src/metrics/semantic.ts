import { Metric, Answer, Prompt, CoreContext, LLMProvider } from '../core/types';

/**
 * Semantic similarity metric
 * 
 * Compares the gold and fresh answers using embedding-based semantic similarity.
 * Returns a score between 0 and 1, where 1 is perfect similarity.
 */
export const semanticMetric: Metric = {
  name: 'semantic',
  
  private: {
    provider: null as LLMProvider | null,
    providerName: 'claude-embed'
  },
  
  async init(opts: Record<string, unknown>, ctx: CoreContext): Promise<void> {
    // Get the provider name from options or use default
    this.private.providerName = (opts.provider as string) || 'claude-embed';
    
    // Get the provider
    this.private.provider = ctx.providers[this.private.providerName];
    
    if (!this.private.provider) {
      throw new Error(`Provider '${this.private.providerName}' not found for semantic metric`);
    }
  },
  
  async score(gold: Answer, fresh: Answer, prompt: Prompt): Promise<number> {
    if (!this.private.provider) {
      throw new Error('Semantic metric not initialized');
    }
    
    // Get embeddings for both answers
    const embeddings = await this.private.provider.embed([gold, fresh]);
    
    if (embeddings.length !== 2) {
      throw new Error('Failed to get embeddings');
    }
    
    // Calculate cosine similarity
    const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
    
    return similarity;
  }
};

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}