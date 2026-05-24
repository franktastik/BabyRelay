# BabyMinimo Complete App Build

## Objective

Build the complete BabyMinimo app in verified vertical slices using `docs/product/babyminimo-pbi-codex-goalbuddy-pack.md`, `docs/product/babyminimo-visual-qa-contract.md`, and the approved screenshots in `docs/product/superdesign-reference-assets/screenshots1/`.

The current implementation uses Firebase Emulator for local auth, household/baby records, and care events. Production Firebase remains out of scope until the app UI and local flows are complete. Growth Timeline remains local-only in v1 and must stay inside Timeline.

## Original Request

"Implement all UI and functionality of the BabyMinimo app end to end. Always test each feature/screen. Use GoalBuddy and continue without owner help where possible."

## Intake Summary

- Input shape: `specific`
- Audience: BabyMinimo builders and demo users
- Authority: `requested`
- Proof type: `demo`
- Completion proof: The local app runs end to end in iOS simulator and covers auth, onboarding, Home, quick logging, Timeline, Growth Timeline, Handoff, reminders, caregivers, settings, plans, account/sign-out, states, and analytics hooks with tests plus simulator screenshot receipts.
- Likely misfire: Keeping the old fast-demo scope, accepting approximate visual matches, or completing code without per-screen simulator evidence.
- Blind spots considered:
  - Kimi K2.6 currently fails the OpenCode JSON Schema smoke gate and must not be used for implementation until it passes.
  - GLM-5.1 and Qwen 3.6 Plus pass local OpenCode smoke gates as of 2026-05-23.
  - Firebase is deferred, so callables/listeners must be expressed as replaceable adapters or mocks.
  - Growth Timeline remains local-only and inside Timeline.
  - A demo can still rot if verification is only visual and not route/runtime checked.
- Existing plan facts:
  - Use the fast demo order: Foundation, Auth and onboarding, Home, Quick Log plus breastfeed and diaper, Timeline, Handoff, Growth Timeline/Add Moment.
  - Use GoalBuddy to manage the work.
  - Use Codex as planner/reviewer.
  - Use GLM-5.1 for bounded OpenCode implementation when its smoke gate passes.
  - Use Qwen 3.6 Plus as the safe OpenCode fallback.
  - Use Kimi K2.6 only if its JSON Schema smoke gate passes.
  - Do not wire Firebase now.

## Goal Kind

`specific`

## Current Tranche

Complete app tranche: continue successive safe verified slices until the approved BabyMinimo app flow is implemented end to end with Firebase Emulator/local-only boundaries and visual QA evidence.

## Non-Negotiable Constraints

- Use `docs/product/babyminimo-pbi-codex-goalbuddy-pack.md` as the source of truth.
- Use `docs/product/babyminimo-visual-qa-contract.md` as the visual QA source of truth.
- Use `docs/product/superdesign-reference-assets/screenshots1/` as the approved visual source of truth.
- Use `docs/product/screen-contracts/` for screen-specific acceptance requirements when present.
- Preserve the BabyMinimo Superdesign mockup and logo direction.
- Do not invent a new product hierarchy, tab structure, or visual identity.
- Growth Timeline stays inside Timeline and is not a separate tab.
- Growth Timeline photos are local-only in v1.
- Production Firebase is not wired in this tranche.
- Firebase Emulator is local-only and should remain the backend for auth/shared care work until production wiring is explicitly requested.
- Firebase-facing boundaries should remain replaceable adapters.
- Home focuses on what happened last and quick actions.
- Handoff focuses on current state, due soon, latest note, and overnight readability.
- Use Bun commands where applicable.
- GLM-5.1 is the preferred bounded OpenCode implementation model when `opencode run --model opencode-go/glm-5.1 --format json "Reply with exactly: GLM_OK"` succeeds.
- Qwen 3.6 Plus is the safe OpenCode fallback when `opencode run --model opencode-go/qwen3.6-plus --format json "Reply with exactly: QWEN_OK"` succeeds.
- Kimi K2.6 implementation handoffs are blocked until `opencode run --model opencode-go/kimi-k2.6 --format json "Reply with exactly: KIMI_OK"` succeeds.
- UI work is not complete without simulator screenshot evidence compared against the approved `screenshots1/` mockup.
- For scrollable screens, capture top, middle, and bottom positions when content exceeds one viewport.
- If exact visual matching is blocked by a missing asset, stop and list the missing asset instead of inventing a substitute.

## Stop Rule

Stop only when a final audit proves the complete app tranche is implemented and verified.

Do not stop after planning, discovery, or Judge selection if a safe Worker task can be activated.

Do not stop after a single verified Worker slice when the broader demo outcome still has safe local follow-up slices.

## Canonical Board

Machine truth lives at:

`docs/goals/babyminimo-fast-demo/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/babyminimo-fast-demo/goal.md.
```

## PM Loop

On every `/goal` continuation:

1. Read this charter.
2. Read `state.yaml`.
3. Read `docs/product/babyminimo-pbi-codex-goalbuddy-pack.md`.
4. Read `docs/product/babyminimo-visual-qa-contract.md` for UI tasks.
5. Work only on the active board task.
6. Keep production Firebase deferred and use Firebase Emulator for local auth/shared care work. Verify the emulator UI at `http://127.0.0.1:4000/auth` when auth/user state matters.
7. Use Codex for planning and final review.
8. Use GLM-5.1 for bounded OpenCode implementation if its smoke gate passes; use Qwen 3.6 Plus as the safe fallback; keep Kimi blocked until its JSON Schema smoke gate passes.
9. For UI tasks, use the browser-hosted simulator at `http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0`, capture simulator screenshot evidence, and list known visual differences before accepting.
10. Write a compact task receipt.
11. Update the board.
12. Advance to the next safe demo slice until final audit proves completion.
