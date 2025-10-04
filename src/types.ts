export interface CommandArgument {
  name: string;
  description: string;
  type?: string;
  required?: boolean;
}

export interface CommandOption {
  name: string;
  description: string;
  type?: string;
}

export interface CommandDefinition {
  command: string;
  description: string;
  arguments: CommandArgument[];
  options?: CommandOption[];
  handler: (options: Record<string, any>) => boolean;
}

export interface DirectoryItem {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  depth: number;
}

export interface GetDirectorySizesOptions {
  directory?: string;
  maxDepth?: number;
  topCount?: number;
}

export interface ExecCommandOptions {
  directory?: string;
  exec: string;
  maxDepth?: number;
  packageName?: string;
}

export interface PackCommandOptions {
  directory?: string;
}
