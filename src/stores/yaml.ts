import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { SnapshotStore, Answer, Prompt } from '../core/types';

/**
 * YAML snapshot store
 * 
 * Stores snapshots in YAML files in a directory structure.
 */
export const yamlStore: SnapshotStore = {
  name: 'yaml',
  
  private: {
    baseDir: '.evalguard/snapshots'
  },
  
  async init(opts: Record<string, unknown>): Promise<void> {
    // Get the base directory from options
    if (opts.dir) {
      this.private.baseDir = opts.dir as string;
    }
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(this.private.baseDir)) {
      fs.mkdirSync(this.private.baseDir, { recursive: true });
    }
  },
  
  async save(id: string, prompt: Prompt, answer: Answer): Promise<void> {
    // Create a hash of the prompt to use as the filename
    const promptHash = createHash(prompt);
    
    // Create the directory for this ID if it doesn't exist
    const idDir = path.join(this.private.baseDir, id);
    if (!fs.existsSync(idDir)) {
      fs.mkdirSync(idDir, { recursive: true });
    }
    
    // Create the snapshot data
    const snapshot = {
      id,
      prompt,
      answer,
      timestamp: new Date().toISOString()
    };
    
    // Save the snapshot to a YAML file
    const filePath = path.join(idDir, `${promptHash}.yaml`);
    fs.writeFileSync(filePath, yaml.dump(snapshot));
    
    console.log(`Saved snapshot for ${id} to ${filePath}`);
  },
  
  async load(id: string, prompt: Prompt): Promise<Answer | null> {
    // Create a hash of the prompt to use as the filename
    const promptHash = createHash(prompt);
    
    // Check if the file exists
    const filePath = path.join(this.private.baseDir, id, `${promptHash}.yaml`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    try {
      // Load the snapshot from the YAML file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const snapshot = yaml.load(fileContent) as { answer: Answer };
      
      return snapshot.answer;
    } catch (error) {
      console.error(`Error loading snapshot from ${filePath}:`, error);
      return null;
    }
  }
};

/**
 * Create a simple hash of a string
 */
function createHash(str: string): string {
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to a hex string and ensure it's positive
  return Math.abs(hash).toString(16);
}