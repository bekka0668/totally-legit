// Bundles src/ into one self-contained, double-clickable HTML file: TotallyLegit.html
// Usage: node build.js [extraOutDir]   (extraOutDir also gets a body-only copy for web embedding)
const fs = require('fs');
const path = require('path');

const root = __dirname;
const src = path.join(root, 'src');
const order = ['util', 'data', 'save', 'audio', 'gl', 'world', 'models', 'chat', 'match', 'extras', 'anticheat', 'style', 'hud', 'hub', 'main'];

const js = order.map(n => `/* ---------- ${n}.js ---------- */\n` + fs.readFileSync(path.join(src, 'js', n + '.js'), 'utf8')).join('\n')
  .replace(/<\/script/gi, '<\\/script');
const css = fs.readFileSync(path.join(src, 'style.css'), 'utf8');
const shell = fs.readFileSync(path.join(src, 'shell.html'), 'utf8');
const fonts = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Oxanium:wght@500;600;700;800&display=swap">',
].join('\n');
const title = '<title>Totally Legit</title>';

const full = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${title}
<meta name="description" content="An incremental shooter where you can't aim, so you buy cheats from a raccoon.">
${fonts}
<style>
${css}
</style>
</head>
<body>
${shell}
<script>
${js}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'TotallyLegit.html'), full);
fs.writeFileSync(path.join(root, 'index.html'), full); // GitHub Pages entry point
console.log('wrote TotallyLegit.html + index.html', (full.length / 1024).toFixed(1) + ' KB');

const outDir = process.argv[2];
if (outDir) {
  const body = `${title}
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
${css}
</style>
${shell}
<script>
${js}
</script>
`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'totally-legit.html'), body);
  console.log('wrote', path.join(outDir, 'totally-legit.html'));
}
