# Doneness

## Run it locally

You need three terminals open in this folder:

1. `npm install` (first time only)
2. `npm run db` starts a local copy of DynamoDB on http://localhost:8000. It keeps its data in `.localdb/`.
3. `npm run seed` (first time only) creates the `tasks` table and adds some sample tasks that are due today.
4. `npm run web` starts the app in the browser.

The app and the `table*.js` scripts read their connection from `db.js` and use the local database by default.

## Using real AWS instead

Set `DYNAMO_ENDPOINT=aws` and give it credentials the usual way (`aws configure`).
Do not put keys in the code.
Note that a browser or phone app should not hold AWS keys at all. A real deployment needs a small backend or Cognito in between.

## Demo website (GitHub Pages)

Every push to `main` builds the web version and publishes it to GitHub Pages (`.github/workflows/pages.yml`).
The website has no database, so it uses the sample tasks from `sampleTasks.js` instead and saves completed tasks in the browser (see `taskStore.js`). The samples reset each day.
On `localhost` and on a phone the app still uses DynamoDB.

One-time setup: in the repo's Settings → Pages, set Source to "GitHub Actions".

To build the site yourself: `WEB_PUBLIC_URL=/Doneness/ npx expo export:web` (output goes in `web-build/`).
