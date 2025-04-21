import { LLMProvider, Metric, Reporter, SnapshotStore } from './types';
import { exactMetric } from '../metrics/exact';
import { semanticMetric } from '../metrics/semantic';
import { judgeMetric } from '../metrics/judge';
import { claudeProvider, claudeEmbedProvider } from '../providers/claude';
import { openaiProvider } from '../providers/openai';
import { yamlStore } from '../stores/yaml';
import { consoleReporter } from '../reporters/console';
import { githubCheckReporter } from '../reporters/github-check';

/**
 * Registry for all plugins (providers, metrics, reporters, stores)
 */
interface Registry {
  providers: Record<string, LLMProvider>;
  metrics: Record<string, Metric>;
  reporters: Record<string, Reporter>;
  stores: Record<string, SnapshotStore>;
}

// Singleton registry instance
let registry: Registry | null = null;

/**
 * Get the plugin registry
 */
export function getRegistry(): Registry {
  if (!registry) {
    registry = {
      providers: {},
      metrics: {},
      reporters: {},
      stores: {}
    };
    
    // Load plugins from package.json
    loadPlugins();
  }
  
  return registry;
}

/**
 * Register a provider
 */
export function registerProvider(provider: LLMProvider): void {
  const reg = getRegistry();
  reg.providers[provider.name] = provider;
}

/**
 * Register a metric
 */
export function registerMetric(metric: Metric): void {
  const reg = getRegistry();
  reg.metrics[metric.name] = metric;
}

/**
 * Register a reporter
 */
export function registerReporter(reporter: Reporter): void {
  const reg = getRegistry();
  reg.reporters[reporter.name] = reporter;
}

/**
 * Register a snapshot store
 */
export function registerStore(store: SnapshotStore): void {
  const reg = getRegistry();
  reg.stores[store.name] = store;
}

/**
 * Load plugins from package.json
 */
function loadPlugins(): void {
  try {
    // In a real implementation, this would:
    // 1. Read package.json
    // 2. Look for "evalguard.plugins" section
    // 3. Load each plugin module
    // 4. Register the plugins
    
    // For now, we'll just register built-in plugins
    registerBuiltinPlugins();
  } catch (error) {
    console.error('Error loading plugins:', error);
  }
}

/**
 * Register built-in plugins
 */
function registerBuiltinPlugins(): void {
  // Register built-in metrics
  registerMetric(exactMetric);
  registerMetric(semanticMetric);
  registerMetric(judgeMetric);
  
  // Register built-in reporters
  registerReporter(consoleReporter);
  registerReporter(githubCheckReporter);
  
  // Register built-in snapshot stores
  registerStore(yamlStore);
  
  // Register built-in providers
  registerProvider(claudeProvider);
  registerProvider(claudeEmbedProvider);
  registerProvider(openaiProvider);
}