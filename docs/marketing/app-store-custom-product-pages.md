# BabyMinimo App Store Custom Product Pages

This plan supports `PBI-072` and GoalBuddy task `T358`.

## Goal

Use one BabyMinimo app with multiple App Store entry points for different parent motivations. The default App Store page stays broad, while Custom Product Pages focus on the exact reason a parent clicked from search or ads.

Core principle:

- Do not market only by feature list.
- Market by parent intent.
- Each page should feel like a specific solution, even though all pages lead to the same app.

Default positioning:

> BabyMinimo is a simple baby tracker for feeding, sleep, diapers, growth, memories, and shared household care.

## Custom Product Page Set

| ID | Page | Target motivation | Page angle | Feature activation target |
| --- | --- | --- | --- | --- |
| `newborn_tracker` | Newborn Tracker | A new parent feels overwhelmed and needs to track everything. | Track feeds, diapers, sleep, and growth in one calm baby log. | First care event logged and Timeline viewed. |
| `feeding_tracker` | Breastfeeding & Bottle Tracker | A parent needs to know when and how much the baby ate. | Track breastfeeding, bottle feeds, pumping, formula, and feeding history. | Feed log created with side, duration, amount, or note. |
| `sleep_tracker` | Baby Sleep Tracker | A parent wants to understand naps, night sleep, wake windows, and routines. | Track sleep and notice patterns without promising to fix baby sleep. | Sleep log created and sleep history viewed. |
| `shared_baby_log` | Shared Baby Log | Parents, partners, or household members need to stay updated together. | Keep one shared baby timeline for handoffs and busy routines. | Household member invited or shared log viewed. |
| `memories_milestones` | Baby Memories & Milestones | A parent wants emotional value, not only practical tracking. | Save milestones, photos, notes, and tiny daily memories. | Growth Timeline moment added or album export opened. |
| `doctor_visit_history` | Doctor Visit Baby History | A parent wants accurate information before an appointment. | Keep clear baby records for feeding, diapers, sleep, growth, and notes. | Timeline filtered/reviewed and notes added. |

## Screenshot Copy

Each Custom Product Page should start with 5 English screenshot compositions. These can reuse the same visual system, but the headline, source screen, screen order, and emotional hook should match the page intent.

### Newborn Tracker

1. Everything your newborn needs, in one timeline
2. Log feeding, diapers, sleep, and growth fast
3. See patterns without remembering everything
4. Share updates with your partner or care circle
5. Feel more organized as a new parent

Best traffic: TikTok, Instagram Reels, Apple Search Ads for `newborn tracker`, `baby tracker`, `new parent app`.

### Breastfeeding & Bottle Tracker

1. Never forget the last feed
2. Track breast, bottle, pumping, and formula
3. See feeding history by time and amount
4. Share feeding logs with your partner
5. Helpful records for doctor or midwife visits

Feature requirement: breastfeeding side, duration, bottle amount, formula, pumped milk, and notes must be real or release-ready before launch.

### Baby Sleep Tracker

1. Understand your baby's sleep rhythm
2. Log naps and night sleep in seconds
3. See wake windows and sleep patterns
4. Build a calmer daily routine
5. Share sleep updates with your care circle

Compliance rule: use words like `understand`, `track`, `notice patterns`, and `support routines`. Do not claim the app fixes sleep.

### Shared Baby Log

1. One baby log for the whole family
2. Invite your partner or household member
3. See who logged each feed, diaper, or nap
4. No more guessing what happened today
5. Perfect for handoffs and busy routines

Launch gate: this page should not receive paid traffic until shared household functionality is real or very close to release.

### Baby Memories & Milestones

1. Capture the moments you never want to forget
2. Save first smiles, first steps, and daily notes
3. Add photos to your baby timeline
4. Mix practical logs with beautiful memories
5. Build a gentle record of your baby's first years

Best traffic: Instagram, Pinterest, TikTok, parent creator pages, and memory-book angles.

### Doctor Visit Baby History

1. Bring better baby history to appointments
2. Track feeding, diapers, sleep, and growth
3. Add notes for symptoms and concerns
4. Review patterns before doctor visits
5. Feel prepared when asked how baby has been

Compliance rule: this page can say `track`, `record`, `review`, and `prepare`. It must not claim diagnosis, treatment, clinical decisions, or medical outcomes.

## Local Code Implementation

