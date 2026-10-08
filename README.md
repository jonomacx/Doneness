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
