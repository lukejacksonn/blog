import {
  render,
  useReducer,
  useState,
  useEffect,
  useRef,
  html,
  css,
} from '../runtime.js';

const getPost = (file) =>
  fetch(`./posts/${file}.md`)
    .then((res) => res.text())
    .then(marked);

const getPosts = () =>
  fetch('./posts.json')
    .then((res) => res.json())
    .catch(() => ({}));

const avatar = location.host.match('github.io')
  ? `https://github.com/${location.host.split('.')[0]}.png`
  : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=';

const header = ({ state, dispatch }) => {
  return html`
    <header className=${style.header}>
      <a
        onClick=${(e) => {
          e.preventDefault();
          window.history.pushState(null, null, '/');
        }}
      >
        <svg className=${style.logo} viewBox="0 0 12 16" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"
          ></path>
        </svg>
      </a>
      <input
        className=${style.searchInput}
        placeholder="Search for articles..."
        onInput=${(e) => dispatch({ searchTerm: e.target.value })}
      />
      <img className=${style.avatar} src=${avatar} />
    </header>
  `;
};

const linkToArticle = ({ data: [url, meta], dispatch }) => {
  const ref = useRef();
  const [post, setPost] = useState('');

  useEffect(() => {
    let observer = new IntersectionObserver(
      (container) => {
        if (container[0].intersectionRatio > 0.1 && post === '')
          getPost(url).then(setPost);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );
    observer.observe(ref.current);
    return () => observer.unobserve(ref.current);
  }, [post]);

  return html`
    <a
      ref=${ref}
      href=${url}
      onClick=${(e) => {
        e.preventDefault();
        dispatch({ post: '' });
        window.history.pushState(null, null, url);
      }}
    >
      <article className=${style.article} innerHTML=${post}></article>
    </a>
  `;
};

const index = ({ state, dispatch }) => {
  const { posts, searchTerm } = state;

  useEffect(() => {
    getPosts()
      .then((data) => Object.entries(data))
      .then((posts) => dispatch({ posts }));
  }, []);

  return html`
    <main className=${style.index}>
      <div>
        ${posts &&
        (posts.length === 0
          ? html`
              <div className=${style.gettingStarted}>
                <svg viewBox="0 0 14 16" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    d="M12 8V1c0-.55-.45-1-1-1H1C.45 0 0 .45 0 1v12c0 .55.45 1 1 1h2v2l1.5-1.5L6 16v-4H3v1H1v-2h7v-1H2V1h9v7h1zM4 2H3v1h1V2zM3 4h1v1H3V4zm1 2H3v1h1V6zm0 3H3V8h1v1zm6 3H8v2h2v2h2v-2h2v-2h-2v-2h-2v2z"
                  ></path>
                </svg>
                <p>
                  Add a markdown file to the posts directory and run ${' '}<code
                    >node make</code
                  >${' '} from the project root.
                </p>
              </div>
            `
          : posts
              .filter(([k, v]) =>
                k.toLowerCase().match(searchTerm.toLowerCase())
              )
              .sort(([k, v], [k1, v1]) =>
                +new Date(v.mtime) > +new Date(v1.mtime) ? -1 : 0
              )
              .map(
                (x) =>
                  html`
                    <${linkToArticle}
                      data=${x}
                      key=${x[0]}
                      dispatch=${dispatch}
                    />
                  `
              ))}
      </div>
    </main>
  `;
};

const article = ({ state, dispatch }) => {
  useEffect(() => {
    getPost(state.route.slice(1)).then((post) => dispatch({ post }));
  }, []);

  return html`
    <main className=${style.post}>
      <article className=${style.article} innerHTML=${state.post} />
    </main>
  `;
};

const style = {
  gettingStarted: css`
    width: 50ch;
    max-width: 100%;
    margin: auto;
    text-align: center;
    line-height: 150%;
    font-size: 1.38rem;
    color: rgba(0, 0, 0, 0.38);
    font-weight: bold;
    padding: 1rem;
    svg {
      width: 10ch;
      fill: rgba(0, 0, 0, 0.38);
    }
    code {
      background: rgba(0, 0, 0, 0.1);
      padding: 0 0.5ch;
    }
    > * + * {
      margin-top: 2rem;
    }
  `,
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
    width: 3.2rem;
    height: 3.2rem;
    fill: #333;
    transform: translateY(5%);
  `,
  avatar: css`
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
  `,
  searchInput: css`
    background: #111;
    display: block;
    font-size: 1.2rem;
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
    height: 100%;
    overflow: hidden;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    flex: 0 1 100%;

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
    flex: 0 1 100%;
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
  `,
};

const reducer = (state, update) => ({
  ...state,
  ...(typeof update === 'function' ? update(state) : update),
});

const initialState = {
  route: null,
  posts: null,
  post: '',
  searchTerm: '',
};

const app = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const updateRoute = () =>
      dispatch(() => ({
        route: location.host.match('github.io')
          ? '/' + location.pathname.split('/').slice(2).join('/')
          : location.pathname,
      }));
    addEventListener('popstate', updateRoute);
    const pushState = window.history.pushState;
    window.history.pushState = function () {
      pushState.apply(history, arguments);
      updateRoute();
    };
    updateRoute();
  }, []);

  return (
    state.route &&
    html`
      <${header} state=${state} dispatch=${dispatch} />
      <${state.route === '/' || state.searchTerm ? index : article}
        state=${state}
        dispatch=${dispatch}
      />
    `
  );
};

render(html`<${app} />`, document.body);
