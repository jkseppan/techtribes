# Techtribes

## Overview

A site listing active tech community events in Finland. Events are updated automatically once a day. Supports [Meetabit](https://www.meetabit.com/), [Meetup.com](https://www.meetup.com/), [Luma](https://luma.com/) and a [custom JSON format](https://gist.githubusercontent.com/olegp/f34469b65286c057964414c4aaf5bf47/raw).

The site itself lives in [remix/](remix/) and is a statically prerendered React Router v8 app, deployed to GitHub Pages. See [remix/README.md](remix/README.md) for details on that app.

## Add community

First, install dependencies:

```bash
npm install
```

Then, add a community by URL:

```bash
npm run add <url> [tags]
```

Example: `npm run add https://www.meetabit.com/communities/helsinkijs "JavaScript,TypeScript"`

Once done, create a pull request with the changes.

## Data file

Communities are defined in [data/communities.yml](data/communities.yml):

```yaml
- name: HelsinkiJS
  location: Helsinki, Finland
  tags:
    - JavaScript
    - TypeScript
  events: https://www.meetabit.com/communities/helsinkijs
  logo: helsinkijs.png # optional, can start with http(s)
  site: https://helsinkijs.org # optional
  url: https://gist.githubusercontent.com/olegp/f34469b65286c057964414c4aaf5bf47/raw # alternative to events
```

The `add` command updates this file and adds a logo to the repo.

## Development

The scraping and data-maintenance scripts run from the repo root; the site itself is built from `remix/`.

Install root dependencies and scrape event data:

```bash
npm install
npm run scrape
```

This writes `data/output.json`, which the site reads at build time. Then, in a separate step, install and run the site:

```bash
cd remix
npm install
npm run dev
```

To build the static site for production (equivalent to what CI does):

```bash
npm run scrape       # from the repo root
cd remix && npm install && npm run build
```

The output is written to `remix/build/client`.

Remove inactive communities:

```bash
npm run prune
```

## Legacy Jekyll site

The original Jekyll site in `site/` (plus `Gemfile` and `.ruby-version`) is intentionally kept in the repo for now, as a rollback path while the React Router rewrite settles in production. It is no longer built or deployed by CI. If you need to run it locally:

```bash
bundle install
npm run scrape
npm start            # jekyll serve --source site --livereload
```

Removing the Jekyll site entirely is tracked in [TODO.md](TODO.md).
