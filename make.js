const fs = require('fs');

const details = (file) => ({
  size: fs.readFileSync(`./posts/${file}`).length,
  mtime: fs.statSync(`./posts/${file}`).mtime,
});

const posts = fs
  .readdirSync('./posts')
  .reduce((a, b) => ({ ...a, [b.replace('.md', '')]: details(b) }), {});

fs.writeFileSync('./posts.json', JSON.stringify(posts));
