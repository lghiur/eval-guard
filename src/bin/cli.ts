#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { getRegistry } from '../core/registry';
import { loadConfig } from '../core/config';
import { Runner } from '../core/guard';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

// Parse options
const options: Record<string, string> = {};
for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    options[key] = value || 'true';
  }
}

// Main function
async function main() {
  switch (command) {
    case 'init':
      await initCommand();
      break;
    case 'snapshot':
      await snapshotCommand(options.update === 'true');
      break;
    case 'run':
      await runCommand();
      break;
    case 'diff':
      await diffCommand();
      break;
    case 'list':
      await listCommand();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Initialize a new project
async function initCommand() {
  console.log('Initializing EvalGuard...');
  
  // Create config file if it doesn't exist
  if (!fs.existsSync('.evalguardrc.yaml')) {
    const configTemplate = `# EvalGuard configuration file

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
    enabled: false
    provider: openai
    model: gpt-4o-mini
    rubricFile: .eval/rubrics/default.md
    min: 8

snapshots:
  backend: yaml
  dir: .evalguard/snapshots

reporters:
  - console

budgetUsd: 2
concurrency: 3
`;
    
    fs.writeFileSync('.evalguardrc.yaml', configTemplate);
    console.log('Created .evalguardrc.yaml');
  }
  
  // Create directories
  const dirs = [
    '.evalguard/snapshots',
    '.eval/rubrics'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created ${dir}`);
    }
  }
  
  // Create rubric file
  const rubricPath = '.eval/rubrics/default.md';
  if (!fs.existsSync(rubricPath)) {
    const rubricTemplate = `# Default Evaluation Rubric

This rubric is used to evaluate the quality of LLM responses on a scale of 1-10.

## Criteria

### Relevance (0-3 points)
- 3: Response directly addresses the query with highly relevant information
- 2: Response mostly addresses the query with mostly relevant information
- 1: Response partially addresses the query with some relevant information
- 0: Response does not address the query or provides irrelevant information

### Accuracy (0-3 points)
- 3: All information is factually correct and up-to-date
- 2: Most information is factually correct with minor inaccuracies
- 1: Some information is factually correct but contains significant inaccuracies
- 0: Information is mostly or entirely incorrect

### Completeness (0-2 points)
- 2: Response provides comprehensive coverage of the topic
- 1: Response provides partial coverage of the topic
- 0: Response is incomplete or missing key information

### Clarity (0-2 points)
- 2: Response is well-structured, concise, and easy to understand
- 1: Response is somewhat structured but could be clearer
- 0: Response is poorly structured, verbose, or difficult to understand

## Scoring Guide

- 9-10: Exceptional response that exceeds expectations
- 8: Excellent response that fully meets expectations
- 6-7: Good response with minor issues
- 4-5: Adequate response with significant issues
- 1-3: Poor response with major issues
- 0: Unacceptable response
`;
    
    fs.writeFileSync(rubricPath, rubricTemplate);
    console.log(`Created ${rubricPath}`);
  }
  
  console.log('Initialization complete!');
}

// Create or update snapshots
async function snapshotCommand(update: boolean) {
  console.log(`${update ? 'Updating' : 'Creating'} snapshots...`);
  
  // In a real implementation, this would:
  // 1. Find all guarded functions
  // 2. Run them to create snapshots
  // 3. Save the snapshots
  
  console.log('Not implemented yet');
}

// Run tests
async function runCommand() {
  console.log('Running tests...');
  
  // Get metrics from options
  const metricNames = options.metrics?.split(',') || [];
  
  // Get config path
  const configPath = options.config;
  
  // Create runner
  const runner = new Runner({
    config: configPath
  });
  
  // In a real implementation, this would:
  // 1. Find all guarded functions
  // 2. Run tests for each function
  // 3. Report results
  
  console.log('Not implemented yet');
}

// Show differences between snapshots and current results
async function diffCommand() {
  console.log('Showing differences...');
  
  // In a real implementation, this would:
  // 1. Find all guarded functions
  // 2. Run them to get current results
  // 3. Compare with snapshots
  // 4. Show differences
  
  console.log('Not implemented yet');
}

// List available metrics, providers, and reporters
async function listCommand() {
  console.log('Available plugins:');
  
  const registry = getRegistry();
  
  console.log('\nMetrics:');
  Object.keys(registry.metrics).forEach(name => {
    console.log(`  - ${name}`);
  });
  
  console.log('\nProviders:');
  Object.keys(registry.providers).forEach(name => {
    console.log(`  - ${name}`);
  });
  
  console.log('\nReporters:');
  Object.keys(registry.reporters).forEach(name => {
    console.log(`  - ${name}`);
  });
  
  console.log('\nSnapshot Stores:');
  Object.keys(registry.stores).forEach(name => {
    console.log(`  - ${name}`);
  });
}

// Show help
function showHelp() {
  console.log(`
EvalGuard CLI

Usage: evalguard <command> [options]

Commands:
  init                  Scaffold config and example prompts
  snapshot [-u]         Record or update golden snapshots
  run                   Execute test suite
  diff                  Print metric deltas between old and new results
  list                  List available metrics, providers, and reporters
  help                  Show this help message

Options:
  --config=<path>       Path to config file
  --metrics=<list>      Comma-separated list of metrics to use
  --provider=<name>     Provider to use
  --concurrency=<num>   Number of tests to run in parallel
  --budget=<num>        Maximum budget in USD
  --reporter=<name>     Reporter to use
  `);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});