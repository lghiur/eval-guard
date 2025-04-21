# EvalGuard-JS

A plug-and-play TypeScript library that turns any LLM-powered function into a self-testing unit.

## Features

With one wrapper you can:

- **Record the model's current answers as snapshots.**
- **Re-run & compare those answers on every commit**, using opt-in metrics such as exact diff, embedding-based semantic similarity, Claude/OpenAI rubric-grading, graph-isomorphism, latency, etc.
- **Fail or pass the build** according to fully-configurable thresholds, weights, and cost budgets.

All engines—metrics, LLM providers, reporters, snapshot stores—are discoverable plugins, so teams can swap models, disable features, or add new checks without touching core code. The result: every PR shows at a glance whether your AI output stayed the same, got better, or silently regressed.

## Installation

```bash
npm install evalguard
```

## Quick Start

```typescript
import { Guard } from "evalguard";

// Wrap your LLM-powered function with the Guard decorator
export const guardedSearch = Guard({
  id: "search_cli",
  metrics: ["exact", "semantic>=0.92", "judge>=8"],
  store: "yaml",                 // or "sqlite", or your own
  provider: "claude",            // any registered adapter
  model: "claude-3-haiku-embed",
  judgeModel: "claude-3-sonnet",
  temperature: 0,
  concurrency: 3                // eval in parallel
})(probeSearch);

// Use it like the original function
const result = await guardedSearch("query", "context");
```

For frameworks that dislike decorators, you can use the imperative Runner:

```typescript
import { Runner } from "evalguard";

const run = new Runner({ config: "evalguardrc.yaml" });
const { pass, results } = await run.test("search_cli", () => probeSearch("ranking", "."));
```

## Configuration

EvalGuard can be configured using a YAML or JSON configuration file:

```yaml
# .evalguardrc.yaml
defaults:
  provider: claude
  model: claude-3-sonnet-2025-05-10
  temperature: 0
  metrics: [exact, semantic>=0.92]

metrics:
  exact:
    enabled: true

  semantic:
    provider: claude-embed
    min: 0.92

  judge:
    enabled: false          # opt-out by default
    provider: openai
    model: gpt-4o-mini
    rubricFile: .eval/rubrics/default.md
    min: 8

snapshots:
  backend: yaml
  dir: .evalguard/snapshots

reporters:
  - console
  - github-check
budgetUsd: 2
concurrency: 3
```

## Environment Variables

EvalGuard can be configured using environment variables, which is especially useful when integrating with other tools like the probe project:

```bash
# LLM Provider API Keys
export ANTHROPIC_API_KEY=your_anthropic_api_key    # For Claude models
export OPENAI_API_KEY=your_openai_api_key          # For OpenAI models

# API URLs (optional, for proxies or enterprise deployments)
export ANTHROPIC_API_URL=https://your-anthropic-proxy.com
export OPENAI_API_URL=https://your-openai-proxy.com/v1

# Model Selection
export MODEL_NAME=claude-3-opus-20240229           # Override the default model

# EvalGuard Configuration
export EVALGUARD_BUDGET_USD=5                      # Set budget limit in USD
export EVALGUARD_CONCURRENCY=4                     # Set concurrency level
```

When both ANTHROPIC_API_KEY and OPENAI_API_KEY are provided, EvalGuard will prioritize Claude models by default.

## CLI Commands

EvalGuard comes with a CLI for managing snapshots and running tests:

```bash
# Initialize a new project
evalguard init

# Record or update snapshots
evalguard snapshot
evalguard snapshot -u  # update existing snapshots

# Run tests
evalguard run

# Show differences between snapshots and current results
evalguard diff

# List available metrics, providers, and reporters
evalguard list
```

## Workflow Examples

```bash
# Run only exact + semantic (skip judge) for quick local check
evalguard run --metrics exact,semantic

# CI Stage 1: cheap metrics
evalguard run --failOn any --metrics exact,semantic

# CI Stage 2 (nightly): full judge pass
evalguard run --metrics judge --budget 10 --concurrency 1
```

## Plugin System

EvalGuard uses a plugin system for metrics, providers, reporters, and snapshot stores. Plugins are discovered via the `evalguard.plugins` field in package.json.

### Creating a Metric Plugin

```typescript
import { Metric } from "evalguard";

export const myMetric: Metric = {
  name: "my-metric",
  init(opts, ctx) {
    // Initialize the metric
  },
  score(gold, fresh, prompt) {
    // Calculate the score
    return 0.95;
  }
};
```

### Creating a Provider Plugin

```typescript
import { LLMProvider } from "evalguard";

export const myProvider: LLMProvider = {
  name: "my-provider",
  generate(opts) {
    // Generate text
    return Promise.resolve("Generated text");
  },
  embed(texts) {
    // Generate embeddings
    return Promise.resolve(texts.map(() => Array(1536).fill(0).map(() => Math.random())));
  }
};
```

## License

MIT