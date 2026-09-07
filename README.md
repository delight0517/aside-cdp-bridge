# aside-cdp-bridge

A tiny Node.js toolkit that lets an AI agent (Claude, or anything else that can
shell out) control the [Aside](https://www.asideapp.com/) browser directly
through the Chrome DevTools Protocol (CDP) — **without going through Aside's
own built-in AI assistant at all.**

Aside is a Chromium-based browser that, like regular Chrome, will happily
expose a remote-debugging port. Once that port is open, you can drive it the
exact same way tools like `claude-in-chrome` drive real Chrome: connect with
`puppeteer-core`, open an isolated tab, read the DOM, click things, type into
fields. No screen scanning, no coordinate-based clicking, no OCR — just the
same structured, low-cost automation pattern other Chromium-based AI browsers
support.

If you want an agent to operate *any* Chromium-based "AI browser" app without
relying on its in-house assistant, this repo is a minimal, working reference
for how to do that.

## Why this exists

Screen-scraping/clicking-by-coordinates automation is slow, expensive (needs
vision calls), and brittle (breaks on any UI change). CDP-based control is
none of those things — it's the same protocol Chrome DevTools itself uses, so
it's fast, cheap, and precise. This project proves that pattern works against
Aside specifically, and should generalize to any other Chromium-based browser
that exposes `--remote-debugging-port`.

## Prerequisites

Aside must already be running with `--remote-debugging-port=9222` (many
Chromium-based apps enable this by default or via a launch flag — check the
app's settings/docs). Verify it's reachable:

```bash
curl -s http://127.0.0.1:9222/json/version
```

## Install

```bash
git clone https://github.com/delight0517/aside-cdp-bridge.git
cd aside-cdp-bridge
npm install
```

## Usage

```bash
# 1. Open a new isolated tab and navigate — prints a target id
node scripts/aside-nav.js "https://example.com"
# → 0ED759DB2840ECD606A444D6B47090D3

# 2. Read that tab's text or a specific element's value
node scripts/aside-read.js <target-id>                 # full document.body.innerText
node scripts/aside-read.js <target-id> "input[name=q]"  # specific element (value or innerText)

# 3. Click or type (non-Latin text supported)
node scripts/aside-act.js <target-id> "button.submit" click
node scripts/aside-act.js <target-id> "textarea[name=q]" type "hello world"

# 4. Close the tab when done
node scripts/aside-close.js <target-id>
```

The CDP endpoint can be overridden with the `ASIDE_CDP_URL` environment
variable (defaults to `http://127.0.0.1:9222`).

## Safety design

- Every script opens or operates on **its own isolated tab** (`browser.newPage()`).
  Tabs the user already has open (logged-in sessions, work in progress) are
  never touched — target ids are always explicit and scoped to the tab the
  script itself created.
- Text input uses `document.execCommand('insertText', ...)` instead of
  simulated keydown events, so it won't break IME-based input methods
  (Korean, Japanese, Chinese, etc.).

## Known gotchas

- Occasionally `browser.pages()` won't see a tab created by a different
  process/connection. Workaround: close it directly via the REST API —
  `curl "http://127.0.0.1:9222/json/close/<target-id>"`.
- Aside typically has many extension/service-worker/background tabs open at
  once (`/json/list` can return 40+ entries). Always pass target ids
  explicitly between script invocations rather than guessing by index.

## How this was built

Approach A (`puppeteer.connect({ browserURL })` via `puppeteer-core`) worked
on the first real attempt — it connected within minutes, and standard
Puppeteer APIs (`newPage`, `goto`, `click`, `evaluate`) worked against Aside
unmodified. No extra browser download is needed since `puppeteer-core` alone
is used (a few MB). Because approach A already met every requirement, two
other approaches (raw CDP over WebSocket via `chrome-remote-interface`, and
reusing a Chrome-extension-based MCP) were not attempted — they were replaced
before being needed.

## License

MIT — see [LICENSE](LICENSE).
