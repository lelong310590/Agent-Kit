#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import * as readline from 'readline';
import { execSync } from 'child_process';

const program = new Command();

program
  .name('longln-ag-kit')
  .description('Local CLI tool to initialize and manage AG Tool Kit configurations')
  .version('1.4.0');

// Configuration Interface and Constants
interface AgKitConfig {
  version: string;
  link: boolean;
  hooks: boolean;
  exclude: boolean;
  installedSkills: string[];
}

const CONFIG_FILE_NAME = 'ag-kit.config.json';

// Helper to write/update config
async function updateConfig(cwd: string, updates: Partial<AgKitConfig>) {
  const configPath = path.join(cwd, CONFIG_FILE_NAME);
  let currentConfig: AgKitConfig = {
    version: '1.4.0',
    link: false,
    hooks: true,
    exclude: true,
    installedSkills: [],
  };
  
  if (await fs.pathExists(configPath)) {
    try {
      currentConfig = await fs.readJson(configPath);
    } catch (e) {
      // Ignore reading error, overwrite
    }
  }
  
  const newConfig = { ...currentConfig, ...updates };
  await fs.writeJson(configPath, newConfig, { spaces: 2 });
}

// Helper to read config
async function readConfig(cwd: string): Promise<AgKitConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILE_NAME);
  if (await fs.pathExists(configPath)) {
    try {
      return await fs.readJson(configPath);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Helper to prompt for a single line text question
function promptQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Helper to prompt for a selection from a list of options
async function promptSelection(title: string, options: string[]): Promise<number> {
  console.log(`\n=== ${title} ===`);
  options.forEach((opt, idx) => {
    console.log(`  [${idx + 1}] ${opt}`);
  });
  while (true) {
    const ans = await promptQuestion(`Select an option (1-${options.length}): `);
    const num = parseInt(ans, 10);
    if (!isNaN(num) && num >= 1 && num <= options.length) {
      return num - 1; // 0-based index
    }
    console.log(`❌ Invalid choice. Please choose a number between 1 and ${options.length}.`);
  }
}

// Helper to parse YAML frontmatter from markdown content
function parseFrontmatter(content: string): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match) {
    const lines = match[1].split('\n');
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        result[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }
  return result;
}

// Helper to download a single file from GitHub
function downloadFileFromGitHub(skillName: string, fileName: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/longlengoc90/ag-tool-kit/main/.agents/skills/${skillName}/${fileName}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        reject(new Error(`File "${fileName}" not found in skill "${skillName}" on remote repository.`));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download "${fileName}". Status code: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Helper to install Git hooks
async function installGitHooks(cwd: string) {
  const gitDir = path.join(cwd, '.git');
  if (!await fs.pathExists(gitDir)) {
    console.log('ℹ️ Git repository not found. Skipping Git Hooks installation.');
    return;
  }
  const hooksDir = path.join(gitDir, 'hooks');
  await fs.ensureDir(hooksDir);

  const preCommitPath = path.join(hooksDir, 'pre-commit');
  const prePushPath = path.join(hooksDir, 'pre-push');

  const preCommitContent = `#!/bin/sh
# AG Tool Kit: Auto-run checklist validation
if [ -f .agents/scripts/checklist.py ]; then
  echo "🚀 Running AG Tool Kit checklist validation..."
  python .agents/scripts/checklist.py
  if [ $? -ne 0 ]; then
    echo "❌ AG Tool Kit checklist failed. Commit aborted."
    exit 1
  fi
fi
`;

  const prePushContent = `#!/bin/sh
# AG Tool Kit: Auto-run full verification tests
if [ -f .agents/scripts/verify_all.py ]; then
  echo "🚀 Running AG Tool Kit full verification tests..."
  python .agents/scripts/verify_all.py
  if [ $? -ne 0 ]; then
    echo "❌ AG Tool Kit verification failed. Push aborted."
    exit 1
  fi
fi
`;

  await fs.writeFile(preCommitPath, preCommitContent, { mode: 0o755 });
  await fs.writeFile(prePushPath, prePushContent, { mode: 0o755 });
  console.log('✅ Git Hooks (pre-commit, pre-push) installed successfully.');
}

// Helper to auto-fix Git exclude
async function fixGitExclude(cwd: string) {
  const gitDir = path.join(cwd, '.git');
  if (!await fs.pathExists(gitDir)) return;

  const excludePath = path.join(gitDir, 'info', 'exclude');
  await fs.ensureDir(path.dirname(excludePath));

  if (await fs.pathExists(excludePath)) {
    let content = await fs.readFile(excludePath, 'utf8');
    if (!content.includes('.agents/')) {
      content = content.trimEnd() + '\n.agents/\n';
      await fs.writeFile(excludePath, content);
      console.log('🛠 Auto-fixed: Added `.agents/` to `.git/info/exclude`.');
    }
  } else {
    await fs.writeFile(excludePath, '\n.agents/\n');
    console.log('🛠 Auto-fixed: Created `.git/info/exclude` and added `.agents/`.');
  }
}

program
  .command('init')
  .description('Initialize `.agents/` configuration directory in the current working directory')
  .option('-l, --link', 'Link to a centralized global `.agents` setup instead of copying')
  .option('--no-hooks', 'Do not install Git hooks')
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
      } catch (copyErr: any) {
        console.error('❌ Error copying `.agents` configuration folder:', copyErr.message);
        process.exit(1);
      }
    }

    // Install Git Hooks unless --no-hooks is specified
    if (options.hooks) {
      await installGitHooks(cwd);
    }

    // Auto fix Git exclude
    await fixGitExclude(cwd);

    // Create ag-kit.config.json configuration file
    await updateConfig(cwd, {
      version: '1.4.0',
      link: !!options.link,
      hooks: !!options.hooks,
      exclude: true,
      installedSkills: []
    });
    console.log('✅ Configuration file `ag-kit.config.json` created.');

    console.log('\n💡 Recommendation: Keep `.agents/` in `.git/info/exclude` to ensure AI autocomplete works!');
  });

