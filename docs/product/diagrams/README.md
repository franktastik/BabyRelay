# BabyMinimo Product Diagrams

Editable diagram sources live here so product architecture can stay aligned with the PBI roadmap.

## Diagrams

- `babyminimo-deployment-infrastructure.mmd`: deployment and infrastructure overview for mobile app, local device storage, Firebase, app stores, and marketing website.
- `babyminimo-screen-navigation.mmd`: screen-level navigation map for auth, onboarding, tabs, modals, and settings subflows.
- `babyminimo-data-flow.mmd`: end-to-end sequence for auth, onboarding, care events, handoff summary, local Growth Timeline, Timeline merge, and sign out.
- `babyminimo-uml-class-diagram.mmd`: domain and service class model for users, households, memberships, babies, care events, reminders, Growth Timeline, and handoff summary.
- `babyminimo-system-architecture.mmd`: client, local device, Firebase backend, and presentation-layer architecture.
- `babyminimo-end-to-end-user-flow.mmd`: full user journey from splash/auth through onboarding, core app use, settings, and sign out.

## PBI Alignment

Use the deployment/infrastructure diagram when planning or reviewing:

- `PBI-050`: Production Firebase and security hardening.
- `PBI-052`: E2E and visual release QA.
- `PBI-053`: Release and App Store readiness.
- `PBI-055`: Native subscriptions and Apple IAP.
- `PBI-061`: Hybrid local and Firebase push notification provider.

Use the screen navigation diagram when planning or reviewing:

- `PBI-005` through `PBI-013`: authentication and onboarding.
- `PBI-014` through `PBI-024`: Home, tab shell, care logging, and Timeline.
- `PBI-030` through `PBI-038`: Handoff, Reminders, Family/Caregivers, Settings, Plans, Account, and Sign Out.
- `PBI-051`: Full interaction hardening.
- `PBI-052`: E2E and visual release QA.

Use the data-flow diagram when planning or reviewing:

- `PBI-002`: Firebase client setup.
- `PBI-010`: Add baby onboarding.
- `PBI-017` through `PBI-024`: care event creation, reads, and Timeline merging.
- `PBI-025` through `PBI-028`: local-only Growth Timeline.
- `PBI-029`: Handoff summary backend endpoint.
- `PBI-050`: Production Firebase and security hardening.

Use the UML class diagram when planning or reviewing:

- `PBI-002`: Firebase client setup.
- `PBI-010`: Add baby onboarding.
- `PBI-017` through `PBI-024`: care event model and Timeline behavior.
- `PBI-029`: Handoff summary backend endpoint.
- `PBI-031` and `PBI-032`: Reminder model and reminders list.
- `PBI-033`: Membership and caregiver model.
- `PBI-050`: Firestore production data model and security rules.

Use the system architecture diagram when planning or reviewing:

- `PBI-001` through `PBI-004`: foundation, app structure, local storage, and shared UI.
- `PBI-025` through `PBI-028`: local Growth Timeline architecture.
- `PBI-050`: Firebase production hardening.
- `PBI-058` and `PBI-059`: cost/performance discovery and lazy-loading.
- `PBI-061`: hybrid local and Firebase notification architecture.

Use the end-to-end user flow when planning or reviewing:

- `PBI-005` through `PBI-013`: auth and onboarding path.
- `PBI-014` through `PBI-038`: core app flow.
- `PBI-039` through `PBI-041`: empty, loading, and error states.
- `PBI-051`: full interaction hardening.
- `PBI-052`: E2E release QA.

## Maintenance Rules

- Keep editable Mermaid or PlantUML source alongside any rendered image.
- Update the diagram when infrastructure responsibilities move between local device storage, Firebase, app stores, or marketing web.
- Do not use the diagram as a substitute for Firestore security rules, release checklists, or privacy review; it is an overview only.
