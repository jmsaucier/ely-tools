# ely-tools

A collection of useful CLI tools for developers.

## Installation

### Global Installation (Recommended)

```bash
npm install -g .
```

This will make the `ely` command available globally on your system.

### Local Development

```bash
npm install
npm link
```

## Usage

### Main CLI

```bash
ely <command> [options]
```

### Available Commands

#### Directory Sizes

Analyze and display directory and file sizes in a tree-like format.

```bash
ely dir-sizes <directory> [max-depth]
```

**Arguments:**
- `directory` - Path to the directory to scan
- `max-depth` - Maximum depth to traverse (optional, 0 = unlimited)

**Examples:**
```bash
# Scan current directory
ely dir-sizes .

# Scan specific directory with depth limit
ely dir-sizes ./src 3

# Scan backend directory
ely dir-sizes ./backend
```

**Output:**
```
📂 Scanning directory: /path/to/directory
🔍 Max depth: unlimited

├── 📁 src (1.2 MB)
│   ├── 📄 index.js (2.1 KB)
│   └── 📁 components (856 KB)
│       ├── 📄 Header.js (15.2 KB)
│       └── 📄 Footer.js (8.7 KB)
└── 📄 package.json (1.1 KB)

⏱️  Scan completed in 45ms
```

### Direct Tool Access

You can also run individual tools directly:

```bash
# Using the main CLI
ely dir-sizes ./src

# Using the direct command
ely-dir-sizes ./src

# Using npm scripts
npm run dir-sizes ./src
```

### Help and Version

```bash
# Show help
ely help

# Show version
ely version
```

## Development

### Project Structure

```
ely-tools/
├── index.js                 # Main CLI entry point
├── get-directory-sizes.js   # Directory sizes tool
├── package.json            # Package configuration
└── README.md              # This file
```

### Adding New Tools

1. Create a new tool file (e.g., `new-tool.js`)
2. Add the shebang line: `#!/usr/bin/env node`
3. Update `package.json` to include the new tool in the `bin` field
4. Add the tool to the main CLI in `index.js`
5. Update this README with usage instructions

### Testing

```bash
# Test the main CLI
ely help

# Test directory sizes tool
ely dir-sizes .

# Test direct access
ely-dir-sizes .
```

## License

ISC 