program
  .command('sync')
  .description('Sync `.agents/` configuration with the latest templates (preserves your memory/)')
  .action(async () => {
    const cwd = process.cwd();
    const targetPath = path.join(cwd, '.agents');

    if (!await fs.pathExists(targetPath)) {
      console.error('❌ Error: Directory `.agents` does not exist. Run `init` first.');
      process.exit(1);
    }

    // Check if it's a symlink/junction
    const lstat = await fs.lstat(targetPath);
    if (lstat.isSymbolicLink()) {
      console.log('ℹ️ Directory `.agents` is a symbolic link. It stays in sync with global template automatically.');
      return;
    }

    const sourceTemplate = path.resolve(__dirname, '../templates');
    console.log('🔄 Syncing .agents directory...');

    try {
      const items = await fs.readdir(sourceTemplate);
      for (const item of items) {
        if (item === 'memory') {
          // Skip copying memory directory to preserve local knowledge.
          const localMemoryPath = path.join(targetPath, 'memory');
          if (!await fs.pathExists(localMemoryPath)) {
            await fs.copy(path.join(sourceTemplate, 'memory'), localMemoryPath);
            console.log('📦 Restored missing memory folder.');
          } else {
            console.log('🧠 Preserved existing memory folder.');
          }
          continue;
        }
        await fs.copy(path.join(sourceTemplate, item), path.join(targetPath, item), { overwrite: true });
      }
      console.log('✅ AG Tool Kit `.agents/` synchronized successfully.');
    } catch (err: any) {
      console.error('❌ Sync failed:', err.message);
      process.exit(1);
    }
  });

