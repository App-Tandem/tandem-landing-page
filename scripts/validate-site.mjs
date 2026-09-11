import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".sites-runtime", "node_modules"]);
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function addError(file, message) {
  errors.push(`${path.relative(root, file)}: ${message}`);
}

function localTargetExists(htmlFile, rawTarget) {
  const target = rawTarget.split("#")[0].split("?")[0];
  if (!target || /^(?:https?:|mailto:|tel:|data:|tandem:)/i.test(target)) return true;

  const decoded = decodeURIComponent(target);
  const absolute = path.resolve(path.dirname(htmlFile), decoded);
  if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) return true;
  if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) {
    return fs.existsSync(path.join(absolute, "index.html"));
  }
  return false;
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const styleFiles = files.filter((file) => file.endsWith(".css"));

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");

  if (!/<html\s+[^>]*lang="[^"]+"/i.test(html)) addError(file, "missing document language");
  if (!/<title>[^<]+<\/title>/i.test(html)) addError(file, "missing non-empty title");
  if (!/<meta\s+name="description"\s+content="[^"]+"\s*\/?>/i.test(html)) addError(file, "missing meta description");
  if (!/<link\s+rel="canonical"\s+href="https:\/\/tandem-app\.eu\//i.test(html)) addError(file, "missing canonical URL");
  if (!/js\/analytics\.js/.test(html)) addError(file, "missing privacy-conscious PostHog instrumentation");

  const ids = [...html.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) addError(file, `duplicate IDs: ${[...new Set(duplicates)].join(", ")}`);

  for (const match of html.matchAll(/\s(?:src|href)="([^"]+)"/gi)) {
    if (!localTargetExists(file, match[1])) addError(file, `broken local reference: ${match[1]}`);
  }
}

for (const file of [...htmlFiles, ...styleFiles]) {
  const source = fs.readFileSync(file, "utf8");
  if (/prefers-color-scheme\s*:\s*dark/i.test(source)) {
    addError(file, "landing page must remain light-mode only");
  }
}

const publicCopy = files
  .filter((file) => /\.(?:html|txt)$/i.test(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

if (/Tandem is the #1/i.test(publicCopy)) errors.push("Public copy contains an unsupported #1 claim");
if (/5\.0 on the App Store/i.test(publicCopy)) errors.push("Public copy contains a hard-coded App Store rating");
if (/premium subscription unlocks/i.test(publicCopy)) errors.push("Public copy describes a premium plan that is not currently available");

for (const file of files.filter((candidate) => candidate.endsWith(".js"))) {
  const source = fs.readFileSync(file, "utf8");
  if (/\beval\s*\(/.test(source)) addError(file, "eval is not allowed");
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML pages and ${files.length} tracked site files.`);
