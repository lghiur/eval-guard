import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { CoreContext, GuardConfig, MetricOptions } from './types';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: CoreContext['config'] = {
  defaults: {
    provider: 'claude',
    model: 'claude-3-sonnet-2025-05-10',
    temperature: 0,
    metrics: ['exact', 'semantic>=0.92']
  },
  metrics: {
    exact: {
      enabled: true
    },
    semantic: {
      provider: 'claude-embed',
      min: 0.92
    },
    judge: {
      enabled: false,
      provider: 'openai',
      model: 'gpt-4o-mini',
      rubricFile: '.eval/rubrics/default.md',
      min: 8
    }
  },
  snapshots: {
    backend: 'yaml',
    dir: '.evalguard/snapshots'
  },
  reporters: ['console'],
  budgetUsd: 2,
  concurrency: 3
};

/**
 * Load configuration from a file
 * @param filePath Path to the configuration file
 * @returns Loaded configuration
 */
export function loadConfigFromFile(filePath: string): Partial<CoreContext['config']> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath).toLowerCase();
    
    if (fileExt === '.json') {
      return JSON.parse(fileContent);
    } else if (fileExt === '.yaml' || fileExt === '.yml') {
      return yaml.load(fileContent) as Partial<CoreContext['config']>;
    } else {
      throw new Error(`Unsupported config file format: ${fileExt}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`Config file not found: ${filePath}, using defaults`);
      return {};
    }
    throw error;
  }
}

/**
 * Parse metric string with threshold
 * Example: "semantic>=0.92" -> { name: "semantic", min: 0.92 }
 */
export function parseMetricString(metricStr: string): { name: string; options: Partial<MetricOptions> } {
  const thresholdMatch = metricStr.match(/^([a-zA-Z0-9_-]+)(?:(>=|<=|>|<|=)([0-9.]+))?$/);
  
  if (!thresholdMatch) {
    throw new Error(`Invalid metric format: ${metricStr}`);
  }
  
  const [, name, operator, valueStr] = thresholdMatch;
  const options: Partial<MetricOptions> = {};
  
  if (operator && valueStr) {
    const value = parseFloat(valueStr);
    
    switch (operator) {
      case '>=':
      case '=':
        options.min = value;
        break;
      case '<=':
        options.max = value;
        break;
      case '>':
        options.min = value + Number.EPSILON;
        break;
      case '<':
        options.max = value - Number.EPSILON;
        break;
    }
  }
  
  return { name, options };
}

/**
 * Process metrics configuration from strings or objects
 */
export function processMetricsConfig(
  metrics: string[] | Record<string, MetricOptions>
): Record<string, MetricOptions> {
  if (Array.isArray(metrics)) {
    return metrics.reduce((acc, metricStr) => {
      const { name, options } = parseMetricString(metricStr);
      acc[name] = { enabled: true, ...options };
      return acc;
    }, {} as Record<string, MetricOptions>);
  }
  
  return Object.entries(metrics).reduce((acc, [name, options]) => {
    acc[name] = { enabled: true, ...options };
    return acc;
  }, {} as Record<string, MetricOptions>);
}

/**
 * Merge configurations from different sources
 * Priority: runtime options > environment variables > config file > defaults
 */
export function mergeConfigs(
  defaultConfig: CoreContext['config'],
  fileConfig: Partial<CoreContext['config']> = {},
  runtimeConfig: Partial<GuardConfig> = {}
): CoreContext['config'] {
  // Start with default config
  const result = { ...defaultConfig };
  
  // Merge file config
  if (fileConfig.defaults) {
    result.defaults = { ...result.defaults, ...fileConfig.defaults };
  }
  
  if (fileConfig.metrics) {
    result.metrics = { ...result.metrics, ...fileConfig.metrics };
  }
  
  if (fileConfig.snapshots) {
    result.snapshots = { ...result.snapshots, ...fileConfig.snapshots };
  }
  
  if (fileConfig.reporters) {
    result.reporters = fileConfig.reporters;
  }
  
  if (fileConfig.budgetUsd !== undefined) {
    result.budgetUsd = fileConfig.budgetUsd;
  }
  
  if (fileConfig.concurrency !== undefined) {
    result.concurrency = fileConfig.concurrency;
  }
  
  // Apply environment variables
  const envBudget = process.env.EVALGUARD_BUDGET_USD;
  if (envBudget) {
    result.budgetUsd = parseFloat(envBudget);
  }
  
  // Apply runtime config
  if (runtimeConfig.metrics) {
    const runtimeMetrics = processMetricsConfig(runtimeConfig.metrics);
    
    // Override specific metrics
    for (const [name, options] of Object.entries(runtimeMetrics)) {
      result.metrics[name] = { ...result.metrics[name], ...options };
    }
  }
  
  if (runtimeConfig.concurrency !== undefined) {
    result.concurrency = runtimeConfig.concurrency;
  }
  
  return result;
}

/**
 * Load configuration from various sources
 */
export function loadConfig(options: {
  configPath?: string;
  runtimeConfig?: Partial<GuardConfig>;
}): CoreContext['config'] {
  const { configPath, runtimeConfig = {} } = options;
  
  // Try to load from default locations if not specified
  let fileConfig: Partial<CoreContext['config']> = {};
  
  if (configPath) {
    fileConfig = loadConfigFromFile(configPath);
  } else {
    // Try common config file names
    const configFiles = [
      '.evalguardrc',
      '.evalguardrc.json',
      '.evalguardrc.yaml',
      '.evalguardrc.yml',
      'evalguard.config.js'
    ];
    
    for (const file of configFiles) {
      try {
        if (fs.existsSync(file)) {
          fileConfig = loadConfigFromFile(file);
          break;
        }
      } catch (error) {
        console.warn(`Error loading config from ${file}:`, error);
      }
    }
  }
  
  return mergeConfigs(DEFAULT_CONFIG, fileConfig, runtimeConfig);
}