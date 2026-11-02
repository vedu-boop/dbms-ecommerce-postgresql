// ============================================================================
// Direct GitHub Uploader (No local Git required)
// Uses GitHub REST API to create repository and upload all project files
// Usage: node push-to-github.js <GITHUB_TOKEN> [REPO_NAME]
// ============================================================================

const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.argv[2];
const repoName = process.argv[3] || 'dbms-ecommerce-postgresql';

if (!token) {
  console.log('Usage: node push-to-github.js <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN> [REPO_NAME]');
  process.exit(1);
}

function ghRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`);
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'User-Agent': 'DBMS-Ecommerce-Deployer',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`GitHub API ${res.statusCode}: ${parsed.message || body}`));
          }
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  const ignored = ['node_modules', '.git', '.env', 'ecommerce-dbms-cloud.zip'];

  files.forEach(file => {
    if (ignored.includes(file)) return;
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function main() {
  try {
    console.log('🔍 Checking GitHub token...');
    const user = await ghRequest('GET', '/user');
    console.log(`👤 Authenticated as: ${user.login} (${user.name || 'User'})`);

    console.log(`\n📦 Creating repository "${repoName}" on GitHub...`);
    let repo;
    try {
      repo = await ghRequest('POST', '/user/repos', {
        name: repoName,
        description: 'E-Commerce Management System (PostgreSQL + Node.js) - DBMS Case Study by Vedant V Chaudhari',
        private: false,
        auto_init: true,
      });
      console.log(`✅ Repository created: ${repo.html_url}`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`ℹ️ Repository "${repoName}" already exists, uploading files...`);
        repo = await ghRequest('GET', `/repos/${user.login}/${repoName}`);
      } else {
        throw err;
      }
    }

    // Wait 2 seconds for initial commit
    await new Promise(r => setTimeout(r, 2000));

    console.log('\n🚀 Uploading project files to GitHub...');
    const projectRoot = __dirname;
    const files = getAllFiles(projectRoot);

    for (const filePath of files) {
      const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
      const content = fs.readFileSync(filePath);
      const base64Content = content.toString('base64');

      let sha = undefined;
      try {
        const existing = await ghRequest('GET', `/repos/${user.login}/${repoName}/contents/${relPath}`);
        if (existing && existing.sha) sha = existing.sha;
      } catch (e) {}

      await ghRequest('PUT', `/repos/${user.login}/${repoName}/contents/${relPath}`, {
        message: `Add ${relPath}`,
        content: base64Content,
        sha,
      });

      console.log(`   ✔ Uploaded: ${relPath}`);
    }

    console.log('\n===============================================================');
    console.log('🎉 ALL FILES SUCCESSFULLY PUSHED TO GITHUB!');
    console.log(`🔗 Repository URL: ${repo.html_url}`);
    console.log('===============================================================');
  } catch (err) {
    console.error('❌ Failed to push to GitHub:', err.message);
    process.exit(1);
  }
}

main();

