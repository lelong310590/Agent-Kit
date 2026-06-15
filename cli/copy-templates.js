const fs = require('fs-extra');
const path = require('path');

async function copyTemplates() {
  const source = path.resolve(__dirname, '../.agents');
  const destination = path.resolve(__dirname, './templates');

  try {
    // Clear and ensure destination directory exists
    await fs.emptyDir(destination);
    
    // Copy the entire .agents directory into cli/templates
    await fs.copy(source, destination);
    console.log('✅ Templates copied successfully to cli/templates');

    // Sync main README.md to cli/README.md for npm publish registry display
    const readmeSource = path.resolve(__dirname, '../README.md');
    const readmeDestination = path.resolve(__dirname, './README.md');
    await fs.copy(readmeSource, readmeDestination);
    console.log('✅ Main README.md synced to cli/README.md');
  } catch (err) {
    console.error('❌ Error copying templates or README:', err.message);
    process.exit(1);
  }
}

copyTemplates();