program
  .command('add-skill [skill]')
  .description('Add a specific skill from local templates or download from remote GitHub repository')
  .action(async (skillNameArg) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');

    if (!await fs.pathExists(targetAgentsPath)) {
      console.error('❌ Error: Directory `.agents` does not exist. Run `init` first.');
      process.exit(1);
    }

    let skillName = skillNameArg;
    if (!skillName) {
      const sourceTemplate = path.resolve(__dirname, '../templates');
      const skillsTemplatePath = path.join(sourceTemplate, 'skills');
      if (await fs.pathExists(skillsTemplatePath)) {
        const skillsList = await fs.readdir(skillsTemplatePath);
        if (skillsList.length === 0) {
          console.error('❌ Error: No available skills found in templates pool.');
          process.exit(1);
        }
        const selectedIdx = await promptSelection('Select a Skill to install', skillsList);
        skillName = skillsList[selectedIdx];
      } else {
        console.error('❌ Error: Templates pool not found. Cannot run wizard.');
        process.exit(1);
      }
    }

    const sourceTemplate = path.resolve(__dirname, '../templates');
    const skillSourcePath = path.join(sourceTemplate, 'skills', skillName);
    const skillTargetPath = path.join(targetAgentsPath, 'skills', skillName);

    if (await fs.pathExists(skillTargetPath)) {
      console.log(`ℹ️ Skill "${skillName}" is already installed in this project.`);
      // Still update config if not present
      const config = await readConfig(cwd);
      if (config) {
        const skills = config.installedSkills || [];
        if (!skills.includes(skillName)) {
          skills.push(skillName);
          await updateConfig(cwd, { installedSkills: skills });
        }
      }
      return;
    }

    // 1. Try local copy
    if (await fs.pathExists(skillSourcePath)) {
      try {
        await fs.copy(skillSourcePath, skillTargetPath);
        console.log(`✅ Skill "${skillName}" added from local templates successfully.`);
        // Update config
        const config = await readConfig(cwd);
        if (config) {
          const skills = config.installedSkills || [];
          if (!skills.includes(skillName)) {
            skills.push(skillName);
            await updateConfig(cwd, { installedSkills: skills });
          }
        }
        return;
      } catch (err: any) {
        console.error('❌ Failed to copy local skill:', err.message);
        process.exit(1);
      }
    }

    // 2. Local fallback failed, attempt Cloud Fetch
    console.log(`🌐 Skill "${skillName}" not found locally. Trying to download from remote GitHub repository...`);
    try {
      // Create destination skill folder
      await fs.ensureDir(skillTargetPath);

      // Download main SKILL.md
      console.log(`📥 Downloading SKILL.md...`);
      const skillMdContent = await downloadFileFromGitHub(skillName, 'SKILL.md');
      await fs.writeFile(path.join(skillTargetPath, 'SKILL.md'), skillMdContent);

      // Parse SKILL.md for referenced sub-markdown files in code blocks or lists (e.g., `rest.md`)
      const matches = [...skillMdContent.matchAll(/`([^`]+\.md)`/g)];
      const subFiles = Array.from(new Set(matches.map(m => m[1]))).filter(f => f !== 'SKILL.md');

      if (subFiles.length > 0) {
        console.log(`📥 Detected ${subFiles.length} sub-documents referenced. Fetching...`);
        for (const file of subFiles) {
          console.log(`   - Downloading ${file}...`);
          try {
            const fileContent = await downloadFileFromGitHub(skillName, file);
            await fs.writeFile(path.join(skillTargetPath, file), fileContent);
          } catch (dlErr: any) {
            console.warn(`   ⚠️ Warning: Could not download sub-document "${file}": ${dlErr.message}`);
          }
        }
      }

      console.log(`✅ Skill "${skillName}" downloaded and installed successfully from remote GitHub.`);
      // Update config
      const config = await readConfig(cwd);
      if (config) {
        const skills = config.installedSkills || [];
        if (!skills.includes(skillName)) {
          skills.push(skillName);
          await updateConfig(cwd, { installedSkills: skills });
        }
      }
    } catch (err: any) {
      console.error(`❌ Cloud Fetch failed: ${err.message}`);
      // Cleanup directory on failure
      try { await fs.remove(skillTargetPath); } catch (e) {}
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all available skills in the template pool and their installation status')
  .action(async () => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    const sourceTemplate = path.resolve(__dirname, '../templates');
    const skillsTemplatePath = path.join(sourceTemplate, 'skills');

    if (!await fs.pathExists(skillsTemplatePath)) {
      console.error('❌ Error: Templates pool not found. Please check your CLI installation.');
      process.exit(1);
    }

    try {
      const skills = await fs.readdir(skillsTemplatePath);
      console.log('--------------------------------------------------------------------------------');
      console.log(`${'SKILL NAME'.padEnd(25)} ${'DESCRIPTION'.padEnd(40)} ${'STATUS'}`);
      console.log('--------------------------------------------------------------------------------');

      for (const skill of skills) {
        const skillPath = path.join(skillsTemplatePath, skill);
        const skillMd = path.join(skillPath, 'SKILL.md');
        let desc = 'No description';

        if (await fs.pathExists(skillMd)) {
          const content = await fs.readFile(skillMd, 'utf-8');
          const frontmatter = parseFrontmatter(content);
          if (frontmatter.description) {
            desc = frontmatter.description;
          }
        }

        if (desc.length > 37) {
          desc = desc.substring(0, 34) + '...';
        }

        const localSkillPath = path.join(targetAgentsPath, 'skills', skill);
        const isInstalled = await fs.pathExists(localSkillPath);
        const status = isInstalled ? '✅ Installed' : '❌ Not Installed';

        console.log(`${skill.padEnd(25)} ${desc.padEnd(40)} ${status}`);
      }
      console.log('--------------------------------------------------------------------------------');
    } catch (err: any) {
      console.error('❌ Error listing skills:', err.message);
      process.exit(1);
    }
  });

program
  .command('create [type] [name]')
  .description('Create a new configuration template (type: agent, skill, workflow)')
  .action(async (typeArg, nameArg) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');

    if (!await fs.pathExists(targetAgentsPath)) {
      console.error('❌ Error: Directory `.agents` does not exist. Run `init` first.');
      process.exit(1);
    }

    let type = typeArg;
    let name = nameArg;

    if (!type) {
      const types = ['agent', 'skill', 'workflow'];
      const idx = await promptSelection('Select component type to create', types);
      type = types[idx];
    }

    if (!name) {
      name = await promptQuestion('Enter component name (alphanumeric and hyphens only): ');
      if (!name) {
        console.error('❌ Error: Component name cannot be empty.');
        process.exit(1);
      }
    }

    // Name validation
    if (!/^[a-zA-Z0-9-]+$/.test(name)) {
      console.error('❌ Error: Component name must only contain alphanumeric characters and hyphens.');
      process.exit(1);
    }

    const nameClean = name.toLowerCase();

    try {
      if (type === 'agent') {
        const filePath = path.join(targetAgentsPath, 'agent', `${nameClean}.md`);
        if (await fs.pathExists(filePath)) {
          console.error(`❌ Error: Agent "${nameClean}" already exists.`);
          process.exit(1);
        }
        const template = `---
name: ${nameClean}
description: Specialist agent role description and triggers.
tools: Read, Grep, Glob, Command, Write
model: inherit
skills: clean-code
---

# Agent Persona: ${name} ( Specialist )

Explain the agent's core philosophy, responsibilities, and specific expertise here.
`;
        await fs.writeFile(filePath, template);
        console.log(`✅ Created new Agent persona at: .agents/agent/${nameClean}.md`);
      } 
      else if (type === 'skill') {
        const folderPath = path.join(targetAgentsPath, 'skills', nameClean);
        const filePath = path.join(folderPath, 'SKILL.md');
        if (await fs.pathExists(filePath)) {
          console.error(`❌ Error: Skill "${nameClean}" already exists.`);
          process.exit(1);
        }
        await fs.ensureDir(folderPath);
        const template = `---
name: ${nameClean}
description: Summary of the technology skill capabilities.
when_to_use: Describe the triggers (e.g. package.json, config files) when this skill should load.
allowed-tools: Read, Write
---

# Skill: ${name}

Write detailed code guidelines, library references, naming conventions, and best practices here.
`;
        await fs.writeFile(filePath, template);
        console.log(`✅ Created new Skill structure at: .agents/skills/${nameClean}/SKILL.md`);
      } 
      else if (type === 'workflow') {
        const filePath = path.join(targetAgentsPath, 'workflows', `${nameClean}.md`);
        if (await fs.pathExists(filePath)) {
          console.error(`❌ Error: Workflow "${nameClean}" already exists.`);
          process.exit(1);
        }
        const template = `---
description: Workflow command execution steps description.
---

# Workflow Command: /${nameClean}

Define interactive steps, commands, and checklists for the developer and AI agent here.
`;
        await fs.writeFile(filePath, template);
        console.log(`✅ Created new Workflow at: .agents/workflows/${nameClean}.md`);
      } 
      else {
        console.error('❌ Error: Invalid type. Supported types are: agent, skill, workflow');
        process.exit(1);
      }
    } catch (err: any) {
      console.error(`❌ Failed to create component: ${err.message}`);
      process.exit(1);
    }
  });

// Setup memory command group
const memoryCmd = program.command('memory').description('Manage project persistent memory');

memoryCmd
  .command('add <content>')
  .description('Add a new learning or gotcha to project persistent memory')
  .option('-g, --global', 'Save to global memory hub instead of current project local memory')
  .action(async (content, options) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    
    let memoryFilePath = '';
    if (options.global) {
      const globalDir = path.join(os.homedir(), '.ag-kit', 'memory');
      await fs.ensureDir(globalDir);
      memoryFilePath = path.join(globalDir, 'learnings-gotchas.md');
    } else {
      if (!await fs.pathExists(targetAgentsPath)) {
        console.error('❌ Error: Directory `.agents` does not exist. Run `init` first.');
        process.exit(1);
      }
      const memoryDir = path.join(targetAgentsPath, 'memory');
      await fs.ensureDir(memoryDir);
      memoryFilePath = path.join(memoryDir, 'learnings-gotchas.md');
    }

    try {
      let fileContent = '';
      if (await fs.pathExists(memoryFilePath)) {
        fileContent = await fs.readFile(memoryFilePath, 'utf-8');
      } else {
        fileContent = `# Learnings & Gotchas\n\nThis file collects critical lessons, bugs resolved, and convention overrides.\n\n`;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      fileContent = fileContent.trimEnd() + `\n- [${dateStr}] ${content}\n`;
      await fs.writeFile(memoryFilePath, fileContent);
      console.log(`✅ Successfully added knowledge to: ${options.global ? 'Global Memory Hub' : 'Project Local Memory'}`);
    } catch (err: any) {
      console.error('❌ Failed to add to memory:', err.message);
      process.exit(1);
    }
  });

