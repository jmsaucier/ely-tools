#!/usr/bin/env node

const { Command } = require('commander');
const getDirectorySizes = require('./get-directory-sizes');
const commands = [getDirectorySizes];

// Create the main program
const program = new Command();

// Set up program metadata
program
  .name('ely')
  .description('A collection of useful CLI tools')
  .version(require('./package.json').version);

commands.forEach(command => {
  let cliCommand = program
    .command(command.command)
    .description(command.description);

  command.arguments.forEach(arg => {
    cliCommand.argument(arg.name, arg.description);
  });

  cliCommand.action((...args) => {
    let options = args[args.length - 1];
    let argsObject = {};
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
