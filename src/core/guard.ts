import { GuardConfig, CoreContext, TestResult, GuardRunResult, Answer, Prompt } from './types';
import { loadConfig, processMetricsConfig } from './config';
import { getRegistry } from './registry';

/**
 * Guard decorator factory
 * Creates a decorator that wraps an LLM-powered function for evaluation
 */
export function Guard(config: GuardConfig) {
  return function<T extends (...args: any[]) => Promise<string>>(
    targetFunction: T
  ): T {
    // Create a wrapper function with the same signature
    const wrappedFunction = async function(this: any, ...args: any[]): Promise<string> {
      // Call the original function to get the result
      const result = await targetFunction.apply(this, args);
      
      // In normal operation, just return the result
      // The evaluation happens only when explicitly triggered by Runner
      return result;
    } as T;
    
    // Attach metadata to the wrapped function
    (wrappedFunction as any).__evalguard = {
      config,
      originalFn: targetFunction
    };
    
    return wrappedFunction;
  };
}

/**
 * Runner class for executing evaluations
 */
export class Runner {
  private context: CoreContext;
  
  constructor(options: { config?: string | GuardConfig } = {}) {
    // Initialize the context
    const registry = getRegistry();
    
    this.context = {
      providers: registry.providers,
      metrics: registry.metrics,
      reporters: registry.reporters,
      stores: registry.stores,
      config: loadConfig({
        configPath: typeof options.config === 'string' ? options.config : undefined,
        runtimeConfig: typeof options.config === 'object' ? options.config : undefined
      })
    };
  }
  
  /**
   * Run a test for a specific function
   */
  async test(
    id: string,
    fn: (...args: any[]) => Promise<string>,
    ...args: any[]
  ): Promise<TestResult> {
    // Get the guard config
    const guardConfig = (fn as any).__evalguard?.config || { id };
    
    // Ensure we have an ID
    if (!guardConfig.id) {
      guardConfig.id = id;
    }
    
    // Run the evaluation
    const results = await this.evaluate(guardConfig, fn, args);
    
    // Determine if the test passed based on the fail policy
    const failPolicy = this.context.config.failOn || 'must-pass';
    const pass = this.checkPass(results, failPolicy);
    
    // Report results
    await this.reportResults(results);
    
    return {
      pass,
      results
    };
  }
  
  /**
   * Evaluate a function against snapshots
   */
  private async evaluate(
    guardConfig: GuardConfig,
    fn: (...args: any[]) => Promise<string>,
    args: any[]
  ): Promise<GuardRunResult[]> {
    // Get the store
    const storeName = guardConfig.store || this.context.config.snapshots.backend;
    const store = this.context.stores[storeName];
    
    if (!store) {
      throw new Error(`Snapshot store '${storeName}' not found`);
    }
    
    // Initialize the store if needed
    if (!store.initialized) {
      await store.init({
        dir: this.context.config.snapshots.dir
      });
      store.initialized = true;
    }
    
    // Get the provider
    const providerName = guardConfig.provider || this.context.config.defaults.provider;
    const provider = this.context.providers[providerName];
    
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }
    
    // Generate a prompt from the arguments
    // In a real implementation, this would be more sophisticated
    const prompt = JSON.stringify(args) as Prompt;
    
    // Check if we have a snapshot
    const gold = await store.load(guardConfig.id, prompt);
    
    if (!gold) {
      // No snapshot found, create one
      const startTime = Date.now();
      const fresh = await fn(...args);
      const duration = Date.now() - startTime;
      
      // Save the snapshot
      await store.save(guardConfig.id, prompt, fresh);
      
      // Return a placeholder result
      return [{
        id: guardConfig.id,
        pass: true,
        metrics: {},
        gold: fresh,
        fresh,
        prompt,
        duration,
        cost: 0
      }];
    }
    
    // Run the function to get a fresh result
    const startTime = Date.now();
    const fresh = await fn(...args);
    const duration = Date.now() - startTime;
    
    // Process metrics configuration
    const metricsConfig = processMetricsConfig(
      guardConfig.metrics || this.context.config.defaults.metrics
    );
    
    // Run each enabled metric
    const metricResults: Record<string, { score: number; pass: boolean; threshold: number }> = {};
    let totalCost = 0;
    
    for (const [name, options] of Object.entries(metricsConfig)) {
      if (options.enabled === false) continue;
      
      const metric = this.context.metrics[name];
      if (!metric) {
        console.warn(`Metric '${name}' not found, skipping`);
        continue;
      }
      
      // Initialize the metric if needed
      if (!metric.initialized) {
        await metric.init(options, this.context);
        metric.initialized = true;
      }
      
      // Run the metric
      const score = await metric.score(gold, fresh, prompt);
      
      // Check if it passes the threshold
      const threshold = options.min || 0;
      const pass = score >= threshold;
      
      metricResults[name] = {
        score,
        pass,
        threshold
      };
      
      // Add to cost (in a real implementation, metrics would report their cost)
      totalCost += 0.01; // Placeholder
    }
    
    // Determine if the overall test passes
    const pass = Object.values(metricResults).every(r => r.pass);
    
    return [{
      id: guardConfig.id,
      pass,
      metrics: metricResults,
      gold,
      fresh,
      prompt,
      duration,
      cost: totalCost
    }];
  }
  
  /**
   * Check if the test passes based on the fail policy
   */
  private checkPass(results: GuardRunResult[], failPolicy: string): boolean {
    switch (failPolicy) {
      case 'must-pass':
        // Pass if all must-pass metrics pass
        return results.every(r => 
          Object.entries(r.metrics).every(([name, result]) => {
            const metricConfig = this.context.config.metrics[name];
            return !metricConfig?.mustPass || result.pass;
          })
        );
        
      case 'any':
        // Pass if all metrics pass
        return results.every(r => r.pass);
        
      case 'average':
        // Pass if the weighted average is positive
        // This would compare against a baseline in a real implementation
        return true;
        
      default:
        return false;
    }
  }
  
  /**
   * Report results using configured reporters
   */
  private async reportResults(results: GuardRunResult[]): Promise<void> {
    const reporterNames = this.context.config.reporters;
    
    for (const name of reporterNames) {
      const reporter = this.context.reporters[name];
      if (!reporter) {
        console.warn(`Reporter '${name}' not found, skipping`);
        continue;
      }
      
      for (const result of results) {
        await reporter.onResult(result);
      }
    }
  }
}