T358 adds the local, typed implementation needed before App Store Connect work:

- `src/features/appStore/customProductPages.ts` defines the six Custom Product Page IDs, screenshot messages, keyword clusters, campaign angles, feature activation targets, success metrics, readiness gates, and priority locale rollout list.
- `src/features/analytics/appStoreAttribution.ts` records local `app_store_attribution_received` and `feature_activated` events with stable properties for future attribution joins.
- `src/features/appStore/customProductPages.test.ts` verifies page count, stable IDs, five screenshots per page, priority locales, and compliance-sensitive gates.
- `src/features/analytics/appStoreAttribution.test.ts` verifies attribution properties and promised-feature activation timing.

This remains local/non-production. It does not write to App Store Connect, start ads, add StoreKit behavior, deploy Firebase, or add a production analytics SDK.

## Analytics Code Plan

Use the typed Custom Product Page registry before App Store Connect work:

```ts
type AppStoreCustomProductPageId =
  | 'newborn_tracker'
  | 'feeding_tracker'
  | 'sleep_tracker'
  | 'shared_baby_log'
  | 'memories_milestones'
  | 'doctor_visit_history'
```

Add attribution properties to onboarding/session analytics:

```json
{
  "app_store_page": "sleep_tracker",
  "campaign_source": "tiktok",
  "campaign_angle": "sleep_tracking",
  "locale": "en-US"
}
```

Add feature activation tracking:

```json
{
  "event": "feature_activated",
  "feature": "sleep_tracking",
  "app_store_page": "sleep_tracker",
  "time_to_activation_minutes": 4
}
```

Implementation notes:

- Keep the first code slice local and typed. Do not require a production analytics SDK migration.
- Use stable page IDs so ad links, App Store Connect campaign links, and feature activation reports can join later.
- Track installs and feature activation separately. A page that gets installs but weak activation or retention may be misleading.

## Screenshot Plan

Yes, screenshots are required for launch-quality Custom Product Pages.

First wave:

- 6 pages
- 5 screenshots per page
- 30 English screenshot compositions

The screenshots can share templates, but each page needs:

- page-specific headline copy
- different feature emphasis
- destination-specific screen order
- truthful in-app state
- final visual QA against approved BabyMinimo screenshot standards

Localized screenshots should show localized screenshot text and, where practical, localized in-app UI inside the phone frame.

## Translation Plan

Yes, Custom Product Pages should be translated, but not all pages into all supported languages immediately.

Doing 6 pages x 35 supported locales would create 210 localized page sets before there is conversion data. Instead:

| Phase | Translation scope | Reason |
| --- | --- | --- |
| Phase 1 | English for all 6 pages | Fast validation and screenshot production. |
| Phase 2 | Top 3 pages into 8 to 10 priority markets | Better return on translation and screenshot work. |
| Phase 3 | Winning pages into all supported App Store locales | Scale only pages that prove conversion and retention. |

Priority markets:

1. English
2. Spanish
3. French
4. German
5. Portuguese
6. Italian
7. Dutch
8. Polish
9. Turkish
10. Arabic

Translation rule:

- Localize the emotional promise, not just the literal words.
- Translate screenshot text, promotional text, subtitle, keyword clusters, and visible app UI shown in localized screenshots.
- Usually keep the app name unchanged unless a locale-specific issue is discovered.

Example:

- Source: `Never forget the last feed`
- Better localization direction: `Always know when your baby last ate`

## Measurement

Track each page by:

- impressions
- product page views
- install conversion
- trial start rate
- subscription rate
- Day 1 retention
- promised feature activation
- time to first promised feature activation

Ad-to-page mapping:

| Ad angle | Destination |
| --- | --- |
| New parent? Track everything easily | Newborn Tracker |
| Never forget the last feed | Breastfeeding & Bottle Tracker |
| Understand baby sleep patterns | Baby Sleep Tracker |
| Share baby logs with your partner | Shared Baby Log |
| Save baby milestones beautifully | Baby Memories & Milestones |
| Prepare better for doctor visits | Doctor Visit Baby History |

## Non-Goals

- Do not create separate apps for each motivation.
- Do not write to App Store Connect in this PBI.
- Do not launch production ads in this PBI.
- Do not add StoreKit, pricing, subscription, or billing changes.
- Do not make medical diagnosis, treatment, or sleep-cure claims.
