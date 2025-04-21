import * as fs from 'fs';
import { Metric, Answer, Prompt, CoreContext, LLMProvider } from '../core/types';

/**
 * Judge metric
 * 
 * Uses an LLM to evaluate the quality of responses based on a rubric.
 * Returns a score between 0 and 10, where 10 is the best possible score.
 */
export const judgeMetric: Metric = {
  name: 'judge',
  
  private: {
    provider: null as LLMProvider | null,
    providerName: 'openai',
    model: 'gpt-4o-mini',
    rubric: '',
    rubricFile: '.eval/rubrics/default.md'
  },
  
  async init(opts: Record<string, unknown>, ctx: CoreContext): Promise<void> {
    // Get options
    this.private.providerName = (opts.provider as string) || ctx.config.defaults.provider;
    this.private.model = (opts.model as string) || 'gpt-4o-mini';
    this.private.rubricFile = (opts.rubricFile as string) || '.eval/rubrics/default.md';
    
    // Get the provider
    this.private.provider = ctx.providers[this.private.providerName];
    
    if (!this.private.provider) {
      throw new Error(`Provider '${this.private.providerName}' not found for judge metric`);
    }
    
    // Load the rubric
    try {
      this.private.rubric = fs.readFileSync(this.private.rubricFile, 'utf8');
    } catch (error) {
      throw new Error(`Failed to load rubric file: ${this.private.rubricFile}`);
    }
  },
  
  async score(gold: Answer, fresh: Answer, prompt: Prompt): Promise<number> {
    if (!this.private.provider) {
      throw new Error('Judge metric not initialized');
    }
    
    // Create the evaluation prompt
    const evaluationPrompt = `
You are an impartial judge evaluating the quality of an AI response.

# Rubric
${this.private.rubric}

# Original Query
${prompt}

# Gold Standard Response (for reference)
${gold}

# Response to Evaluate
${fresh}

# Evaluation
Please evaluate the "Response to Evaluate" based on the rubric provided.
For each criterion, assign a score and provide a brief justification.
Then, provide an overall score from 0-10 and a summary of your evaluation.

Your output should be structured as follows:
- Relevance: [score] - [justification]
- Accuracy: [score] - [justification]
- Completeness: [score] - [justification]
- Clarity: [score] - [justification]

Overall Score: [0-10]

Summary: [brief summary of evaluation]
`;
    
    // Get the evaluation from the LLM
    const evaluation = await this.private.provider.generate({
      prompt: evaluationPrompt,
      model: this.private.model,
      temperature: 0
    });
    
    // Extract the overall score
    const scoreMatch = evaluation.match(/Overall Score:\s*(\d+(?:\.\d+)?)/i);
    
    if (!scoreMatch) {
      console.warn('Failed to extract score from evaluation:', evaluation);
      return 5; // Default to middle score if extraction fails
    }
    
    const score = parseFloat(scoreMatch[1]);
    
    // Ensure the score is within the valid range
    return Math.max(0, Math.min(10, score));
  }
};