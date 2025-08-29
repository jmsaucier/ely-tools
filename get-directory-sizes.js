#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted size string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get size of a file or directory recursively
 * @param {string} filePath - Path to file or directory
 * @returns {number} Size in bytes
 */
function getSize(filePath) {
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
        `Warning: Cannot read directory ${filePath}: ${error.message}`,
      );
    }
    return totalSize;
  } else {
    return stats.size;
  }
}

/**
 * Recursively list all files and directories with their sizes
 * @param {string} dirPath - Directory path to scan
 * @param {string} prefix - Prefix for indentation
 * @param {number} maxDepth - Maximum depth to traverse (0 = unlimited)
 * @param {number} currentDepth - Current depth level
 * @param {number} topCount - Number of top directories to show
 */
function listDirectoryContents(
  dirPath,
  prefix = '',
  maxDepth = 0,
  currentDepth = 0,
  topCount = 10,
) {
  if (currentDepth > maxDepth) {
    return [];
  }

  const directories = [];

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
        console.warn(`Warning: Cannot access ${itemPath}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}: ${error.message}`);
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
 * @param {string} directory - Directory path to scan
 * @param {number} maxDepth - Maximum depth to traverse (0 = unlimited)
 * @returns {boolean} - Returns true if successful, false if error
 */
function getDirectorySizes({ directory, maxDepth = 2, topCount = 0 }) {
  directory = directory || '.';
  maxDepth = maxDepth || 2;
  topCount = topCount || 10;

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
    console.error(`Error: ${error.message}`);
    return false;
  }
}

module.exports = {
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
