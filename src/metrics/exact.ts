import { Metric, Answer, Prompt, CoreContext } from '../core/types';

/**
 * Exact match metric
 * 
 * Compares the gold and fresh answers for exact string equality.
 * Returns 1 if they match exactly, 0 otherwise.
 */
export const exactMetric: Metric = {
  name: 'exact',
  
  init(opts: Record<string, unknown>, ctx: CoreContext): void {
    // No initialization needed for this simple metric
  },
  
  async score(gold: Answer, fresh: Answer, prompt: Prompt): Promise<number> {
    // Simple exact string comparison
    return gold === fresh ? 1 : 0;
  }
};