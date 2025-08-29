# Ely Tools

A collection of useful CLI tools built with TypeScript.

## Features

- **Directory Size Analysis**: Get detailed information about directory sizes with `ds` command
- **TypeScript**: Full TypeScript support with proper type definitions
- **Modern CLI**: Built with Commander.js for a professional command-line experience

## Installation

```bash
npm install
```

## Development

### Prerequisites

- Node.js >= 14.0.0
- npm

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development (recompiles on file changes)
- `npm run clean` - Remove build artifacts
- `npm start` - Run the compiled application
- `npm test` - Run tests (not implemented yet)

## Usage

### Directory Size Analysis

Analyze directory sizes with the `ds` command:

```bash
# Analyze current directory
npm start -- ds

# Analyze specific directory
npm start -- ds /path/to/directory

# Show help
npm start -- help
```

### Global Installation

You can also install the tool globally:

```bash
npm install -g .
ely ds /path/to/directory
```

## Project Structure

```
src/
├── index.ts              # Main CLI entry point
├── get-directory-sizes.ts # Directory size analysis command
└── types.ts              # TypeScript type definitions

dist/                     # Compiled JavaScript output
├── index.js
├── get-directory-sizes.js
└── types.js
```

## TypeScript Configuration

The project uses a strict TypeScript configuration (`tsconfig.json`) with:

- ES2020 target
- CommonJS modules
- Strict type checking
- Source maps and declaration files
- Output directory: `./dist`

## Contributing

1. Make changes in the `src/` directory
2. Run `npm run build` to compile
3. Test your changes with `npm start`
4. Submit a pull request

## License

ISC
