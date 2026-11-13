const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'content', 'articles');
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && e.name.endsWith('.ts')) {
      const txt = fs.readFileSync(full, 'utf8');
      const match = txt.match(/draft:\s*(true|false)/);
      if (match && match[1] === 'false') {
        console.log(path.relative(process.cwd(), full));
      }
    }
  }
}
walk(root);
