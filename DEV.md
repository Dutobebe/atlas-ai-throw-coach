# Development

## Single dev server

Use `npm run dev` (alias: `dev:single`) to start exactly one Next.js dev server for this project.

The script will:

1. Detect and stop stale `next dev` processes tied to Project Atlas
2. Start `next dev --turbopack` directly
3. Parse the exact **Local** URL from Next.js stdout (never guesses the port)
4. Verify HTTP 200 on that URL
5. Open the verified URL in your default browser

If port 3000 is already in use, the script reports whatever port Next.js selects from its startup output.

For a clean `.next` cache before starting, use `npm run dev:clean`.
