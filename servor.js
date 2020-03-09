const fs = require('fs');
const servor = require('servor');

const details = file => ({
  size: fs.readFileSync(`./posts/${file}`).length,
  mtime: fs.statSync(`./posts/${file}`).mtime
});

const posts = fs
  .readdirSync('./posts')
  .reduce((a, b) => ({ ...a, [b.replace('.md', '')]: details(b) }), {});

fs.writeFileSync('./data.json', JSON.stringify(posts));

(async () => {
  const { url } = await servor({ reload: true, silent: false, port: 1337 });
  console.log(url);
})();