memoryCmd
  .command('search <query>')
  .description('Query persistent memory files for key lessons or conventions')
  .action(async (query) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    const localMemoryDir = path.join(targetAgentsPath, 'memory');
    const globalMemoryDir = path.join(os.homedir(), '.ag-kit', 'memory');

    console.log(`🔍 Searching memory archives for "${query}"...\n`);
    const searchFolder = async (dirPath: string, scopeName: string) => {
      if (!await fs.pathExists(dirPath)) return;
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            console.log(`[${scopeName}] ${file}:${idx + 1} -> ${line.trim()}`);
          }
        });
      }
    };

    await searchFolder(localMemoryDir, 'Project Local');
    await searchFolder(globalMemoryDir, 'Global Hub');
    console.log('\nSearch complete.');
  });

program
  .command('doctor')
  .description('Audit the health and configuration of AG Tool Kit in this project')
  .option('-f, --fix', 'Auto-fix minor issues found (hooks and Git exclude)')
  .action(async (options) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    const gitPath = path.join(cwd, '.git');

    console.log('🔍 Auditing AG Tool Kit environment...\n');

    // 1. Check .agents directory
    if (!await fs.pathExists(targetAgentsPath)) {
      console.log('❌ Directory `.agents` is missing.');
      console.log('👉 Fix: Run `longln-ag-kit init` to initialize the toolkit.');
      process.exit(1);
    } else {
      const lstat = await fs.lstat(targetAgentsPath);
      if (lstat.isSymbolicLink()) {
        console.log('✅ Directory `.agents` is linked globally (Symbolic Link).');
      } else {
        console.log('✅ Directory `.agents` is copied locally.');
      }
    }

    // 2. Check Git Repo
    if (!await fs.pathExists(gitPath)) {
      console.log('⚠️ Git repository not found. Git Hooks and Git exclude audit skipped.');
    } else {
      console.log('✅ Git repository detected.');

      // 3. Check Git Hooks
      const hooksPath = path.join(gitPath, 'hooks');
      const preCommit = path.join(hooksPath, 'pre-commit');
      const prePush = path.join(hooksPath, 'pre-push');

      const hasPreCommit = await fs.pathExists(preCommit);
      const hasPrePush = await fs.pathExists(prePush);

      if (hasPreCommit && hasPrePush) {
        console.log('✅ Git hooks (pre-commit, pre-push) are installed.');
      } else {
        console.log('⚠️ Git hooks are missing or incomplete.');
        if (options.fix) {
          await installGitHooks(cwd);
        } else {
          console.log('👉 Fix: Run `longln-ag-kit doctor --fix` to install them.');
        }
      }

      // 4. Check Git info/exclude
      const excludePath = path.join(gitPath, 'info', 'exclude');
      let isExcluded = false;
      if (await fs.pathExists(excludePath)) {
        const excludeContent = await fs.readFile(excludePath, 'utf8');
        if (excludeContent.includes('.agents/')) {
          isExcluded = true;
          console.log('✅ `.agents/` is excluded locally in Git (`.git/info/exclude`).');
        }
      }

      if (!isExcluded) {
        console.log('⚠️ `.agents/` is NOT excluded in `.git/info/exclude`. It might be tracked by Git.');
        if (options.fix) {
          await fixGitExclude(cwd);
        } else {
          console.log('👉 Fix: Run `longln-ag-kit doctor --fix` to exclude it automatically.');
        }
      }
    }

    // 5. Check Memory system
    const memoryDir = path.join(targetAgentsPath, 'memory');
    const requiredMemoryFiles = ['MEMORY.md', 'architectural-decisions.md', 'learnings-gotchas.md', 'project-conventions.md'];
    let memoryOk = true;
    if (await fs.pathExists(memoryDir)) {
      for (const f of requiredMemoryFiles) {
        if (!await fs.pathExists(path.join(memoryDir, f))) {
          memoryOk = false;
          console.log(`⚠️ Missing memory file: memory/${f}`);
        }
      }
    } else {
      memoryOk = false;
      console.log('⚠️ Memory directory is missing.');
    }

    if (memoryOk) {
      console.log('✅ Persistent memory system is fully configured.');
    } else {
      console.log('👉 Fix: Run `longln-ag-kit sync` to restore missing memory templates safely.');
    }

    // 6. Check Config File
    const configPath = path.join(cwd, CONFIG_FILE_NAME);
    if (await fs.pathExists(configPath)) {
      try {
        const config = await fs.readJson(configPath);
        console.log(`✅ Configuration file \`${CONFIG_FILE_NAME}\` is present (v${config.version}).`);
      } catch (e: any) {
        console.log(`⚠️ Configuration file \`${CONFIG_FILE_NAME}\` is corrupted: ${e.message}`);
        if (options.fix) {
          await updateConfig(cwd, { version: '1.4.0' });
          console.log(`🛠 Auto-fixed: Re-created a clean \`${CONFIG_FILE_NAME}\`.`);
        } else {
          console.log(`👉 Fix: Run \`longln-ag-kit doctor --fix\` to re-create a clean config.`);
        }
      }
    } else {
      console.log(`⚠️ Configuration file \`${CONFIG_FILE_NAME}\` is missing.`);
      if (options.fix) {
        const isSymlink = (await fs.lstat(targetAgentsPath)).isSymbolicLink();
        await updateConfig(cwd, {
          version: '1.4.0',
          link: isSymlink,
          hooks: await fs.pathExists(path.join(cwd, '.git', 'hooks', 'pre-commit')),
          exclude: true,
          installedSkills: []
        });
        console.log(`🛠 Auto-fixed: Created \`${CONFIG_FILE_NAME}\` based on existing setup.`);
      } else {
        console.log(`👉 Fix: Run \`longln-ag-kit doctor --fix\` to create it automatically.`);
      }
    }

    console.log('\nAudit complete.');
  });

