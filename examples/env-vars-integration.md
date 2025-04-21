# Using EvalGuard with Environment Variables

This guide explains how to configure EvalGuard using environment variables for LLM integration.

## Overview

Using environment variables with EvalGuard allows you to:

1. Easily switch between different LLM providers (Claude, OpenAI)
2. Configure API endpoints for enterprise deployments or proxies
3. Override model selection and other settings
4. Share configuration across different tools and libraries

## Environment Variables

EvalGuard supports the following environment variables:

### LLM Provider API Keys

```bash
# For Claude models
export ANTHROPIC_API_KEY=your_anthropic_api_key

# For OpenAI models
export OPENAI_API_KEY=your_openai_api_key
```

When both API keys are provided, EvalGuard will prioritize Claude models by default.

### API URLs (Optional)

```bash
# Custom API URL for Anthropic Claude
export ANTHROPIC_API_URL=https://your-anthropic-proxy.com

# Custom API URL for OpenAI
export OPENAI_API_URL=https://your-openai-proxy.com/v1
```

### Model Selection

```bash
# Override the default model
export MODEL_NAME=claude-3-opus-20240229
```

### EvalGuard Configuration

```bash
# Set budget limit in USD
export EVALGUARD_BUDGET_USD=5

# Set concurrency level
export EVALGUARD_CONCURRENCY=4
```

## Example Usage

The `llm-env-vars-example.ts` file demonstrates how to use EvalGuard with environment variables:

```bash
# Set your API key
export ANTHROPIC_API_KEY=your_api_key

# Run the example
ts-node examples/llm-env-vars-example.ts
```

## How It Works

1. When you initialize EvalGuard, it checks for environment variables
2. If `ANTHROPIC_API_KEY` is present, it configures Claude as the default provider
3. If `OPENAI_API_KEY` is present (and Claude is not), it configures OpenAI as the default
4. If `MODEL_NAME` is set, it overrides the default model
5. Custom API URLs are used if provided

## Integration with Configuration Files

Environment variables take precedence over configuration files. The priority order is:

1. Runtime options (passed directly to Guard or Runner)
2. Environment variables
3. Configuration file (.evalguardrc.yaml)
4. Default values

This allows you to use environment variables for sensitive information or deployment-specific settings while keeping other configuration in your .evalguardrc.yaml file.

## Best Practices

1. **Use environment variables for secrets**: Never commit API keys to your repository
2. **Use configuration files for project settings**: Keep metrics, thresholds, etc. in .evalguardrc.yaml
3. **Override when needed**: Use environment variables to override settings in specific environments (CI/CD, staging, production)
4. **Document requirements**: Make it clear which environment variables your project requires

## Example: CI/CD Integration

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - name: Run EvalGuard tests
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          EVALGUARD_BUDGET_USD: 5
          EVALGUARD_CONCURRENCY: 2
        run: npm run evalguard:run
```

## Troubleshooting

- **Provider not found**: Ensure you've set the appropriate API key environment variable
- **Model not found**: Check that the model specified in MODEL_NAME is valid for the selected provider
- **Budget exceeded**: Adjust the EVALGUARD_BUDGET_USD environment variable