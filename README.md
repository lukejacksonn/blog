# Ghatsby

> forkable static personal blogging solution

A clientside only web app that indexes, fetches and renders markdown on demand at runtime. A lightweight alternative to static site generators such as gatsby and next. Intended to be self hosted for free using GitHub pages.

Both the content and the application code is completely static which means no lengthy build steps ever; handling hundreds of posts efforlessly. Because all compilation and linking happens at runtime, all changes are rendered in the browser instantly. Deployment to GitHub pages happens after `git push` with no CI required. It is even possible to edit existing posts file via the GitHub UI alone.

## Features

- 🗂 Automatically generated index
- 🔍 Searchable meta data and content
- 🖥 Lazy loading of full render previews
- ⏱ Almost instant rebuilds and deploys
- 🌍 Intended to be hosted on GitHub pages

## Usage

The product consists of two fundamental parts; a small node script `make.js` which generates the index for all posts, along with a lightweight clientside application `index.js` which renders the index and posts.

> To get started fork then clone this repository to your local machine

### Creating a New Post

This can be done by creating an new file inside of the `posts` directory. There is no restriction or convention for naming post files but note that the chosen name maps directly to the url that the post will be made available at. All posts must have the extension `.md`.

For example, if a file exists in the posts directory named `first-post.md` then it will be accessible locally via the url `localhost:8080/first-post` and in production at `user.github.io/blog/first-post`.

### Generating an Index

This should be done after adding or removing a post from the `posts` directory, To generate an index that includes the new file (or excludes and removed file) run the following command from the project root:

```bash
node make
```

This outputs the file `post.json` which is contains meta data (like name, size and modified date) for all posts. For the UI to work properly it is important to keep the index in sync with te posts that exist.

### Running Locally

This can be done trivially as both the posts and the application code themselves are static and do not require building at all. Feel free to use any local dev server that supports history API fallback (for clientside routing) or run the following command from the project root:

```bash
npx servor --reload
```

By default this will start a server on `http://localhost:8080` with live reload enabled.

### Deploying the Blog

This should happen after any merge to master so long as GitHub Pages has been enabled for the master branch of the repository (which can be done from the Settings tab). Given the nature if this setup it is also possible to trigger a deploy by editing and committing a change to a post directly from GitHub using the WYSIWYG editor.

Given that there is no build step or continuous integration required, deploys usually happen almost immedietly and can be verified by visiting `https://<USERNAME>.github.io/blog` and hard refreshing.

## Contributions

If there is a feature missing from this setup that you would like to see implemented then feel free to create a pull request or an issue!