// Helper to get git info
function getGitInfo(cwd: string): { branch: string; commit: string } {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const commit = execSync('git rev-parse HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    return { branch, commit };
  } catch (e) {
    return { branch: 'unknown', commit: 'unknown' };
  }
}

// Setup snapshot command group
const snapshotCmd = program.command('snapshot').description('Manage workspace state snapshots (progress and memory)');

snapshotCmd
  .command('save [name]')
  .description('Save current workspace progress snapshot')
  .option('-d, --desc <text>', 'Description/notes for this snapshot', '')
  .action(async (nameArg, options) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    
    if (!await fs.pathExists(targetAgentsPath)) {
      console.error('❌ Error: Directory `.agents` does not exist. Run `init` first.');
      process.exit(1);
    }
    
    const gitInfo = getGitInfo(cwd);
    const timeStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    let snapName = nameArg;
    if (!snapName) {
      const branchSanitized = gitInfo.branch.replace(/[^a-zA-Z0-9-]/g, '_');
      snapName = `snapshot_${timeStr}_${branchSanitized}`;
    }
    
    const snapshotsDir = path.join(targetAgentsPath, 'snapshots');
    const destSnapDir = path.join(snapshotsDir, snapName);
    
    if (await fs.pathExists(destSnapDir)) {
      console.error(`❌ Error: Snapshot "${snapName}" already exists.`);
      process.exit(1);
    }
    
    console.log(`📸 Creating snapshot: ${snapName}...`);
    await fs.ensureDir(destSnapDir);
    
    const copiedFiles: string[] = [];
    
    // 1. Copy .agents/memory/
    const localMemoryDir = path.join(targetAgentsPath, 'memory');
    if (await fs.pathExists(localMemoryDir)) {
      const destMemory = path.join(destSnapDir, '.agents', 'memory');
      await fs.copy(localMemoryDir, destMemory);
      copiedFiles.push('.agents/memory/');
    }
    
    // 2. Copy root files: task.md, implementation_plan.md, walkthrough.md
    const rootFiles = ['task.md', 'implementation_plan.md', 'walkthrough.md'];
    for (const f of rootFiles) {
      const srcFile = path.join(cwd, f);
      if (await fs.pathExists(srcFile)) {
        await fs.copy(srcFile, path.join(destSnapDir, f));
        copiedFiles.push(f);
      }
    }
    
    // 3. Write metadata.json
    const metadata = {
      name: snapName,
      createdAt: new Date().toISOString(),
      git: gitInfo,
      description: options.desc,
      files: copiedFiles
    };
    
    await fs.writeJson(path.join(destSnapDir, 'metadata.json'), metadata, { spaces: 2 });
    console.log(`✅ Snapshot "${snapName}" saved successfully.`);
  });

