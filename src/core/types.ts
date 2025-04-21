/**
 * Core types for EvalGuard
 */

// Basic types
export type Answer = string;
export type Prompt = string;

// Provider types
export interface GenerateOpts {
  prompt: string;
  model: string;
  temperature?: number;
  topP?: number;
  seed?: number;
  [key: string]: any;
}

export interface LLMProvider {
  name: string;
  generate(opts: GenerateOpts): Promise<string>;
  embed(texts: string[]): Promise<number[][]>;
  initialized?: boolean;
}

// Metric types
export interface MetricOptions {
  enabled?: boolean;
  min?: number;
  weight?: number;
  mustPass?: boolean;
  provider?: string;
  model?: string;
  rubricFile?: string;
  [key: string]: any;
}

export interface Metric {
  name: string;
  init(opts: Record<string, unknown>, ctx: CoreContext): Promise<void> | void;
  score(gold: Answer, fresh: Answer, prompt: Prompt): Promise<number>;
  initialized?: boolean;
  [key: string]: any; // Allow additional properties
}

// Reporter types
export interface GuardRunResult {
  id: string;
  pass: boolean;
  metrics: Record<string, {
    score: number;
    pass: boolean;
    threshold: number;
  }>;
  gold: Answer;
  fresh: Answer;
  prompt: Prompt;
  duration: number;
  cost: number;
}

export interface Reporter {
  name: string;
  onResult(result: GuardRunResult): void | Promise<void>;
}

// Snapshot store types
export interface SnapshotStore {
  name: string;
  init(opts: Record<string, unknown>): Promise<void> | void;
  save(id: string, prompt: Prompt, answer: Answer): Promise<void>;
  load(id: string, prompt: Prompt): Promise<Answer | null>;
  initialized?: boolean;
  [key: string]: any; // Allow additional properties
}

// Configuration types
export interface GuardConfig {
  id: string;
  metrics: string[] | Record<string, MetricOptions>;
  store?: string;
  provider?: string;
  model?: string;
  judgeModel?: string;
  temperature?: number;
  concurrency?: number;
  providerOptions?: Record<string, any>;
  [key: string]: any;
}

export interface RunnerConfig {
  config?: string | GuardConfig;
  failOn?: 'must-pass' | 'any' | 'average';
  budgetUsd?: number;
}

export interface CoreContext {
  providers: Record<string, LLMProvider>;
  metrics: Record<string, Metric>;
  reporters: Record<string, Reporter>;
  stores: Record<string, SnapshotStore>;
  config: {
    defaults: {
      provider: string;
      model: string;
      temperature: number;
      metrics: string[];
    };
    metrics: Record<string, MetricOptions>;
    snapshots: {
      backend: string;
      dir: string;
    };
    reporters: string[];
    budgetUsd: number;
    concurrency: number;
    failOn?: 'must-pass' | 'any' | 'average';
  };
}

// Result types
export interface TestResult {
  pass: boolean;
  results: GuardRunResult[];
}