const fs = require("fs");
const path = require("path");

const redirects = require("./redirects.json");

/**
 * Validates a URL string
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string
 */
function escapeHtml(str) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => htmlEntities[char]);
}

/**
 * Generates an HTML redirect page for a given URL
 * @param {string} url - The destination URL
 * @param {string} slug - The shortlink slug (for display purposes)
 * @returns {string} - The HTML content
 */
function generateRedirectHtml(url, slug) {
  const escapedUrl = escapeHtml(url);
  const jsEscapedUrl = JSON.stringify(url);
  const displayName = escapeHtml(slug === "" ? "lkang.au" : (slug || "lkang.au"));
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0; url=${escapedUrl}">
    <link rel="canonical" href="${escapedUrl}">
    <title>Redirecting to ${escapedUrl}</title>
    
    <!-- Open Graph / Social Media -->
    <meta property="og:title" content="${displayName} - lkang.au Shortlink">
    <meta property="og:description" content="Redirecting to ${escapedUrl}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapedUrl}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${displayName} - lkang.au Shortlink">
    <meta name="twitter:description" content="Redirecting to ${escapedUrl}">
    
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background: #f5f5f5;
        color: #333;
      }
      .container {
        text-align: center;
        padding: 2rem;
      }
      a {
        color: #3498db;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p>Redirecting to <a href="${escapedUrl}">${escapedUrl}</a>...</p>
      <noscript>
        <p>If you are not redirected automatically, <a href="${escapedUrl}">click here</a>.</p>
      </noscript>
    </div>
    <script>
      window.location.replace(${jsEscapedUrl});
    </script>
  </body>
</html>`;
}

// Track statistics
let generated = 0;
let skipped = 0;
const errors = [];

console.log("🔗 lkang.au Shortlink Generator\n");
console.log("Processing redirects.json...\n");

for (const slug in redirects) {
  const url = redirects[slug];
  
  // Validate URL
  if (!isValidUrl(url)) {
    errors.push({ slug, url, reason: "Invalid URL format" });
    skipped++;
    continue;
  }
  
  const dir = path.join(__dirname, slug);
  const html = generateRedirectHtml(url, slug);

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`  ✓ ${slug || "(root)"} → ${url}`);
    generated++;
  } catch (err) {
    errors.push({ slug, url, reason: err.message });
    skipped++;
  }
}

console.log("\n" + "─".repeat(50));
console.log(`\n📊 Summary:`);
console.log(`   Generated: ${generated} redirect(s)`);
if (skipped > 0) {
  console.log(`   Skipped: ${skipped} redirect(s)`);
}
if (errors.length > 0) {
  console.log(`\n⚠️  Errors:`);
  errors.forEach(({ slug, url, reason }) => {
    console.log(`   - ${slug || "(root)"}: ${reason}`);
  });
}
console.log("");