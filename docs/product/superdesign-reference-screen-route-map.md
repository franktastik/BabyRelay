# Superdesign Reference Screen Route Map

This map is the owner-visible parity record for PBI-073/T359. Every approved screenshot in `docs/product/superdesign-reference-assets/screenshots1/` must have one row here and one matching entry in `src/features/superdesign/referenceScreens.ts`.

Status meanings:

- `implemented`: reachable in the app as a primary or secondary screen.
- `implemented-t359`: added or wired during T359.
- `existing-modal`: reachable through an existing modal route or contextual action.

| Screenshot | Surface | Route | Status |
| --- | --- | --- | --- |
| `Screenshot 2026-05-22 at 23.15.29.png` | Login | `/login` | implemented |
| `Screenshot 2026-05-22 at 23.15.57.png` | Signup | `/signup` | implemented |
| `Screenshot 2026-05-22 at 23.16.06.png` | Onboarding welcome | `/welcome` | implemented |
| `Screenshot 2026-05-22 at 23.16.14.png` | Onboarding problem | `/problem` | implemented |
| `Screenshot 2026-05-22 at 23.16.20.png` | Onboarding benefits | `/benefits` | implemented |
| `Screenshot 2026-05-22 at 23.16.27.png` | Add baby | `/add-baby` | implemented |
| `Screenshot 2026-05-22 at 23.16.40.png` | Onboarding priorities | `/priorities` | implemented |
| `Screenshot 2026-05-22 at 23.16.47.png` | Invite household member | `/invite-caregiver` | implemented |
| `Screenshot 2026-05-22 at 23.17.00.png` | Onboarding preview | `/preview` | implemented |
| `Screenshot 2026-05-22 at 23.17.10.png` | Home | `/home` | implemented |
| `Screenshot 2026-05-22 at 23.17.20.png` | Handoff | `/handoff` | implemented |
| `Screenshot 2026-05-22 at 23.17.27.png` | Quick log | `/modals/quick-log` | existing-modal |
| `Screenshot 2026-05-22 at 23.17.38.png` | Timeline | `/timeline` | implemented |
| `Screenshot 2026-05-22 at 23.17.53.png` | Family | `/family` | implemented |
| `Screenshot 2026-05-22 at 23.18.11.png` | Settings | `/settings` | implemented |
| `Screenshot 2026-05-22 at 23.18.22.png` | Widgets | `/widgets` | implemented |
| `Screenshot 2026-05-22 at 23.18.30.png` | Activity states | `/states` | implemented |
| `Screenshot 2026-05-22 at 23.18.44.png` | Weekly insights chart | `/insights` | implemented-t359 |
| `Screenshot 2026-05-22 at 23.19.04.png` | Milestone celebration | `/milestones` | implemented-t359 |
| `Screenshot 2026-05-22 at 23.19.33.png` | Milestone dashboard | `/milestones` | implemented-t359 |
| `Screenshot 2026-05-22 at 23.21.07.png` | Plans | `/plans` | implemented |
| `Screenshot 2026-05-22 at 23.21.18.png` | Reminder list | `/reminders` | implemented |
| `Screenshot 2026-05-22 at 23.21.36.png` | Reminder creation | `/reminders` | implemented |
| `Screenshot 2026-05-22 at 23.21.45.png` | Infant journal | `/journal` | implemented-t359 |
| `Screenshot 2026-05-22 at 23.22.07.png` | Help and support | `/support` | implemented-t359 |
| `Screenshot 2026-05-22 at 23.22.20.png` | Account | `/account` | implemented |
| `Screenshot 2026-05-22 at 23.22.38.png` | Delete account confirmation | `/modals/delete-account-confirm` | existing-modal |
| `Screenshot 2026-05-22 at 23.22.56.png` | Account signed-out state | `/account` | implemented |
| `Screenshot 2026-05-22 at 23.23.16.png` | Breastfeed log | `/modals/log-breastfeed` | existing-modal |
| `Screenshot 2026-05-22 at 23.23.28.png` | Bottle log | `/modals/log-bottle` | existing-modal |
| `Screenshot 2026-05-22 at 23.23.45.png` | Diaper log | `/modals/log-diaper` | existing-modal |
| `Screenshot 2026-05-22 at 23.24.02.png` | Medication log | `/modals/log-medication` | existing-modal |
| `Screenshot 2026-05-22 at 23.24.26.png` | Sleep timer | `/modals/log-sleep` | existing-modal |
| `Screenshot 2026-05-22 at 23.24.44.png` | Sleep log form | `/modals/log-sleep` | existing-modal |
| `Screenshot 2026-05-22 at 23.25.00.png` | Weekly insights empty | `/insights` | implemented-t359 |
| `Screenshot 2026-05-22 at 23.25.35.png` | Weekly insights progress | `/insights` | implemented-t359 |
| `Screenshot 2026-05-22 at 23.25.52.png` | Baby activity | `/activity` | implemented |
| `Screenshot 2026-05-22 at 23.26.09.png` | Support success | `/support` | implemented-t359 |
| `Screenshot 2026-05-22 at 23.26.23.png` | Notification priming | `/notification-priming` | implemented |
| `Screenshot 2026-05-22 at 23.26.33.png` | App states | `/states` | implemented |
| `Screenshot 2026-05-23 at 00.47.09.png` | Growth album export | `/modals/export-album` | existing-modal |

## T359 Decisions

- Added Settings navigation entries for Weekly Insights, Milestones, Infant Journal, and Help & Support.
- Implemented local/demo screens for Weekly Insights chart, empty, and progress states; Milestones dashboard and celebration; Infant Journal prompt expansion; Help & Support and success confirmation.
- Kept all new surfaces local/demo-only with no production Firebase, StoreKit, App Store Connect, auth/security, or billing changes.
- Added a unit test that fails when the checked-in reference screenshot folder and the route map drift.

## Visual QA

T359 visual smoke evidence should be stored under `docs/qa/screenshots/pbi-073/` when captured. Scrollable screens need top/middle/bottom evidence before release screenshot production.
