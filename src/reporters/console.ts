import { Reporter, GuardRunResult } from '../core/types';

/**
 * Console reporter
 * 
 * Reports test results to the console.
 */
export const consoleReporter: Reporter = {
  name: 'console',
  
  onResult(result: GuardRunResult): void {
    console.log('\n=== EvalGuard Result ===');
    console.log(`ID: ${result.id}`);
    console.log(`Pass: ${result.pass ? '✅ YES' : '❌ NO'}`);
    
    console.log('\nMetrics:');
    for (const [name, data] of Object.entries(result.metrics)) {
      const passSymbol = data.pass ? '✅' : '❌';
      console.log(`  ${passSymbol} ${name}: ${data.score.toFixed(2)} (threshold: ${data.threshold.toFixed(2)})`);
    }
    
    console.log('\nPrompt:');
    console.log(`  ${result.prompt.substring(0, 100)}${result.prompt.length > 100 ? '...' : ''}`);
    
    console.log('\nGold Answer:');
    console.log(`  ${result.gold.substring(0, 100)}${result.gold.length > 100 ? '...' : ''}`);
    
    console.log('\nFresh Answer:');
    console.log(`  ${result.fresh.substring(0, 100)}${result.fresh.length > 100 ? '...' : ''}`);
    
    console.log(`\nDuration: ${result.duration}ms`);
    console.log(`Cost: $${result.cost.toFixed(4)}`);
    console.log('========================\n');
  }
};