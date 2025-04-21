import { Guard, Runner } from '../src';

/**
 * A simple LLM-powered search function
 * In a real application, this would call an actual LLM API
 */
async function probeSearch(query: string, context: string): Promise<string> {
  console.log(`Searching for "${query}" in context "${context}"`);
  
  // Simulate an LLM response
  return `Here are the results for "${query}" in "${context}":
1. First result
2. Second result
3. Third result`;
}

/**
 * Wrap the function with the Guard decorator
 */
export const guardedSearch = Guard({
  id: "search_cli",
  metrics: ["exact", "semantic>=0.92", "judge>=8"],
  store: "yaml",
  provider: "claude",
  model: "claude-3-haiku-embed",
  judgeModel: "claude-3-sonnet",
  temperature: 0,
  concurrency: 3
})(probeSearch);

/**
 * Example usage
 */
async function main() {
  console.log("=== EvalGuard Basic Example ===");
  
  // Create a runner
  const runner = new Runner({ config: "../.evalguardrc.yaml" });
  
  // First run - this will create a snapshot
  console.log("\n--- First run (creating snapshot) ---");
  const result1 = await guardedSearch("ranking", ".");
  console.log("Result:", result1);
  
  // Test the function - this will compare against the snapshot
  console.log("\n--- Testing against snapshot ---");
  const { pass, results } = await runner.test("search_cli", guardedSearch, "ranking", ".");
  
  console.log(`\nOverall test ${pass ? 'PASSED' : 'FAILED'}`);
  console.log("Detailed results:", JSON.stringify(results, null, 2));
}

// Run the example
main().catch(console.error);