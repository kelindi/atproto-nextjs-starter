# Statusphere Next.js Example

This project adapts the [Statusphere example app](https://github.com/bluesky-social/statusphere-example-app) to a Next.js application.
It demonstrates how to build an AT Protocol application using the `app` router, API routes and server components.

## Features

- OAuth sign in via the AT Protocol
- Firehose ingestion of custom `xyz.statusphere.status` records
- SQLite storage using Kysely
- Example pages for logging in and setting a status

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app will start on [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.template` to `.env` and adjust values as needed. Important settings are:

- `DB_PATH` – location for the SQLite database
- `COOKIE_SECRET` – secret used for session cookies

## Project Structure

- `src/lib` – core server utilities such as database setup, OAuth client and firehose ingestion
- `src/app` – Next.js routes and React pages
- `src/app/api` – API route handlers replacing the original Express routes
- `src/lexicon` – generated lexicon types used by the AT Protocol libraries

## Building

```bash
npm run build
```

## License

MIT
