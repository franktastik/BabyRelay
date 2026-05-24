# BabyMinimo Emulator Hardening, Cost, And Performance Discovery

Build the pre-production Firebase Emulator hardening phase before full production readiness.

Source of truth:
- `docs/product/babyminimo-pbi-codex-goalbuddy-pack.md`
- `PBI-058`, `PBI-059`, and `PBI-060`
- `docs/product/babyminimo-visual-qa-contract.md` for any UI-affecting work

Outcome:
- BabyMinimo has emulator-only load testing for Firestore read/write/delete behavior.
- Obvious high-read Firestore query patterns are optimized before production.
- Cost-estimation outputs exist for local runs.
- Lazy-loading opportunities are documented or implemented where low-risk.
- Future canceled-subscription heavy-data purge policy exists and is covered by tests.

Constraints:
- Do not connect to production Firebase.
- Do not deploy production Firebase rules or functions.
- Do not run destructive backend purge jobs.
- Keep Growth Timeline photos local-only in v1.
- Use Firebase Emulator at `http://127.0.0.1:4000/`.
- Use the browser-backed simulator at `http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0` if UI changes are made.

Completion proof:
- `bun run test:unit`
- `bun run test:typecheck`
- `bun run test:firebase:load`
- A short receipt summarizing read/write counts, timing, cost-estimation caveats, and remaining optimization candidates.
