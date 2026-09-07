# AGENTS.md — read this file only, nothing else

You are an AI coding agent that needs to control the Aside browser (or any
Chromium app with `--remote-debugging-port`). Do not read README.md or any
other file first — everything you need to act is below.

## 1. Check the target is reachable (1 call)

```bash
curl -s http://127.0.0.1:9222/json/version
```

- Got JSON back → continue to step 2.
- Connection refused / empty → Aside isn't running with the debug port open.
  Stop and tell the user: "Aside must be launched with
  `--remote-debugging-port=9222` (check Aside's settings/launch flags)."
  Do not try to start it yourself.

## 2. Install (only if `node_modules` missing)

```bash
git clone https://github.com/delight0517/aside-cdp-bridge.git && cd aside-cdp-bridge && npm install
```

## 3. The 4 commands — this is the entire API

```bash
node scripts/aside-nav.js "<url>"                              # -> prints target-id
node scripts/aside-read.js <target-id> ["<css-selector>"]      # no selector = full page text
node scripts/aside-act.js <target-id> "<css-selector>" click
node scripts/aside-act.js <target-id> "<css-selector>" type "<text>"
node scripts/aside-close.js <target-id>                        # cleanup, always safe to call
```

Typical flow: `nav` → `read` (to find selectors / confirm content) → `act`
(click/type) → `read` (verify result) → `close`.

Every script only ever touches the one tab it created via `nav` — it never
touches tabs the user already has open. Always pass the exact `target-id`
string printed by `nav`; don't guess it from `/json/list` index order.

## 4. Errors you will hit, and the fix

| Error | Fix |
|---|---|
| `ERROR connect ECONNREFUSED 127.0.0.1:9222` | Debug port not open — see step 1, stop and ask user. |
| `Cannot find module 'puppeteer-core'` | Run `npm install` in the repo root (step 2). |
| `target not found: <id>` | Tab was closed or belongs to a different CDP connection. Re-run `aside-nav.js` to get a fresh target-id — don't reuse stale ids across long gaps. |
| `waiting for selector "..." failed: timeout` | Selector wrong or page not loaded yet — `aside-read.js <target-id>` first (no selector) to see the actual page text/DOM before retrying `act`. |

Override the CDP endpoint with `ASIDE_CDP_URL` if not using the default port.

Full background/rationale (not needed to operate the tool): see README.md.
