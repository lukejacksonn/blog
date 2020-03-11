import { h, render } from 'https://cdn.pika.dev/preact@10.3.3';
import {
  useState,
  useEffect,
  useRef
} from 'https://cdn.pika.dev/preact@10.3.3/hooks';

import htm from 'https://cdn.pika.dev/htm@3.0.3';
import css from 'https://cdn.pika.dev/csz@1.2.0';

const html = htm.bind(h);

const getPost = file =>
  fetch(`./posts/${file}.md`)
    .then(res => res.text())
    .then(marked);

const getPosts = () =>
  fetch('./posts.json')
    .then(res => res.json())
    .catch(() => ({}));

const linkToArticle = ({ data: [url, meta] }) => {
  const ref = useRef();
  const [post, setPost] = useState('');

  useEffect(() => {
    let observer = new IntersectionObserver(
      container => {
        if (container[0].intersectionRatio > 0.1 && post === '')
          getPost(url).then(setPost);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );
    observer.observe(ref.current);
    return () => observer.unobserve(ref.current);
  }, [post]);

  return html`
    <a
      ref=${ref}
      href=${url}
      onClick=${e => {
        e.preventDefault();
        window.history.pushState(null, null, url);
      }}
    >
      <article className=${style.article} innerHTML=${post}></article>
    </a>
  `;
};

const index = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const avatar = location.host.match('github.io')
    ? `https://github.com/${location.host.split('.')[0]}.png`
    : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=';

  useEffect(() => {
    getPosts()
      .then(data => Object.entries(data))
      .then(setPosts);
  }, []);

  return html`
    <header className=${style.header}>
      <svg className=${style.logo} viewBox="0 0 16 16" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M3 5h4v1H3V5zm0 3h4V7H3v1zm0 2h4V9H3v1zm11-5h-4v1h4V5zm0 2h-4v1h4V7zm0 2h-4v1h4V9zm2-6v9c0 .55-.45 1-1 1H9.5l-1 1-1-1H2c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h5.5l1 1 1-1H15c.55 0 1 .45 1 1zm-8 .5L7.5 3H2v9h6V3.5zm7-.5H9.5l-.5.5V12h6V3z"
        />
      </svg>
      <input
        className=${style.searchInput}
        placeholder="Search for articles..."
        onInput=${e => setSearchTerm(e.target.value)}
      />
      <img className=${style.avatar} src=${avatar} />
    </header>
    <main className=${style.index}>
      <div>
        ${posts
          .filter(([k, v]) => k.toLowerCase().match(searchTerm.toLowerCase()))
          .sort(([k, v], [k1, v1]) =>
            +new Date(v.mtime) > +new Date(v1.mtime) ? -1 : 0
          )
          .map(
            x =>
              html`
                <${linkToArticle} data=${x} key=${x[0]} />
              `
          )}
      </div>
    </main>
  `;
};

const article = ({ route }) => {
  const [post, setPost] = useState('');

  useEffect(() => {
    getPost(route.slice(1)).then(setPost);
  }, []);

  return html`
    <main className=${style.post}>
      <article className=${style.article} innerHTML=${post} />
    </main>
  `;
};

const style = {
  header: css`
    display: flex;
    align-items: center;
    background: #191919;
    padding: 1rem;

    > * + * {
      margin-left: 1rem;
    }
  `,
  logo: css`
    width: 4rem;
    height: 4rem;
    fill: #333;
  `,
  avatar: css`
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 50%;
  `,
  searchInput: css`
    background: #111;
    display: block;
    font-size: 1.38rem;
    padding: 1rem;
    border: 1px solid #222;
    border-radius: 1rem;
    flex: 1 1 100%;
    color: rgba(255, 255, 255, 0.8);
    min-width: 0;
    margin-right: auto;
    max-width: 20rem;
  `,
  index: css`
    display: flex;
    width: 100%;
    overflow: hidden;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    flex: 1 1 100%;

    > div {
      padding: 2rem;
      display: flex;
      height: 100%;
    }
    > div > * + * {
      margin-left: 2rem;
    }
    > div > a {
      display: block;
      flex: none;
      width: 22rem;
      position: relative;
      text-decoration: none;
      height: 100%;
      border: 0;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
      opacity: 0.8;
      transition: transform 0.3s;
      border-radius: 1rem;
      overflow: hidden;
      font-size: 0.8rem;
      padding: 2rem 2rem 4rem;

      p {
        line-height: 162%;
      }
      border: 2px solid #333;
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
        transform: scale(1.038);
        box-shadow: 0 0 2rem rgba(0, 0, 0, 0.2);
      }
    }
  `,
  post: css`
    width: 100%;
    margin: 0 auto;
    padding: 2rem 2rem 4rem;
    overflow-y: auto;
    height: 100%;
    -webkit-overflow-scrolling: touch;

    @media (min-width: 110ch) {
      padding: 5vw 2rem 4rem;
    }
  `,
  article: css`
    max-width: 80ch;
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
      font-size: 2em;
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
      color: #aaa;
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
      font-style: italic;
    }

    :not(pre) > code {
      padding: 0 0.38em;
      background: #333;
    }
  `
};

const app = () => {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    const updateRoute = () =>
      setRoute(
        location.host.match('github.io')
          ? '/' +
              location.pathname
                .split('/')
                .slice(2)
                .join('/')
          : location.pathname
      );
    addEventListener('popstate', updateRoute);
    const pushState = window.history.pushState;
    window.history.pushState = function() {
      pushState.apply(history, arguments);
      updateRoute();
    };
    updateRoute();
  }, []);

  return (
    route &&
    html`
      <${route === '/' ? index : article} route=${route} />
    `
  );
};

render(
  html`
    <${app} />
  `,
  document.body
);
