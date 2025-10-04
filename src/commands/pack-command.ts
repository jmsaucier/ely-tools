#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { CommandDefinition } from '../types';

/**
 * Remove all .tgz files in the current directory
 * @param directory - Directory to clean
 */
function removeTarballs(directory: string): void {
  try {
    const files = fs.readdirSync(directory);
    const tgzFiles = files.filter(file => file.endsWith('.tgz'));

    if (tgzFiles.length > 0) {
      console.log(`🧹 Removing ${tgzFiles.length} existing .tgz file(s)...`);
      tgzFiles.forEach(file => {
        const filePath = path.join(directory, file);
        fs.unlinkSync(filePath);
        console.log(`   Removed: ${file}`);
      });
    } else {
      console.log('🧹 No existing .tgz files to remove');
    }
  } catch (error) {
    console.warn(
      `Warning: Could not remove .tgz files: ${(error as Error).message}`,
    );
  }
}

/**
 * Execute a command and return the result
 * @param command - Command to execute
 * @param directory - Directory to execute the command in
 * @returns Object with success status and output
 */
function executeCommand(
  command: string,
  directory: string,
): {
  success: boolean;
  output: string;
  error?: string;
} {
  try {
    console.log(`⚡ Running: ${command}`);
    const output = execSync(command, {
      cwd: directory,
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
 * Find the most recently created .tgz file
 * @param directory - Directory to search in
 * @returns Path to the most recent .tgz file or null if none found
 */
function findLatestTarball(directory: string): string | null {
  try {
    const files = fs.readdirSync(directory);
    const tgzFiles = files.filter(file => file.endsWith('.tgz'));

    if (tgzFiles.length === 0) {
      return null;
    }

    // Sort by modification time (most recent first)
    const sortedFiles = tgzFiles.sort((a, b) => {
      const statA = fs.statSync(path.join(directory, a));
      const statB = fs.statSync(path.join(directory, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });

    return path.join(directory, sortedFiles[0]);
  } catch (error) {
    console.error(`Error finding tarball: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Copy text to clipboard (macOS)
 * @param text - Text to copy to clipboard
 * @returns True if successful, false otherwise
 */
function copyToClipboard(text: string): boolean {
  try {
    execSync(`echo "${text}" | pbcopy`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`Error copying to clipboard: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Main function to build, pack, and copy tarball path
 * @param options - Options object containing directory
 * @returns Returns true if successful, false if error
 */
function packCommand(options: Record<string, any>): boolean {
  const { directory = '.' } = options;

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
    console.log(`📦 Building and packing in: ${absolutePath}`);
    console.log('');

    // Step 1: Remove existing .tgz files
    removeTarballs(absolutePath);
    console.log('');

    // Step 2: Build the project
    console.log('🔨 Building project...');
    const buildResult = executeCommand('pnpm run build', absolutePath);
    if (!buildResult.success) {
      console.error('❌ Build failed:');
      console.error(buildResult.error || buildResult.output);
      return false;
    }
    console.log('✅ Build completed');
    console.log('');

    // Step 3: Pack the project
    console.log('📦 Packing project...');
    const packResult = executeCommand('pnpm pack', absolutePath);
    if (!packResult.success) {
      console.error('❌ Pack failed:');
      console.error(packResult.error || packResult.output);
      return false;
    }
    console.log('✅ Pack completed');
    console.log('');

    // Step 4: Find the latest tarball and copy path to clipboard
    console.log('🔍 Finding latest tarball...');
    const tarballPath = findLatestTarball(absolutePath);

    if (!tarballPath) {
      console.error('❌ No .tgz file found after packing');
      return false;
    }

    console.log(`📄 Found tarball: ${path.basename(tarballPath)}`);

    // Copy the full path to clipboard
    const success = copyToClipboard(tarballPath);
    if (success) {
      console.log(`📋 Copied to clipboard: ${tarballPath}`);
    } else {
      console.log(`📄 Tarball path: ${tarballPath}`);
    }

    console.log('');
    console.log('🎉 Pack command completed successfully!');

    return true;
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    return false;
  }
}

export const packCommandDefinition: CommandDefinition = {
  command: 'pack',
  description: 'Build project, create tarball, and copy path to clipboard',
  arguments: [],
  options: [
    {
      name: 'directory',
      description:
        'Directory path to build and pack (default: current directory)',
      type: 'string',
    },
  ],
  handler: packCommand,
};

// For backward compatibility
export { packCommand };
