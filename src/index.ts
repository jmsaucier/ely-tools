#!/usr/bin/env node

import { Command } from 'commander';
import { getDirectorySizesCommand } from './commands/get-directory-sizes';
import { execCommandDefinition } from './commands/exec-command';
import { packCommandDefinition } from './commands/pack-command';
import { CommandDefinition } from './types';

const commands: CommandDefinition[] = [
  getDirectorySizesCommand,
  execCommandDefinition,
  packCommandDefinition,
];

// Create the main program
const program = new Command();

// Set up program metadata
program
  .name('ely')
  .description('A collection of useful CLI tools')
  .version(require('../package.json').version);

commands.forEach(command => {
  let cliCommand = program
    .command(command.command)
    .description(command.description);

  command.arguments.forEach(arg => {
    cliCommand.argument(arg.name, arg.description);
  });

  // Add options
  if (command.options) {
    command.options.forEach(option => {
      cliCommand.option(`--${option.name}`, option.description);
    });
  }

  cliCommand.action((...args: any[]) => {
    let options = args[args.length - 1];
    let argsObject: Record<string, any> = {};
    command.arguments.forEach((arg, index) => {
      argsObject[arg.name] = args[index];
    });
    command.handler({
      ...argsObject,
      ...options,
    });
  });
});

// Register the help command (Commander handles this automatically, but we can customize)
program
  .command('help')
  .description('Show help information')
  .action(() => {
    program.help();
  });

// Parse command line arguments
program.parse();
