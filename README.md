# POD Opportunity Studio

A local-only React + Vite + TypeScript frontend for an n8n-powered Print-on-Demand
research and generation pipeline.

The app never talks to a custom backend — it only calls two n8n webhooks:

1. `POST /webhook/pod/analyze` — scrapes and risk-screens a list of Amazon product URLs
   and returns safe POD candidates.
2. `POST /webhook/pod/generate` — takes a selected candidate's ASIN and returns a
   generated design + Amazon Merch listing.

## Tech stack

- React 18 + Vite + TypeScript (strict mode)
- Tailwind CSS (dark mode by default)
- Fetch API with `AbortController` for cancellation and timeouts
- No backend framework, no Redux — plain React hooks + `localStorage`
- Lucide React icons
- Vitest + React Testing Library

## Project structure

```
src/
  api/n8n.ts               Typed webhook client (analyzeProducts, generateCandidate)
  components/               Reusable UI building blocks
  hooks/                     useLocalStorage, useRotatingMessage
  pages/                     InputPage, CandidatesPage, GeneratingPage, ResultPage
  types/api.ts               Candidate / Analyze / Generate / ApiError types
  utils/                     links.ts, validation.ts, downloads.ts
  App.tsx                    Application state machine (input/analyzing/candidates/
                              generating/result) and localStorage persistence
  main.tsx, index.css
```

## Installation

```powershell
npm install
```

## Running everything with one command

`start.ps1` (PowerShell) / `start.sh` (Git Bash) start the n8n Docker container
(if it isn't already running) and the frontend dev server together:

```powershell
npm start
# or directly:
.\start.ps1
```

```bash
./start.sh
```

The script waits for Docker Desktop to be ready, starts (or reuses) the `n8n`
container using the same `docker run` command from your setup, waits for
`http://localhost:5678` to respond, runs `npm install` if `node_modules` is
missing, then starts `npm run dev`. It's safe to re-run — it won't start a second
`n8n` container if one is already up, and n8n's workflows persist across
container restarts via the `n8n_data` Docker volume.

## Running manually

```powershell
npm run dev
```

The app runs at **http://localhost:5173**. It expects n8n to be running locally at
**http://localhost:5678** with both webhooks published (or in "listening for test
event" mode — see Troubleshooting below).

## Other commands

```powershell
npm run build      # tsc -b && vite build — must succeed with zero type errors
npm run preview     # preview the production build
npm run test        # run the Vitest suite once
npm run test:watch  # run Vitest in watch mode
```

## Configuration (environment variables)

Copy `.env.example` to `.env` (already included with working defaults) and adjust if
needed:

```
VITE_N8N_BASE_URL=/n8n-api
VITE_ANALYZE_WEBHOOK_PATH=/webhook/pod/analyze
VITE_GENERATE_WEBHOOK_PATH=/webhook/pod/generate
```

`VITE_N8N_BASE_URL` is never hardcoded inside components — everything goes through
`src/api/n8n.ts`, which reads it from `import.meta.env`.

## CORS: two supported approaches

The frontend (`localhost:5173`) and n8n (`localhost:5678`) are different origins, so a
browser fetch from one to the other is a cross-origin request. Pick one approach:

### Option A (recommended, default): Vite dev proxy

`vite.config.ts` proxies any request to `/n8n-api/*` straight to
`http://localhost:5678/*` on the server side, so the browser only ever talks to
`localhost:5173` — no CORS headers needed at all. This is why the default
`VITE_N8N_BASE_URL` is `/n8n-api`.

```ts
server: {
  proxy: {
    '/n8n-api': {
      target: 'http://localhost:5678',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/n8n-api/, ''),
    },
  },
},
```

With this in place, `POST /n8n-api/webhook/pod/analyze` from the browser is
transparently forwarded to `POST http://localhost:5678/webhook/pod/analyze`.

**Note:** the Vite proxy only works while `npm run dev` is running. It is not active
in `npm run preview` / a production build, since there is no dev server. For a
production-style deployment, use Option B or put a reverse proxy in front of both
services.

### Option B: call n8n directly and enable CORS on n8n

If you'd rather call `http://localhost:5678` directly from the browser, set:

```
VITE_N8N_BASE_URL=http://localhost:5678
```

Then configure n8n to allow the frontend's origin. For the n8n Docker image, set an
environment variable on the container:

```powershell
docker run -it --rm `
  -p 5678:5678 `
  -e N8N_CORS_ALLOW_ORIGIN="http://localhost:5173" `
  docker.n8n.io/n8nio/n8n
```

Or in a `docker-compose.yml`:

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_CORS_ALLOW_ORIGIN=http://localhost:5173
```

If your n8n version doesn't support `N8N_CORS_ALLOW_ORIGIN`, add a "Respond to
Webhook" node (or a Set/Function node before it) that includes the header
`Access-Control-Allow-Origin: http://localhost:5173` on the response, and make sure
the webhook node also handles `OPTIONS` preflight requests.

## Example curl commands

Analyze:

```powershell
curl -X POST http://localhost:5678/webhook/pod/analyze `
  -H "Content-Type: application/json" `
  -d '{\"links\":[\"https://www.amazon.com/dp/B0EXAMPLE1\",\"https://www.amazon.com/dp/B0EXAMPLE2\"]}'
```

Generate:

```powershell
curl -X POST http://localhost:5678/webhook/pod/generate `
  -H "Content-Type: application/json" `
  -d '{\"asin\":\"B0EXAMPLE\"}'
```

(On macOS/Linux, use single quotes for `-d` instead of escaped double quotes.)

## Troubleshooting

**"Could not reach n8n at localhost:5678."**
n8n isn't running, or is on a different port. If using Docker, run
`docker ps` and confirm the container is up and the `5678:5678` port mapping exists.

**"The workflow webhook was not found (404)."**
The workflow is not active, or the path doesn't match. In n8n, either:
- Toggle the workflow to **Active** (top-right switch) to use the production webhook
  URL, or
- Open the workflow, click the Webhook node, and click **"Listen for test event"** to
  use the test URL — but note the test URL only stays open for one request and then
  needs to be re-armed.

**"The workflow webhook is not active."**
Same as above — n8n's error text usually says the webhook is "not registered" when
the workflow is inactive and you're not using the test-listening mode.

**Requests hang or eventually time out.**
Scraping + analyzing multiple Amazon products can legitimately take minutes. The app
uses a 10-minute timeout via `AbortController` and shows rotating progress messages
plus a Cancel button. If it's timing out sooner than expected, check the n8n
workflow's execution log for slow or stuck nodes (e.g. a screenshot step waiting on a
selector that no longer exists on the page).

