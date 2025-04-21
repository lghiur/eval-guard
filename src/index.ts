/**
 * EvalGuard-JS
 * A plug-and-play TypeScript library that turns any LLM-powered function into a self-testing unit.
 */

// Export core APIs
export { Guard, Runner } from './core/guard';
export { registerProvider, registerMetric, registerReporter, registerStore } from './core/registry';

// Export types
export {
  GuardConfig,
  RunnerConfig,
  LLMProvider,
  Metric,
  Reporter,
  SnapshotStore,
  TestResult,
  GuardRunResult,
  Answer,
  Prompt
} from './core/types';