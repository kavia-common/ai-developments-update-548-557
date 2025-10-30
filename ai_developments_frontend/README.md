# AI Developments Frontend (React + Ocean Professional)

This app lists the latest AI developments from the last 48 hours. It can fetch directly from public providers or use a built-in mock dataset for demos/offline use. Styled with the Ocean Professional theme.

## Features

- Modern, responsive UI (no heavy UI frameworks)
- Provider-based fetching:
  - HN (Hacker News Algolia) – default, no API key required
  - NewsAPI – requires REACT_APP_NEWSAPI_KEY
  - GNews – requires REACT_APP_GNEWS_KEY
- Optional mock data mode for quick demos
- Debounced search and manual refresh
- Accessible components with subtle transitions and gradients

## Quick Start

1) Install dependencies
   npm install

2) Configure environment
   - Copy the example env file:
     cp .env.example .env
   - Choose your data provider and keys (see “Configuration” below).
   - To run completely offline or avoid all external requests, enable mock mode:
     - Set REACT_APP_USE_MOCK=true in your .env (default in .env.example), OR
     - Append ?mock=1 to the URL (e.g., http://localhost:3000/?mock=1) OR add #mock (e.g., http://localhost:3000/#mock).
       The URL/hash override is a “hard fallback” that forces mock mode even if .env isn’t picked up.

   Alternatively, to use a live provider without keys:
   - Leave REACT_APP_DATA_PROVIDER=HN (no key needed) and set REACT_APP_USE_MOCK=false.

3) Run the app
   npm start

Open http://localhost:3000 in your browser.

Health Check
- A lightweight health-check page is available at /health (e.g., http://localhost:3000/health)
- Renders instantly with status OK, timestamp, version, and a small JSON block.
- No external API calls are performed on this route.

## Configuration

This project uses Create React App, so env vars must be prefixed with REACT_APP_. Configure the following in your .env:

- REACT_APP_DATA_PROVIDER
  - HN (default) – Hacker News Algolia. No key required.
  - NEWSAPI – Requires REACT_APP_NEWSAPI_KEY.
  - GNEWS – Requires REACT_APP_GNEWS_KEY.

- REACT_APP_USE_MOCK
  - true or false.
  - When true, the app serves a small, recent mock dataset and does not call external providers (no network traffic for data).
  - Useful for demos, offline development, CI environments, or when no API keys are available.

- REACT_APP_NEWSAPI_KEY
  - Only required if REACT_APP_DATA_PROVIDER=NEWSAPI.
  - Get a key at https://newsapi.org/

- REACT_APP_GNEWS_KEY
  - Only required if REACT_APP_DATA_PROVIDER=GNEWS.
  - Get a key at https://gnews.io/

Example .env (or see .env.example):

REACT_APP_DATA_PROVIDER=HN
REACT_APP_USE_MOCK=true
REACT_APP_NEWSAPI_KEY=
REACT_APP_GNEWS_KEY=

Provider selection and behavior:
- HN:
  - Uses the “search_by_date” endpoint from HN Algolia to retrieve recent AI-related stories.
  - No API key required.
- NEWSAPI:
  - Requires REACT_APP_NEWSAPI_KEY.
  - Fetches recent English articles for AI-related terms.
- GNEWS:
  - Requires REACT_APP_GNEWS_KEY.
  - Fetches recent English articles for AI-related terms.

Mock usage:
- When mock mode is on (env, URL, or hash), the app returns a curated set of realistic items from a local static dataset (src/data/mockDevelopments.json).
- A banner “Mock data mode is ON” appears at the top to make the mode visible.
- The same filtering, sorting, and relative time formatting are applied as with live providers.
- If the dataset timestamps drift older than 48h, forcing mock via URL/hash bypasses the 48h filter so items still render.
- If a live provider returns 0 items or fails, the app automatically falls back to mock and sets the mock banner.

## Available Scripts

- npm start
  Runs the app in development mode at http://localhost:3000

- npm test
  Launches the test runner in interactive watch mode.

- npm run build
  Builds the app for production in the build folder with optimized assets.

## Theming

Ocean Professional theme tokens are defined in src/App.css and applied across components (cards, header, buttons, banners, etc.). Light and dark modes are supported via the data-theme attribute on the document element.

## Learn More

- React docs: https://reactjs.org/
- CRA advanced topics: https://facebook.github.io/create-react-app/docs/getting-started
