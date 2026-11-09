# GhostDeck — Devpost submission copy

## Inspiration

A page can describe an incident response, but a rehearsal should let someone pause, look at evidence and decide. GhostDeck brings back the card-and-link spirit of HyperCard for that moment of uncertainty. Small teams can explore a branching scenario and have a concrete conversation about what shaped their choices.

## What it does

GhostDeck runs as a local-first browser application. Open one of two clearly fictional stacks, reveal evidence, choose a branch and reach an authored ending. The debrief records every choice and destination, alongside the evidence available and whether its panel was open at the moment of decision. Export the report as JSON.

Author mode lets a facilitator edit card text, evidence, choices and destinations with ordinary form controls. Preview a draft and validate the whole graph before applying. Imported stacks are checked for malformed data, duplicate IDs, broken links, unreachable cards, limits and invalid terminal cards. Invalid imports preserve the current rehearsal. A valid author edit starts a clean history.

## How we built it

The application uses dependency-free JavaScript modules, semantic HTML, original CSS and two newly authored fictional scenario graphs. A shared pure engine handles validation and state transitions. Browser persistence explicitly serializes Maps and Sets and reconstructs a validated path on restore. Imported text is assigned through textContent or form values.

Kiro CLI actually read the project's requirements and steering and produced the initial engine, 39 tests, scenario data, implementation drafts, design and task plan. Codex supplied orchestration, independent acceptance tests, corrections and the final workbench integration. The root .kiro directory and an honest Kiro usage record are public. We did not use Crew, MCP, powers or automatic Kiro hooks and do not claim them.

## Challenges and what we learned

A normal-path test suite was not enough. Independent malformed imports exposed null-handling errors; persistence tests caught Map/Set data loss; review caught unsafe HTML interpolation in the author interface. We corrected those issues and verified actual Chrome operations rather than assuming generated code was ready. The strongest result of specs was a set of concrete invariants to challenge the implementation against.

## What we verified

53 automated tests passed. In Chrome we followed Investigate → Reduce pool → Monitor, refreshed and recovered the three-decision terminal path, inspected evidence-open state, edited and previewed a card, and parsed the actual exported stack and report. Invalid imports left the active session intact. HTML-looking test data remained literal in play and author views. Both fictional stacks loaded successfully.

## What is next

The next useful step is a real facilitator study: can a small team author a scenario and use the debrief to support a better discussion? We have not conducted that study and make no training-effectiveness claim. Future work could add versioned stacks and optional multiplayer facilitation.

## Disclosure and limits

All sample people, metrics, scenarios and outcomes are fictional. This is a rehearsal tool with no production integration or professional policy validation. It does not import legacy HyperCard files or emulate HyperCard. No Apple assets, stock footage or copyrighted music were used. The demonstration uses synthetic narration and edited captures of the real application. No existing competition project code was reused. Source is MIT licensed.

Demo: https://tomhao10225101490.github.io/GhostDeck-Kiroween/
Source: https://github.com/Tomhao10225101490/GhostDeck-Kiroween
Video: https://youtu.be/hhzNAfLD_MM
Kiro record: https://github.com/Tomhao10225101490/GhostDeck-Kiroween/blob/main/docs/KIRO_USAGE.md