snapshotCmd
  .command('list')
  .description('List all available snapshots')
  .action(async () => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    const snapshotsDir = path.join(targetAgentsPath, 'snapshots');
    
    if (!await fs.pathExists(snapshotsDir)) {
      console.log('ℹ️ No snapshots found (snapshots directory does not exist).');
      return;
    }
    
    try {
      const dirs = await fs.readdir(snapshotsDir);
      const snapsInfo = [];
      
      for (const dir of dirs) {
        const metaPath = path.join(snapshotsDir, dir, 'metadata.json');
        if (await fs.pathExists(metaPath)) {
          try {
            const meta = await fs.readJson(metaPath);
            snapsInfo.push(meta);
          } catch (e) {
            // corrupt metadata, skip
          }
        }
      }
      
      if (snapsInfo.length === 0) {
        console.log('ℹ️ No valid snapshots found.');
        return;
      }
      
      // Sort by date descending
      snapsInfo.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log('--------------------------------------------------------------------------------');
      console.log(`${'SNAPSHOT NAME'.padEnd(30)} ${'CREATED AT'.padEnd(20)} ${'BRANCH'.padEnd(15)} ${'DESCRIPTION'}`);
      console.log('--------------------------------------------------------------------------------');
      for (const info of snapsInfo) {
        const dateStr = new Date(info.createdAt).toLocaleString();
        let desc = info.description || '';
        if (desc.length > 25) desc = desc.substring(0, 22) + '...';
        const branchStr = info.git?.branch || 'unknown';
        console.log(`${info.name.padEnd(30)} ${dateStr.padEnd(20)} ${branchStr.padEnd(15)} ${desc}`);
      }
      console.log('--------------------------------------------------------------------------------');
    } catch (err: any) {
      console.error('❌ Failed to list snapshots:', err.message);
    }
  });

