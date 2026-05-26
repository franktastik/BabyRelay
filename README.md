# BabyMinimo

BabyMinimo is the BabyRelay mobile app workspace. Follow `rules.md` before starting implementation work and use `AGENTS.md` for the full operating guide.

## Local Runtime Surfaces

- GoalBuddy board: `http://127.0.0.1:41737/`
- Browser-hosted iOS simulator: `http://127.0.0.1:3200/?device=B2C19543-60E2-489E-8E08-4E3F775AD6A0`
- Firebase Emulator UI: `http://127.0.0.1:4000/`
- Firebase Auth UI: `http://127.0.0.1:4000/auth`

## OpenCode Delegation Default

For bounded low- and medium-risk implementation tasks, prefer `opencode-go/qwen3.7-max` after a current-session smoke test:

```sh
opencode run --model opencode-go/qwen3.7-max --format json "Reply with exactly: QWEN37_OK"
```

`opencode-go/qwen3.7-max` is text-only. Use it for code, tests, and docs. Do not use it for screenshot interpretation, visual judging, or final UI acceptance. Codex owns simulator/browser visual QA and final accept/tighten/reject decisions.

Fallback order:

1. `opencode-go/glm-5.1`
2. `opencode-go/qwen3.6-plus`
3. `opencode-go/deepseek-v4-flash`
4. `opencode-go/deepseek-v4-pro`
5. `opencode-go/kimi-k2.6` only after a passing JSON-schema smoke gate
