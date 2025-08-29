#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import {
  CommandDefinition,
  DirectoryItem,
  GetDirectorySizesOptions,
} from './types';

/**
 * Format bytes to human readable format
 * @param bytes - Number of bytes
 * @returns Formatted size string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get size of a file or directory recursively
 * @param filePath - Path to file or directory
 * @returns Size in bytes
 */
function getSize(filePath: string): number {
  const stats = fs.statSync(filePath);

  if (stats.isDirectory()) {
    let totalSize = 0;
    try {
      const items = fs.readdirSync(filePath);
      for (const item of items) {
        const itemPath = path.join(filePath, item);
        totalSize += getSize(itemPath);
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn(
        `Warning: Cannot read directory ${filePath}: ${
          (error as Error).message
        }`,
      );
    }
    return totalSize;
  } else {
    return stats.size;
  }
}

/**
 * Recursively list all files and directories with their sizes
 * @param dirPath - Directory path to scan
 * @param prefix - Prefix for indentation
 * @param maxDepth - Maximum depth to traverse (0 = unlimited)
 * @param currentDepth - Current depth level
 * @param topCount - Number of top directories to show
 */
function listDirectoryContents(
  dirPath: string,
  prefix: string = '',
  maxDepth: number = 0,
  currentDepth: number = 0,
  topCount: number = 10,
): DirectoryItem[] {
  if (currentDepth > maxDepth) {
    return [];
  }

  const directories: DirectoryItem[] = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);

      try {
        const stats = fs.statSync(itemPath);
        const isDirectory = stats.isDirectory();

        if (isDirectory) {
          const size = getSize(itemPath);
          const relativePath = path.relative(dirPath, itemPath);

          directories.push({
            name: item,
            path: itemPath,
            relativePath: relativePath,
            size: size,
            depth: currentDepth,
          });

          // Recursively get subdirectories
          const subDirectories = listDirectoryContents(
            itemPath,
            prefix,
            maxDepth,
            currentDepth + 1,
            topCount,
          );

          directories.push(...subDirectories);
        }
      } catch (error) {
        console.warn(
          `Warning: Cannot access ${itemPath}: ${(error as Error).message}`,
        );
      }
    }
  } catch (error) {
    console.error(
      `Error reading directory ${dirPath}: ${(error as Error).message}`,
    );
  }

  // If this is the root call (currentDepth === 0), sort and return top results
  if (currentDepth === 0) {
    // Sort by size (descending)
    directories.sort((a, b) => b.size - a.size);

    // Return top X directories
    const topDirectories = directories.slice(0, topCount);

    // Display results
    console.log(`\n📊 Top ${topCount} directories by size:\n`);

    topDirectories.forEach((dir, index) => {
      const rank = index + 1;
      const sizeStr = formatBytes(dir.size);
      const depthIndicator = '  '.repeat(dir.depth);
      console.log(
        `${rank.toString().padStart(2)}. ${depthIndicator}📁 ${
          dir.name
        } (${sizeStr})`,
      );
    });

    return topDirectories;
  }

  return directories;
}

/**
 * Main function to get directory sizes
 * @param options - Options object containing directory, maxDepth, and topCount
 * @returns Returns true if successful, false if error
 */
function getDirectorySizes(options: GetDirectorySizesOptions): boolean {
  const { directory = '.', maxDepth = 2, topCount = 10 } = options;

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

    console.log('');

    const startTime = Date.now();
    const directories = listDirectoryContents(
      absolutePath,
      '',
      maxDepth,
      0,
      topCount,
    );
    const endTime = Date.now();

    // Calculate total size from the scanned directories
    const totalSize = directories.reduce((sum, dir) => sum + dir.size, 0);
    console.log(`📊 Total directory size: ${formatBytes(totalSize)}`);

    console.log('');
    console.log(`⏱️  Scan completed in ${endTime - startTime}ms`);

    return true;
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    return false;
  }
}

export const getDirectorySizesCommand: CommandDefinition = {
  command: 'ds',
  description: 'Show directory and file sizes',
  arguments: [
    {
      name: 'directory',
      description: 'Directory path to analyze (default: current directory)',
      type: 'string',
      required: false,
    },
  ],
  options: [
    {
      name: 'maxDepth',
      description: 'Maximum depth to traverse',
      type: 'number',
    },
    {
      name: 'topCount',
      description: 'Number of top directories to show',
      type: 'number',
    },
  ],
  handler: getDirectorySizes,
};

// For backward compatibility
export { getDirectorySizes };