snapshotCmd
  .command('restore <name>')
  .description('Restore workspace progress from a snapshot')
  .action(async (name) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    const snapDir = path.join(targetAgentsPath, 'snapshots', name);
    const metaPath = path.join(snapDir, 'metadata.json');
    
    if (!await fs.pathExists(snapDir) || !await fs.pathExists(metaPath)) {
      console.error(`❌ Error: Snapshot "${name}" does not exist or is corrupted.`);
      process.exit(1);
    }
    
    console.log(`🔄 Restoring snapshot "${name}"...`);
    const meta = await fs.readJson(metaPath);
    const filesToRestore = [...(meta.files || [])];
    
    // 1. Create a safe backup before restoring
    const backupDir = path.join(targetAgentsPath, 'snapshots', 'auto_backup_before_restore');
    await fs.remove(backupDir); // clear old backup
    await fs.ensureDir(backupDir);
    
    console.log('📦 Creating safety backup of current state at `.agents/snapshots/auto_backup_before_restore`...');
    
    const localMemoryDir = path.join(targetAgentsPath, 'memory');
    if (await fs.pathExists(localMemoryDir)) {
      await fs.copy(localMemoryDir, path.join(backupDir, '.agents', 'memory'));
    }
    const rootFiles = ['task.md', 'implementation_plan.md', 'walkthrough.md'];
    for (const f of rootFiles) {
      const srcFile = path.join(cwd, f);
      if (await fs.pathExists(srcFile)) {
        await fs.copy(srcFile, path.join(backupDir, f));
      }
    }
    
    // 2. Ask user before overwriting files at root
    const rootFilesToRestore = filesToRestore.filter((f: string) => !f.includes('/') && !f.includes('\\'));
    for (const f of rootFilesToRestore) {
      const targetPath = path.join(cwd, f);
      if (await fs.pathExists(targetPath)) {
        const answer = await promptQuestion(`⚠️ File "${f}" already exists in project root. Overwrite? (y/N): `);
        if (answer.toLowerCase() !== 'y') {
          console.log(`⏭️ Skipped restoring file "${f}".`);
          // Remove from list so it doesn't get copied
          const idx = filesToRestore.indexOf(f);
          if (idx !== -1) filesToRestore.splice(idx, 1);
        }
      }
    }
    
    // 3. Restore files
    for (const f of filesToRestore) {
      if (f === '.agents/memory/') {
        const srcMemory = path.join(snapDir, '.agents', 'memory');
        if (await fs.pathExists(srcMemory)) {
          await fs.copy(srcMemory, localMemoryDir, { overwrite: true });
          console.log(`✅ Restored memory/ directory.`);
        }
      } else {
        const srcFile = path.join(snapDir, f);
        const destFile = path.join(cwd, f);
        if (await fs.pathExists(srcFile)) {
          await fs.copy(srcFile, destFile, { overwrite: true });
          console.log(`✅ Restored "${f}".`);
        }
      }
    }
    console.log(`🎉 Snapshot "${name}" restored successfully.`);
  });

snapshotCmd
  .command('delete <name>')
  .description('Delete a workspace snapshot')
  .action(async (name) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    const snapDir = path.join(targetAgentsPath, 'snapshots', name);
    
    if (!await fs.pathExists(snapDir)) {
      console.error(`❌ Error: Snapshot "${name}" does not exist.`);
      process.exit(1);
    }
    
    console.log(`🗑 Deleting snapshot "${name}"...`);
    await fs.remove(snapDir);
    console.log(`✅ Snapshot "${name}" deleted successfully.`);
  });

// Setup memory export/import subcommands
memoryCmd
  .command('export [output-file]')
  .description('Export project memory and settings to a JSON file')
  .option('--include-agents', 'Include custom agent configurations (.agents/agent/)')
  .option('--include-skills', 'Include custom skill guides (.agents/skills/)')
  .action(async (outputFileArg, options) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    const memoryDir = path.join(targetAgentsPath, 'memory');
    
    if (!await fs.pathExists(targetAgentsPath) || !await fs.pathExists(memoryDir)) {
      console.error('❌ Error: Directory `.agents/memory` does not exist. Run `init` first.');
      process.exit(1);
    }
    
    const exportFile = outputFileArg || 'ag-memory-export.json';
    const exportPath = path.resolve(cwd, exportFile);
    
    console.log(`📦 Exporting memory to ${exportFile}...`);
    
    const payload: any = {
      exportedAt: new Date().toISOString(),
      projectName: path.basename(cwd),
      memory: {}
    };
    
    // Read Memory files
    const memoryFiles = await fs.readdir(memoryDir);
    for (const f of memoryFiles) {
      const filePath = path.join(memoryDir, f);
      if ((await fs.stat(filePath)).isFile() && f.endsWith('.md')) {
        payload.memory[f] = await fs.readFile(filePath, 'utf-8');
      }
    }
    
    // Read Agents if specified
    if (options.includeAgents) {
      const agentDir = path.join(targetAgentsPath, 'agent');
      if (await fs.pathExists(agentDir)) {
        payload.agents = {};
        const agentFiles = await fs.readdir(agentDir);
        for (const f of agentFiles) {
          const filePath = path.join(agentDir, f);
          if ((await fs.stat(filePath)).isFile() && f.endsWith('.md')) {
            payload.agents[f] = await fs.readFile(filePath, 'utf-8');
          }
        }
      }
    }
    
    // Read Skills if specified
    if (options.includeSkills) {
      const skillsDir = path.join(targetAgentsPath, 'skills');
      if (await fs.pathExists(skillsDir)) {
        payload.skills = {};
        const skillFolders = await fs.readdir(skillsDir);
        for (const folder of skillFolders) {
          const folderPath = path.join(skillsDir, folder);
          if ((await fs.stat(folderPath)).isDirectory()) {
            const files = await fs.readdir(folderPath);
            for (const f of files) {
              const filePath = path.join(folderPath, f);
              if ((await fs.stat(filePath)).isFile() && f.endsWith('.md')) {
                const relPath = `${folder}/${f}`;
                payload.skills[relPath] = await fs.readFile(filePath, 'utf-8');
              }
            }
          }
        }
      }
    }
    
    await fs.writeJson(exportPath, payload, { spaces: 2 });
    console.log(`✅ Successfully exported to ${exportPath}`);
  });

