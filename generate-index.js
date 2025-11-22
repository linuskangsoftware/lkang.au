const fs = require("fs");
const path = require("path");

function getAllFiles(dirPath, arrayOfFiles = [], baseDir = dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    
    // Skip hidden files/directories and node_modules
    if (file.startsWith('.') || file === 'node_modules') {
      return;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, baseDir);
    } else {
      // Get relative path from base directory
      const relativePath = path.relative(baseDir, fullPath);
      arrayOfFiles.push(relativePath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(__dirname).sort();

const fileListHtml = files.map(file => {
  const encodedPath = encodeURIComponent(file);
  return `      <li><a href="https://github.com/linuskangsoftware/lkang.au/blob/main/${encodedPath}">${file}</a></li>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Index - lkang.au</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
        padding: 20px;
      }
      
      .container {
        max-width: 900px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      h1 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-size: 2em;
      }
      
      .subtitle {
        color: #7f8c8d;
        margin-bottom: 30px;
        font-size: 1.1em;
      }
      
      .file-list {
        list-style: none;
        padding: 0;
      }
      
      .file-list li {
        padding: 10px;
        border-bottom: 1px solid #ecf0f1;
        transition: background-color 0.2s;
      }
      
      .file-list li:hover {
        background-color: #f8f9fa;
      }
      
      .file-list li:last-child {
        border-bottom: none;
      }
      
      .file-list a {
        color: #3498db;
        text-decoration: none;
        font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        font-size: 0.95em;
      }
      
      .file-list a:hover {
        color: #2980b9;
        text-decoration: underline;
      }
      
      .stats {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 2px solid #ecf0f1;
        color: #7f8c8d;
        font-size: 0.9em;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>File Index</h1>
      <p class="subtitle">Repository: linuskangsoftware/lkang.au</p>
      
      <ul class="file-list">
${fileListHtml}
      </ul>
      
      <div class="stats">
        Total files: ${files.length}
      </div>
    </div>
  </body>
</html>`;

const indexDir = path.join(__dirname, 'files');
fs.mkdirSync(indexDir, { recursive: true });
fs.writeFileSync(path.join(indexDir, 'index.html'), html);

console.log(`Generated index page with ${files.length} files`);
