# Actual Kiro development record

GhostDeck was started on November 9, 2026 during the Kiroween 2026 submission period. Kiro was used as a development tool; it is not an app runtime dependency.

## Inputs and actual implementation

- Codex prepared the original project brief, acceptance requirements and `/.kiro/steering/product.md` guardrails.
- Kiro CLI was installed from the official `cli.kiro.dev` installer and authenticated with the entrant's existing GitHub identity.
- Kiro CLI, using the available Qwen3 Coder Next model, read the brief, requirements and steering. It authored `design.md`, `tasks.md`, the initial pure state engine, 39 engine tests, both fictional scenario graphs, the phosphor palette, and initial storage, renderer, HTML and application modules.
- Codex independently added failing acceptance tests and reviewed the generated code. This found null import crashes, unguarded transitions, input interpolation in the author UI and incorrect Map/Set persistence. Codex fixed the engine, rewrote storage serialization/reconstruction, replaced the renderer/application integration with a text-safe workbench, and completed additional tests and browser validation.
- This workflow used file-based specs and steering. No custom Kiro agent, MCP server, powers, Crew, automatic agent hook or Kiro property-based testing was used. Their presence is not claimed.

## Evidence

The private local build log and an archived snapshot of Kiro's initial generated source are retained for audit. `docs/evidence/kiro-initial-sha256.json` records initial file hashes before integration corrections. The public `.kiro` tree contains the actual requirements, generated design/tasks and steering used in that run.

The initial CLI permission configuration rejected file writes; a subsequent run produced the source. Later, the Kiro service returned a temporary account-security suspension and required support verification. Development continued from the already generated source without bypassing that restriction or claiming additional Kiro runs.

## What worked and what was learned

The spec made graph integrity, independent session state, explicit evidence records and accessible authoring concrete before implementation. Steering fixed the privacy and zero-runtime-service boundaries. Generated tests helped exercise normal paths, while independent adversarial imports and state roundtrips revealed gaps. The final implementation required review and browser verification; generated code was not treated as verified by default.

## Disclosures

Codex supplied orchestration, original product design and final integration; Kiro supplied the documented initial implementation. Both were used as AI development assistance. All source, text and fictional scenarios were created for this project. No real user interviews, live incident evidence, measured training benefit or legacy HyperCard interoperability are claimed.
