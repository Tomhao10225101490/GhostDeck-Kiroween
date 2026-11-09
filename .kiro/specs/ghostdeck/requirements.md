# GhostDeck acceptance requirements
1. A first-time visitor can immediately choose and play either fictional scenario without signing in.
2. A choice records its exact source/destination and evidence snapshot; invalid choices leave the session unchanged.
3. A participant can reveal evidence, restart, reach a terminal card, and inspect a transparent debrief.
4. Author mode can change card text and routing, validate it, and play the edited deck.
5. A valid exported deck can be imported without loss. Invalid JSON or invalid graph returns a useful error and preserves the previous deck.
6. Oversized files, duplicate card IDs, broken links, nonterminal dead ends, and unreachable cards receive diagnostics. Cycles are allowed and bounded by a maximum session length rather than rejected as always invalid.
7. Browser persistence errors do not break the working session. Keyboard controls and small screens remain usable.
8. Tests cover graph validation, session invariants, independent histories, export roundtrip, malformed imported data, and attempts to cross a terminal card.
9. The final app and documentation must describe only features actually implemented and tested.
