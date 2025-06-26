# Statusphere Next.js Example

This project adapts the [Statusphere example app](https://github.com/bluesky-social/statusphere-example-app) to a Next.js application.
It demonstrates how to build an AT Protocol application using the `app` router, API routes and server components.

## Features

- OAuth sign in via the AT Protocol
- Firehose ingestion of custom `xyz.statusphere.status` records
- In-memory storage of status updates and OAuth sessions
- Example pages for logging in and setting a status

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app will start on [http://localhost:3000](http://localhost:3000).

When you change or add lexicon schemas, regenerate the TypeScript types using:

```bash
npm run lexgen
```

### Environment

Copy `.env.template` to `.env` and adjust values as needed. Important settings are:

- `COOKIE_SECRET` – secret used for session cookies

## Project Structure

- `src/lib` – core server utilities including OAuth client, firehose ingestion and in-memory stores
- `src/app` – Next.js routes and React pages
- `src/app/api` – API route handlers replacing the original Express routes
- `src/lexicon` – generated lexicon types used by the AT Protocol libraries
## Creating new schemas

This project follows the [AT Protocol applications guide](https://atproto.com/guides/applications) and uses [Lexicon](https://github.com/bluesky-social/atproto/blob/main/packages/lexicon) to define record collections.

To add your own schema:

1. Write a Lexicon JSON file describing the collection you want to store on the network. See `lexicons/xyz.statusphere.status.json` for an example.
2. Place the file in the `lexicons` directory.
3. Regenerate the TypeScript types and schema dictionary:

```bash
npm run lexgen
```

4. Commit the updated files in `src/lexicon`. They are imported by API routes and server components.

## Building

```bash
npm run build
```

## License

MIT
