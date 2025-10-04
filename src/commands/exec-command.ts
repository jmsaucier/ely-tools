#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { CommandDefinition } from '../types';

/**
 * Check if a directory contains a package.json file
 * @param dirPath - Directory path to check
 * @returns True if package.json exists, false otherwise
 */
function hasPackageJson(dirPath: string): boolean {
  return fs.existsSync(path.join(dirPath, 'package.json'));
}

/**
 * Get all subdirectories recursively up to maxDepth
 * @param dirPath - Root directory to scan
 * @param maxDepth - Maximum depth to traverse
 * @param currentDepth - Current depth level
 * @returns Array of directory paths
 */
function getSubdirectories(
  dirPath: string,
  maxDepth: number = 0,
  currentDepth: number = 0,
): string[] {
  if (currentDepth > maxDepth) {
    return [];
  }

  const directories: string[] = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);

      try {
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          // Skip node_modules and other common directories to avoid
          const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build'];
          if (!skipDirs.includes(item)) {
            directories.push(itemPath);
            
            // Recursively get subdirectories
            const subDirs = getSubdirectories(itemPath, maxDepth, currentDepth + 1);
            directories.push(...subDirs);
          }
        }
      } catch (error) {
        // Skip directories we can't access
        continue;
      }
    }
  } catch (error) {
    console.warn(`Warning: Cannot read directory ${dirPath}: ${(error as Error).message}`);
  }

  return directories;
}

/**
 * Execute a command in a directory and return the result
 * @param command - Command to execute
 * @param dirPath - Directory to execute the command in
 * @returns Object with success status, output, and error
 */
function executeCommand(command: string, dirPath: string): {
  success: boolean;
  output: string;
  error?: string;
} {
  try {
    const output = execSync(command, {
      cwd: dirPath,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return {
      success: true,
      output: output.trim(),
    };
  } catch (error) {
    const errorOutput = (error as any).stdout || (error as Error).message;
    return {
      success: false,
      output: errorOutput?.trim() || '',
      error: (error as Error).message,
    };
  }
}

/**
 * Main function to execute command on subdirectories
 * @param options - Options object containing directory, exec command, and maxDepth
 * @returns Returns true if successful, false if error
 */
function execCommand(options: Record<string, any>): boolean {
  const { directory = '.', exec, maxDepth = 2, packageName } = options;

  try {
    if (!fs.existsSync(directory)) {
      console.error(`Error: Directory '${directory}' does not exist`);
      return false;
    }

    if (!fs.statSync(directory).isDirectory()) {
      console.error(`Error: '${directory}' is not a directory`);
      return false;
    }

    const absolutePath = path.resolve(directory);
    console.log(`📂 Scanning directory: ${absolutePath}`);
    console.log(`🔍 Max depth: ${maxDepth}`);
    console.log(`⚡ Command: ${exec}`);
    if (packageName) {
      console.log(`📦 Package: ${packageName}`);
    }
    console.log('');

    const startTime = Date.now();
    const subdirectories = getSubdirectories(absolutePath, maxDepth, 0);
    
    // Filter to only directories with package.json if we're looking for npm packages
    const targetDirectories = packageName 
      ? subdirectories.filter(dir => hasPackageJson(dir))
      : subdirectories;

    console.log(`Found ${targetDirectories.length} directories to process\n`);

    const results: Array<{
      directory: string;
      relativePath: string;
      result: ReturnType<typeof executeCommand>;
    }> = [];

    // Process each directory
    for (const dir of targetDirectories) {
      const relativePath = path.relative(absolutePath, dir);
      console.log(`🔄 Processing: ${relativePath}`);
      
      const result = executeCommand(exec, dir);
      results.push({
        directory: dir,
        relativePath,
        result,
      });
    }

    const endTime = Date.now();

    // Display results
    console.log('\n📊 Results:\n');
    
    let successCount = 0;
    let failureCount = 0;

    results.forEach(({ relativePath, result }) => {
      if (result.success) {
        successCount++;
        console.log(`✅ ${relativePath}`);
        if (result.output) {
          // Indent the output for better readability
          const indentedOutput = result.output
            .split('\n')
            .map(line => `   ${line}`)
            .join('\n');
          console.log(indentedOutput);
        }
      } else {
        failureCount++;
        console.log(`❌ ${relativePath}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        if (result.output) {
          const indentedOutput = result.output
            .split('\n')
            .map(line => `   ${line}`)
            .join('\n');
          console.log(indentedOutput);
        }
      }
      console.log(''); // Empty line for separation
    });

    console.log(`📈 Summary: ${successCount} successful, ${failureCount} failed`);
    console.log(`⏱️  Completed in ${endTime - startTime}ms`);

    return true;
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    return false;
  }
}

export const execCommandDefinition: CommandDefinition = {
  command: 'exec',
  description: 'Execute a command on each subdirectory',
  arguments: [
    {
      name: 'exec',
      description: 'Command to execute on each subdirectory',
      type: 'string',
      required: true,
    },
  ],
  options: [
    {
      name: 'directory',
      description: 'Directory path to scan (default: current directory)',
      type: 'string',
    },
    {
      name: 'maxDepth',
      description: 'Maximum depth to traverse (default: 2)',
      type: 'number',
    },
    {
      name: 'packageName',
      description: 'Filter to only directories with package.json (useful for npm commands)',
      type: 'string',
    },
  ],
  handler: execCommand,
};

// For backward compatibility
export { execCommand };
