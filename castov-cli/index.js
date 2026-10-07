#!/usr/bin/env node
import { Command } from 'commander';
import crypto from 'crypto';
import chalk from 'chalk';

const program = new Command();

program
  .name('castov')
  .description('Castov Developer Tools - The Zero-Server toolkit right in your terminal.')
  .version('1.0.0');

// UUID Generator
program
  .command('uuid')
  .description('Generate a random UUID v4')
  .action(() => {
    const uuid = crypto.randomUUID();
    console.log(chalk.green('✔ Generated UUID:'));
    console.log(chalk.bold.cyan(uuid));
  });

// Base64 Encode
program
  .command('encode <text>')
  .description('Encode text to Base64')
  .action((text) => {
    const encoded = Buffer.from(text).toString('base64');
    console.log(chalk.green('✔ Base64 Encoded:'));
    console.log(chalk.bold.cyan(encoded));
  });

// Base64 Decode
program
  .command('decode <base64>')
  .description('Decode Base64 to text')
  .action((base64) => {
    try {
      const decoded = Buffer.from(base64, 'base64').toString('utf8');
      console.log(chalk.green('✔ Decoded Text:'));
      console.log(chalk.bold.cyan(decoded));
    } catch (e) {
      console.log(chalk.red('✖ Error: Invalid Base64 string.'));
    }
  });

// Hash Generator
program
  .command('hash <algorithm> <text>')
  .description('Generate a hash (e.g., md5, sha256) for a given text')
  .action((algorithm, text) => {
    try {
      const hash = crypto.createHash(algorithm).update(text).digest('hex');
      console.log(chalk.green(`✔ ${algorithm.toUpperCase()} Hash:`));
      console.log(chalk.bold.cyan(hash));
    } catch (e) {
      console.log(chalk.red(`✖ Error: Unsupported algorithm '${algorithm}'. Try md5 or sha256.`));
    }
  });

program.parse();
