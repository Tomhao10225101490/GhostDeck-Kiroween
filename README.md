# GhostDeck

**Rehearse the moment before the decision.**

An original, local-first browser application for small-team branching decision rehearsals. Created November 9, 2026 for **Kiroween 2026 — Resurrection**. GhostDeck revives the card-and-link interaction of HyperCard as modern, inspectable rehearsal stacks. It is not a HyperCard emulator and uses no Apple assets.

[Open the app](https://tomhao10225101490.github.io/GhostDeck-Kiroween/) · [Watch the 2:33 demo](https://youtu.be/hhzNAfLD_MM)

## Try a complete flow

1. Open **The midnight release**. All situations and outcomes are fictional.
2. Reveal the first card's evidence, then choose **Investigate errors first**.
3. Choose **Reduce connection pool size**, then **Monitor briefly**. Number keys work when focus is outside form fields and buttons.
4. Open **Debrief**. Each decision records its source, chosen option, destination, evidence available, and whether the evidence panel was open when the choice was made.
5. Refresh: the validated rehearsal is reconstructed from browser storage.
6. In **Author**, select a card, edit its text, evidence, choices and destinations, preview it, and validate the whole stack before applying. Applying starts a fresh history.
7. Export/import stack JSON, or export a session debrief. Invalid imports leave the active session intact.

A second fictional workplace scenario demonstrates the same format. A stack may contain up to 100 cards, 20 evidence items and 10 choices per card; imported JSON is limited to 1 MiB. Cycles are allowed, with a 200-decision session limit. Every card must be reachable from the first card.

## Run locally

Requires Python 3 for the static server and Node.js 22+ for tests. No dependency installation, build step, account, API key or backend is required.

```sh
npm test
npm start
```

Open http://localhost:8768. Serve `dist/` from any static server; opening `index.html` directly with `file://` will not load the bundled JSON scenarios.

## Architecture and privacy

- `dist/js/engine.js`: pure graph validation and immutable session transitions.
- `dist/js/storage.js`: explicit Map/Set serialization, validated replay on restore, safe storage failure handling.
- `dist/js/app.js`: accessible DOM interface. Imported strings use `textContent` or form `.value`, never HTML insertion.
- `dist/data/`: two newly authored fictional scenario graphs.
- Browser localStorage saves the last active rehearsal on this origin. Export files yourself to retain copies. “Clear saved rehearsal” clears the saved copy; the currently open session remains in memory. Later actions save it again.
- No analytics, remote fonts, cloud inference, production system integration or runtime third-party requests are included. Static hosting providers still receive ordinary web requests.

## Kiro and AI disclosure

Kiro CLI was actually used with the project brief, requirements and steering. It produced the initial engine, tests, scenario data, storage/renderer/application drafts, design/tasks and visual palette. Codex orchestrated development, independently reviewed the output, corrected transition/import/storage problems, and completed the accessible workbench and validation. The shipped app does not call Kiro at runtime. Details: [Kiro development record](docs/KIRO_USAGE.md), [verification](docs/VERIFICATION.md).

No existing competition project code or submission materials were reused. The MIT license wording and standard GitHub Actions configuration are standard infrastructure. There are no production libraries or externally sourced image/font assets. The demo uses disclosed synthetic narration and actual edited screen captures.

## Limits

Scenario outcomes are authored examples, not live incident data or forecasts. The tool has not been evaluated with real teams, and no training effectiveness is claimed. It does not execute commands, verify organizational policy, synchronize teams, host accounts, import legacy HyperCard files, or provide professional security advice. Sensitive workplace data should not be added casually; exported files and browser storage are accessible to the person using the device.

MIT licensed. Copyright 2026 Hao Zhong.
