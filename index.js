import { h, render } from 'https://cdn.pika.dev/preact@^10.0.0';
import { useState, useEffect } from 'https://cdn.pika.dev/preact@^10.0.0/hooks';

import htm from './web_modules/htm.js';
import css from './web_modules/csz.js';

const html = htm.bind(h);
const path = location.host.match('github.io')
  ? '/' +
    location.pathname
      .split('/')
      .slice(2)
      .join('/')
  : location.pathname;

const getPost = file =>
  fetch(`./posts/${file}.md`)
    .then(res => res.text())
    .then(marked);

const index = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('./data.json')
      .then(res => res.json())
      .then(data => {
        Promise.all(
          Object.entries(data).map(([k, v]) =>
            getPost(k).then(post => [k, post])
          )
        ).then(setPosts);
      });
  }, []);

  return html`
    <main className=${style.index}>
      <div>
        ${posts.map(
          ([url, post]) =>
            html`
              <a href=${url} className=${style.article}>
                <article innerHTML=${post}></article>
              </a>
            `
        )}
      </div>
    </main>
  `;
};

const article = () => {
  const [post, setPost] = useState('');

  useEffect(() => {
    getPost(path.slice(1)).then(setPost);
  }, []);

  return html`
    <main className=${style.article}>
      <article innerHTML=${post} />
    </main>
  `;
};

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
    > div > a {
      flex: none;
      width: 24rem;
      position: relative;
      text-decoration: none;
      height: 80vh;
      border: 0;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
      opacity: 0.6;
      transition: transform 0.3s;
      border-radius: 1rem;
      overflow: hidden;
      font-size: 14px;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
      &:hover {
        opacity: 1;
        transform: scale(1.062);
        box-shadow: 0 0 2rem rgba(0, 0, 0, 0.2);
      }
    }
    iframe {
      width: 100%;
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

      > * + * {
        margin-top: 2em;
      }

      hr {
        opacity: 0.38;
      }

      li {
        list-style: disc;
        list-style-position: inside;
      }

      h1,
      h2,
      h3,
      h4,
      strong {
        font-weight: bold;
      }

      h1 {
        text-align: left;
        font-size: 3em;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding-bottom: 0.62em;
        line-height: 1.38;
      }

      h2 {
        font-size: 1.62em;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding-bottom: 0.62em;
        margin-bottom: 1em;
      }

      h3 {
        font-size: 1em;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding-bottom: 0.62em;
        margin-bottom: 1em;
      }

      img {
        display: block;
        width: 100%;
        max-width: 100%;
      }

      pre {
        background: rgba(0, 0, 0, 0.2);
        padding: 1em;
        border-radius: 0.38em;
        overflow-x: scroll;
      }

      a {
        display: inline-block;
        color: #00dddd;
        margin-top: 0;
      }

      table {
        border-collapse: collapse;
        color: inherit;
      }

      td,
      th,
      tr {
        border: 1px solid rgba(255, 255, 255, 0.38);
        padding: 0.62em;
      }

      blockquote {
        border-left: 2px solid rgba(255, 255, 255, 0.38);
        padding: 0.38em 1em;
      }

      :not(pre) > code {
        padding: 0 0.38em;
        background: #333;
      }
    }
  `
};

render(
  html`
    <${path === '/' ? index : article} />
  `,
  document.body
);
