# GhostDeck — HyperCard, resurrected for decision rehearsal

Created for Kiroween 2026, Resurrection category, November 9, 2026.

## Audience and problem
Small software teams rehearse incident response in chat or static documents. A document cannot remember which evidence a participant saw or explain a decision path. Existing enterprise tabletop tools can be heavy for an individual team lead.

## Product
An original, local-first browser tool that revives the card-and-link interaction of classic HyperCard as an accessible, inspectable branching rehearsal. This is not an emulator or an Apple asset reuse. All visual assets and demonstration scenarios are newly authored.

Three connected modes: play a scenario one decision at a time, inspect/edit the card graph, and replay the evidence and decisions in an exportable debrief. Two clearly fictional scenario decks demonstrate the format: a release rollback and a lost access badge. No real security incident, personal information, production integration, or professional advice.

## Essential behaviors
- Deterministic branch state: no cloud AI or API keys required by end users.
- Each decision records source card, choice, destination, and evidence available at that point.
- Debrief shows tradeoffs and missed evidence, not an invented universal correctness score.
- Author edits title, narrative, evidence, choices and destinations in a form; preview updates.
- JSON import is schema-validated before changing active deck; rejects duplicate IDs, invalid links, empty choices on nonterminal cards, oversized inputs. User text rendered as text, never HTML.
- Export portable deck JSON and session report; browser storage has explicit reset and import failures preserve old state.
- Keyboard navigation, visible focus, reduced motion, responsive layout, semantic headings and buttons.
- Fictional seeds are explicitly labeled; users may author new content. No claims of measured training effectiveness.

## Visual direction
Ghostly phosphor green and warm paper-white on dark ink. Architectural card stack with a small persistent scenario map, a large readable current card, numbered decision controls, and an amber evidence drawer. A restrained haunting interface supports the workflow; avoid excessive animations and Halloween clip art.

## Kiro development evidence
Use Kiro on these specs, record actual generated changes and test results, retain `.kiro` publicly. Disclose Codex orchestration and Kiro implementation honestly. Do not fabricate Kiro-generated artifacts, history, or user testing.

## Submission needs
Working hosted app; public GitHub with MIT license, full source and `.kiro`; English description; public YouTube demo under 3 minutes showing actual browser operation; truthful Kiro usage writeup. Deadline December 4, 2026 14:00 PST / December 5 06:00 Asia/Shanghai.
