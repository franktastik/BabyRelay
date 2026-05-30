export type SuperdesignReferenceStatus = 'implemented' | 'implemented-t359' | 'existing-modal'

export interface SuperdesignReferenceScreen {
  file: string
  surface: string
  route: string
  status: SuperdesignReferenceStatus
}

export const SUPERDESIGN_REFERENCE_SCREEN_ROUTES: SuperdesignReferenceScreen[] = [
  { file: 'Screenshot 2026-05-22 at 23.15.29.png', surface: 'Login', route: '/login', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.15.57.png', surface: 'Signup', route: '/signup', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.16.06.png', surface: 'Onboarding welcome', route: '/welcome', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.16.14.png', surface: 'Onboarding problem', route: '/problem', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.16.20.png', surface: 'Onboarding benefits', route: '/benefits', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.16.27.png', surface: 'Add baby', route: '/add-baby', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.16.40.png', surface: 'Onboarding priorities', route: '/priorities', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.16.47.png', surface: 'Invite household member', route: '/invite-caregiver', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.17.00.png', surface: 'Onboarding preview', route: '/preview', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.17.10.png', surface: 'Home', route: '/home', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.17.20.png', surface: 'Handoff', route: '/handoff', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.17.27.png', surface: 'Quick log', route: '/modals/quick-log', status: 'existing-modal' },
  { file: 'Screenshot 2026-05-22 at 23.17.38.png', surface: 'Timeline', route: '/timeline', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.17.53.png', surface: 'Family', route: '/family', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.18.11.png', surface: 'Settings', route: '/settings', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.18.22.png', surface: 'Widgets', route: '/widgets', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.18.30.png', surface: 'Activity states', route: '/states', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.18.44.png', surface: 'Weekly insights chart', route: '/insights', status: 'implemented-t359' },
  { file: 'Screenshot 2026-05-22 at 23.19.04.png', surface: 'Milestone celebration', route: '/milestones', status: 'implemented-t359' },
  { file: 'Screenshot 2026-05-22 at 23.19.33.png', surface: 'Milestone dashboard', route: '/milestones', status: 'implemented-t359' },
  { file: 'Screenshot 2026-05-22 at 23.21.07.png', surface: 'Plans', route: '/plans', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.21.18.png', surface: 'Reminder list', route: '/reminders', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.21.36.png', surface: 'Reminder creation', route: '/reminders', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.21.45.png', surface: 'Infant journal', route: '/journal', status: 'implemented-t359' },
  { file: 'Screenshot 2026-05-22 at 23.22.07.png', surface: 'Help and support', route: '/support', status: 'implemented-t359' },
  { file: 'Screenshot 2026-05-22 at 23.22.20.png', surface: 'Account', route: '/account', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.22.38.png', surface: 'Delete account confirmation', route: '/modals/delete-account-confirm', status: 'existing-modal' },
  { file: 'Screenshot 2026-05-22 at 23.22.56.png', surface: 'Account signed-out state', route: '/account', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.23.16.png', surface: 'Breastfeed log', route: '/modals/log-breastfeed', status: 'existing-modal' },
  { file: 'Screenshot 2026-05-22 at 23.23.28.png', surface: 'Bottle log', route: '/modals/log-bottle', status: 'existing-modal' },
  { file: 'Screenshot 2026-05-22 at 23.23.45.png', surface: 'Diaper log', route: '/modals/log-diaper', status: 'existing-modal' },
  { file: 'Screenshot 2026-05-22 at 23.24.02.png', surface: 'Medication log', route: '/modals/log-medication', status: 'existing-modal' },
  { file: 'Screenshot 2026-05-22 at 23.24.26.png', surface: 'Sleep timer', route: '/modals/log-sleep', status: 'existing-modal' },
  { file: 'Screenshot 2026-05-22 at 23.24.44.png', surface: 'Sleep log form', route: '/modals/log-sleep', status: 'existing-modal' },
  { file: 'Screenshot 2026-05-22 at 23.25.00.png', surface: 'Weekly insights empty', route: '/insights', status: 'implemented-t359' },
  { file: 'Screenshot 2026-05-22 at 23.25.35.png', surface: 'Weekly insights progress', route: '/insights', status: 'implemented-t359' },
  { file: 'Screenshot 2026-05-22 at 23.25.52.png', surface: 'Baby activity', route: '/activity', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.26.09.png', surface: 'Support success', route: '/support', status: 'implemented-t359' },
  { file: 'Screenshot 2026-05-22 at 23.26.23.png', surface: 'Notification priming', route: '/notification-priming', status: 'implemented' },
  { file: 'Screenshot 2026-05-22 at 23.26.33.png', surface: 'App states', route: '/states', status: 'implemented' },
  { file: 'Screenshot 2026-05-23 at 00.47.09.png', surface: 'Growth album export', route: '/modals/export-album', status: 'existing-modal' },
]

export function findUnmappedSuperdesignReferences(files: string[]) {
  const mapped = new Set(SUPERDESIGN_REFERENCE_SCREEN_ROUTES.map((screen) => screen.file))
  return files.filter((file) => !mapped.has(file))
}

export function getT359Routes() {
  return SUPERDESIGN_REFERENCE_SCREEN_ROUTES
    .filter((screen) => screen.status === 'implemented-t359')
    .map((screen) => screen.route)
}