**n8n returns HTML or plain text instead of JSON.**
This usually means the workflow's final node isn't a "Respond to Webhook" node
configured to return JSON, or an earlier node threw an error that n8n rendered as an
HTML error page. The app surfaces the raw response body (truncated) under "Technical
details" in the error panel to help you debug this.

**"No safe candidates were returned for these links."**
All scraped products were flagged as high risk (or failed to scrape). Try different
product links, or loosen the risk thresholds inside Workflow 1's analysis logic.

**The generated image doesn't show up.**
If `designImageUrl` is empty, the workflow only saved the image locally (e.g. to
`C:\n8n\generated\...png`). Browsers cannot load `C:\` paths directly, so the app
shows a placeholder plus the path as text with a **"Copy local path"** button. To
render the image directly in the browser, have Workflow 2 either upload it somewhere
HTTP-accessible or serve the `generated` folder statically (e.g. via n8n's static
files, a small file server, or S3-compatible storage) and put that URL in
`designImageUrl`.

**CORS error in the browser console.**
See the "CORS" section above — use the Vite proxy (default) or enable
`N8N_CORS_ALLOW_ORIGIN` on the n8n container.

## Data persisted in localStorage

- Last pasted links (`pod-studio:last-links`)
- Most recent analysis response (`pod-studio:candidate-response`)
- Selected ASIN (`pod-studio:selected-asin`)
- Generated result (`pod-studio:generated-result`)

Use the **"Clear saved session"** button in the header to wipe all of the above (a
confirmation dialog appears first).
