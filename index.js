import { h, render } from './web_modules/preact.js';
import htm from './web_modules/htm.js';
import css from './web_modules/csz.js';

const html = htm.bind(h);
const go = view => render(view, document.body);

const index = data => html`
  <main className=${style.index}>
    <div>
      ${Object.entries(data)
        .sort(([k, v], [k1, v1]) =>
          +new Date(v.mtime) < +new Date(v1.mtime) ? 0 : -1
        )
        .slice(0, 3)
        .map(
          ([x, v]) =>
            html`
              <a href=${x}>
                <iframe src=${x} frameborder="0"></iframe>
              </a>
            `
        )}
    </div>
  </main>
`;

const article = post => html`
  <main className=${style.article}>
    <article innerHTML=${marked(post)} />
  </main>
`;

// grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
// gap: 3rem;
const style = {
  index: css`
    display: flex;
    align-items: center;
    width: 100%;
    overflow-y: auto;
    height: 100vh;
    > div {
      display: flex;
      padding: 4rem;
    }
    > div > * + * {
      margin-left: 4rem;
    }
    a {
      flex: 1 1 100%;
      min-width: 24rem;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
      &:hover iframe {
        opacity: 1;
        transform: scale(1.062);
        box-shadow: 0 0 2rem rgba(0, 0, 0, 0.2);
      }
    }
    iframe {
      width: 100%;
      height: 80vh;
      border: 0;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
      opacity: 0.6;
      transition: transform 0.3s;
      border-radius: 1rem;
    }
  `,
  article: css`
    width: 100%;
    max-width: 100ch;
    margin: 0 auto;
    padding: 3rem 2rem 4rem;

    article {
      color: #fff;
      line-height: 2;
      word-wrap: break-word;
      width: 100%;
      margin: 0 auto;
      color: rgba(255, 255, 255, 0.8);
    }
  `
};

(async () => {
  const path = location.pathname;
  const data = await fetch('./data.json').then(res => res.json());
  const post = await fetch(
    `./posts/${
      path === '/' ? Object.keys(data)[0].replace('.md', '') : path.slice(1)
    }.md`
  ).then(res => res.text());
  go(path === '/' ? index(data) : article(post));
})();