memoryCmd
  .command('import <file-path>')
  .description('Import memory and configurations from a JSON export file')
  .option('-o, --overwrite', 'Overwrite existing files completely')
  .option('-m, --merge', 'Merge bullet points for markdown lists, overwrite others', true)
  .action(async (filePathArg, options) => {
    const cwd = process.cwd();
    const targetAgentsPath = path.join(cwd, '.agents');
    const memoryDir = path.join(targetAgentsPath, 'memory');
    
    if (!await fs.pathExists(targetAgentsPath)) {
      console.error('❌ Error: Directory `.agents` does not exist. Run `init` first.');
      process.exit(1);
    }
    
    const importPath = path.resolve(cwd, filePathArg);
    if (!await fs.pathExists(importPath)) {
      console.error(`❌ Error: Import file not found at ${importPath}`);
      process.exit(1);
    }
    
    console.log(`📥 Importing data from ${importPath}...`);
    let data: any;
    try {
      data = await fs.readJson(importPath);
    } catch (e: any) {
      console.error(`❌ Failed to parse JSON export: ${e.message}`);
      process.exit(1);
    }
    
    await fs.ensureDir(memoryDir);
    
    // Helper to merge lists
    const mergeMarkdownLists = (current: string, imported: string): string => {
      const currentLines = current.split('\n');
      const importedLines = imported.split('\n');
      const mergedLines = [...currentLines];
      
      for (const line of importedLines) {
        const trimmed = line.trim();
        // Check if it's a list item line
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          // Check if this line already exists in current file
          const exists = currentLines.some(l => l.trim() === trimmed);
          if (!exists) {
            mergedLines.push(line);
          }
        }
      }
      return mergedLines.join('\n');
    };
    
    // 1. Import Memory
    if (data.memory) {
      for (const f of Object.keys(data.memory)) {
        const targetFile = path.join(memoryDir, f);
        const importedContent = data.memory[f];
        
        if (options.overwrite || !await fs.pathExists(targetFile)) {
          await fs.writeFile(targetFile, importedContent);
          console.log(`✅ Imported memory file: ${f} (overwritten/created)`);
        } else {
          // Merge mode (default)
          const currentContent = await fs.readFile(targetFile, 'utf-8');
          const merged = mergeMarkdownLists(currentContent, importedContent);
          await fs.writeFile(targetFile, merged);
          console.log(`✅ Merged memory file: ${f}`);
        }
      }
    }
    
    // 2. Import Agents
    if (data.agents) {
      const agentDir = path.join(targetAgentsPath, 'agent');
      await fs.ensureDir(agentDir);
      for (const f of Object.keys(data.agents)) {
        const targetFile = path.join(agentDir, f);
        await fs.writeFile(targetFile, data.agents[f]);
        console.log(`✅ Imported agent: ${f}`);
      }
    }
    
    // 3. Import Skills
    if (data.skills) {
      const skillsDir = path.join(targetAgentsPath, 'skills');
      for (const relPath of Object.keys(data.skills)) {
        const targetFile = path.join(skillsDir, relPath);
        await fs.ensureDir(path.dirname(targetFile));
        await fs.writeFile(targetFile, data.skills[relPath]);
        console.log(`✅ Imported skill file: ${relPath}`);
      }
    }
    
    console.log(`🎉 Import completed successfully.`);
  });

program
  .command('upgrade')
  .description('Check for the latest version of @longlengoc90/ag-kit on npm registry and prompt to upgrade')
  .action(async () => {
    console.log('🔍 Checking npm registry for updates...');
    const url = 'https://registry.npmjs.org/@longlengoc90/ag-kit/latest';
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`❌ Failed to fetch registry info. Status code: ${res.statusCode}`);
        process.exit(1);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const info = JSON.parse(data);
          const latestVersion = info.version;
          const currentVersion = '1.4.0';
          
          console.log(`Current version: ${currentVersion}`);
          console.log(`Latest version:  ${latestVersion}`);
          
          const isNewer = (latest: string, current: string): boolean => {
            const latestParts = latest.split('.').map(Number);
            const currentParts = current.split('.').map(Number);
            for (let i = 0; i < 3; i++) {
              if (latestParts[i] > currentParts[i]) return true;
              if (latestParts[i] < currentParts[i]) return false;
            }
            return false;
          };

          if (isNewer(latestVersion, currentVersion)) {
            console.log('\n🚀 A new version is available!');
            console.log(`👉 Run this command to upgrade:`);
            console.log(`   npm install -g @longlengoc90/ag-kit`);
          } else {
            console.log('\n✅ You are already running the latest version (or a newer development version).');
          }
        } catch (e: any) {
          console.error('❌ Failed to parse registry response:', e.message);
        }
      });
    }).on('error', (err) => {
      console.error('❌ Network error while checking for updates:', err.message);
    });
  });

program.parse(process.argv);
