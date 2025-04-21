import { Reporter, GuardRunResult } from '../core/types';

/**
 * GitHub Check reporter
 * 
 * Reports test results as a GitHub Check.
 * This is a placeholder implementation. In a real application, this would
 * use the GitHub API to create a check run.
 */
export const githubCheckReporter: Reporter = {
  name: 'github-check',
  
  async onResult(result: GuardRunResult): Promise<void> {
    console.log('\n=== GitHub Check Reporter ===');
    console.log('This is a placeholder implementation.');
    console.log('In a real application, this would create a GitHub Check Run.');
    
    // In a real implementation, this would:
    // 1. Check if running in a GitHub Actions environment
    // 2. Get the GitHub token from environment variables
    // 3. Create a GitHub Check Run using the GitHub API
    
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    if (!isGitHubActions) {
      console.log('Not running in GitHub Actions, skipping GitHub Check.');
      return;
    }
    
    // Create a summary of the results
    const summary = createSummary(result);
    
    console.log('Would create GitHub Check with:');
    console.log(`  Name: EvalGuard - ${result.id}`);
    console.log(`  Status: ${result.pass ? 'success' : 'failure'}`);
    console.log(`  Summary: ${summary}`);
    console.log('========================\n');
  }
};

/**
 * Create a summary of the results
 */
function createSummary(result: GuardRunResult): string {
  const passCount = Object.values(result.metrics).filter(m => m.pass).length;
  const totalCount = Object.keys(result.metrics).length;
  
  let summary = `${passCount}/${totalCount} metrics passed`;
  
  if (!result.pass) {
    const failedMetrics = Object.entries(result.metrics)
      .filter(([, data]) => !data.pass)
      .map(([name, data]) => `${name} (${data.score.toFixed(2)} < ${data.threshold.toFixed(2)})`);
    
    summary += `. Failed metrics: ${failedMetrics.join(', ')}`;
  }
  
  return summary;
}