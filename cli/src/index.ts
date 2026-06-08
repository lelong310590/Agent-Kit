#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

const program = new Command();

program
  .name('longln-ag-kit')
  .description('Local CLI tool to initialize AG Tool Kit configurations')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize `.agents/` configuration directory in the current working directory')
  .option('-l, --link', 'Link to a centralized global `.agents` setup instead of copying')
  .action(async (options) => {
    const cwd = process.cwd();
    const targetPath = path.join(cwd, '.agents');

    // Check if .agents already exists
    if (await fs.pathExists(targetPath)) {
      console.error('❌ Error: Directory `.agents` already exists in this folder.');
      process.exit(1);
    }

    if (options.link) {
      // Setup global link
      const globalDir = path.join(os.homedir(), '.ag-kit');
      const globalAgentsPath = path.join(globalDir, '.agents');

      if (!await fs.pathExists(globalAgentsPath)) {
        console.log(`ℹ️ Centralized global directory not found. Creating at: ${globalAgentsPath}`);
        const sourceTemplate = path.resolve(__dirname, '../templates');
        try {
          await fs.copy(sourceTemplate, globalAgentsPath);
          console.log('✅ Initialized global `.agents` template successfully.');
        } catch (copyErr: any) {
          console.error('❌ Failed to copy template to global directory:', copyErr.message);
          process.exit(1);
        }
      }

      console.log(`🔗 Creating symbolic link to: ${globalAgentsPath}`);
      try {
        await fs.ensureSymlink(globalAgentsPath, targetPath, 'junction');
        console.log('✅ Symbolic link created successfully at `.agents`.');
      } catch (symlinkErr: any) {
        console.error('❌ Error creating symbolic link:', symlinkErr.message);
        console.log('\n💡 Tip: On Windows, creating symlinks requires running as Administrator or enabling Developer Mode.');
        console.log('You can run the following command in PowerShell as Administrator manually:');
        console.log(`  New-Item -ItemType SymbolicLink -Path "${targetPath}" -Target "${globalAgentsPath}"`);
        process.exit(1);
      }
    } else {
      // Standard Copy
      const sourceTemplate = path.resolve(__dirname, '../templates');
      console.log(`📦 Copying template from: ${sourceTemplate} to: ${targetPath}`);

      try {
        await fs.copy(sourceTemplate, targetPath);
        console.log('✅ AG Tool Kit `.agents/` initialized successfully in this project.');
        console.log('\n💡 Recommendation: Add `.agents/` to `.git/info/exclude` instead of `.gitignore` to keep AI autocomplete features working!');
      } catch (copyErr: any) {
        console.error('❌ Error copying `.agents` configuration folder:', copyErr.message);
        process.exit(1);
      }
    }
  });

program.parse(process.argv);
