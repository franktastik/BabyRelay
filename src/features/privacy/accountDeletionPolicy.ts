export type BabyMinimoAccountDeletionDataClass =
  | 'userProfile'
  | 'householdMembership'
  | 'babyProfiles'
  | 'careEvents'
  | 'reminders'
  | 'growthTimelineLocalPhotos'
  | 'growthTimelineLocalMetadata'
  | 'widgetSnapshots'
  | 'notifications'
  | 'analytics'
  | 'authSession'

export type BabyMinimoDeletionOwner = 'clientLocal' | 'backendProduction' | 'sharedHouseholdPolicy'

export interface BabyMinimoAccountDeletionPolicyItem {
  dataClass: BabyMinimoAccountDeletionDataClass
  owner: BabyMinimoDeletionOwner
  localEmulatorBehavior: string
  productionBehavior: string
}

export const BABY_MINIMO_DELETE_CONFIRMATION = 'DELETE'

export const babyMinimoAccountDeletionPolicy: BabyMinimoAccountDeletionPolicyItem[] = [
  {
    dataClass: 'userProfile',
    owner: 'backendProduction',
    localEmulatorBehavior: 'Clear local auth/session state and return to the auth flow.',
    productionBehavior:
      'Backend purge removes or anonymizes user-scoped profile data before Firebase Auth deletion.',
  },
  {
    dataClass: 'householdMembership',
    owner: 'sharedHouseholdPolicy',
    localEmulatorBehavior:
      'Do not delete another caregiver household from the client; document the pending backend policy.',
    productionBehavior:
      'Backend removes membership safely and blocks or handles last-admin/last-owner cases.',
  },
  {
    dataClass: 'babyProfiles',
    owner: 'sharedHouseholdPolicy',
    localEmulatorBehavior:
      'Preserve shared baby profiles in emulator/shared data unless the backend policy later authorizes deletion.',
    productionBehavior:
      'Backend decides whether baby profiles remain for other caregivers or are purged with a household deletion.',
  },
  {
    dataClass: 'careEvents',
    owner: 'backendProduction',
    localEmulatorBehavior: 'Clear local in-memory care event cache for the device.',
    productionBehavior:
      'Backend removes or retains shared household care events according to membership and ownership policy.',
  },
  {
    dataClass: 'reminders',
    owner: 'backendProduction',
    localEmulatorBehavior: 'Cancel local reminder notifications on this device.',
    productionBehavior:
      'Backend removes user-scoped reminder participation and invalidates device notification state.',
  },
  {
    dataClass: 'growthTimelineLocalPhotos',
    owner: 'clientLocal',
    localEmulatorBehavior: 'Remove local Growth Timeline photo files created by the app.',
    productionBehavior: 'Same as local because Growth Timeline photos are local-only in v1.',
  },
  {
    dataClass: 'growthTimelineLocalMetadata',
    owner: 'clientLocal',
    localEmulatorBehavior: 'Clear local Growth Timeline metadata for this device.',
    productionBehavior: 'Same as local because Growth Timeline metadata is local-only in v1.',
  },
  {
    dataClass: 'widgetSnapshots',
    owner: 'clientLocal',
    localEmulatorBehavior: 'Clear and blank the local widget snapshot.',
    productionBehavior: 'Clear and blank widget snapshots on sign out, deletion, or widget disable.',
  },
  {
    dataClass: 'notifications',
    owner: 'clientLocal',
    localEmulatorBehavior: 'Cancel scheduled local notifications.',
    productionBehavior: 'Cancel local notifications and invalidate production push tokens when remote push exists.',
  },
  {
    dataClass: 'analytics',
    owner: 'clientLocal',
    localEmulatorBehavior: 'Reset local analytics/event identity.',
    productionBehavior: 'Reset analytics identity and honor provider deletion/export obligations.',
  },
  {
    dataClass: 'authSession',
    owner: 'clientLocal',
    localEmulatorBehavior: 'Sign out and clear auth store state.',
    productionBehavior:
      'Delete Firebase Auth user only after backend cleanup succeeds or a retry-safe deletion state is recorded.',
  },
]

export const isBabyMinimoDeleteConfirmationValid = (value: string) =>
  value.trim().toUpperCase() === BABY_MINIMO_DELETE_CONFIRMATION
