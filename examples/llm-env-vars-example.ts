import { Guard } from "../src";

/**
 * This example demonstrates how to use evalguard with environment variables
 * for LLM configuration. It shows how to create a simple function that uses
 * LLM capabilities and wrap it with evalguard for testing.
 * 
 * Prerequisites:
 * 1. Set up environment variables for your LLM provider:
 *    - For Claude: export ANTHROPIC_API_KEY=your_api_key
 *    - For OpenAI: export OPENAI_API_KEY=your_api_key
 * 
 * Run this example with:
 * ts-node examples/llm-env-vars-example.ts
 */

// A simple function that simulates an LLM-powered summarization
async function summarizeText(text: string, options: any = {}): Promise<string> {
  console.log(`Summarizing text (${text.length} characters)`);
  
  // This is a placeholder function that would normally call an LLM API
  // In a real implementation, this would use the LLM to generate a summary
  const summary = `This is a summary of the provided text (${text.length} characters).
  
The text begins with: "${text.substring(0, 50)}..."

This summary would normally be generated by an LLM using the API key from environment variables.`;
  
  return summary;
}

// Main function
async function main() {
  // Sample texts to summarize
  const texts = [
    "The quick brown fox jumps over the lazy dog. This sentence contains all the letters in the English alphabet.",
    "Machine learning is a field of study that gives computers the ability to learn without being explicitly programmed.",
    "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale."
  ];
  
  // Wrap the summarize function with evalguard
  // The provider will be automatically selected based on available environment variables
  const guardedSummarize = Guard({
    id: "text_summarizer",
    metrics: ["exact", "semantic>=0.92"],
    // No need to specify provider or model - will be determined from env vars
    temperature: 0,
    concurrency: 1
  })(summarizeText);
  
  // Process each text
  for (const text of texts) {
    console.log(`\n--- Testing summarization ---`);
    
    try {
      const result = await guardedSummarize(text, { maxLength: 100 });
      console.log(`Summarization completed successfully.`);
      console.log(`Result length: ${result.length} characters`);
      console.log(`First 100 characters: ${result.substring(0, 100)}...`);
    } catch (error) {
      console.error(`Error in guarded summarization:`, error);
    }
  }
  
  console.log("\nNote: This example uses environment variables for LLM configuration.");
  console.log("The provider (Claude or OpenAI) is automatically selected based on which API key is available.");
}

// Run the main function
main().catch(console.error);