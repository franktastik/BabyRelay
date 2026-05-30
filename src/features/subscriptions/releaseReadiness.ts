export type IapReleaseGateStatus = 'passed' | 'manual_required' | 'blocked'

export interface IapReleaseGate {
  id: string
  label: string
  status: IapReleaseGateStatus
  evidence: string
  productionRequired: boolean
}

export interface IapReleaseReadinessSummary {
  overallStatus: IapReleaseGateStatus
  passedCount: number
  manualRequiredCount: number
  blockedCount: number
  totalCount: number
}

export interface IapCheckoutBoundaryInput {
  usesStoreKitInAppPurchase: boolean
  usesApplePayForDigitalUnlock: boolean
  usesExternalCheckoutForDigitalUnlock: boolean
}

export const PBI055_RELEASE_GATES: IapReleaseGate[] = [
  {
    id: 'native-iap-only',
    label: 'iOS digital subscription unlocks use native IAP only.',
    status: 'passed',
    evidence: 'src/features/subscriptions/iap.ts validates StoreKit-style IAP flows.',
    productionRequired: false,
  },
  {
    id: 'backend-source-of-truth',
    label: 'Client IAP state is optimistic and backend entitlement is authoritative.',
    status: 'passed',
    evidence: 'src/features/subscriptions/backendEntitlements.ts and IAP boundary tests.',
    productionRequired: false,
  },
  {
    id: 'app-store-notification-contract',
    label: 'Lifecycle notification handling is mapped for renewals, refunds, revokes, and billing retry.',
    status: 'passed',
    evidence: 'src/features/subscriptions/appStoreServerNotifications.ts.',
    productionRequired: false,
  },
  {
    id: 'release-matrix-documented',
    label: 'StoreKit, Sandbox, and TestFlight validation matrix is documented.',
    status: 'passed',
    evidence: 'docs/testing/babyminimo-storekit-paywall-validation-plan.md.',
    productionRequired: false,
  },
  {
    id: 'sandbox-purchase-smoke',
    label: 'Real App Store Sandbox purchase and restore smoke pass.',
    status: 'manual_required',
    evidence: 'Requires App Store Connect products, sandbox testers, and a signed StoreKit build.',
    productionRequired: true,
  },
  {
    id: 'testflight-purchase-smoke',
    label: 'TestFlight purchase, restore, and cancellation smoke pass.',
    status: 'manual_required',
    evidence: 'Requires a signed TestFlight build and configured test group.',
    productionRequired: true,
  },
  {
    id: 'deployable-billing-rules',
    label: 'Production Firestore rules block client writes to backend billing authority.',
    status: 'blocked',
    evidence: 'T326/T329 scopes do not include firestore.rules; current rules must not be deployed as-is.',
    productionRequired: true,
  },
  {
    id: 'deployable-entitlement-functions',
    label: 'Deployable entitlement refresh and notification Functions exist.',
    status: 'blocked',
    evidence: 'PBI-055 T3/T4 added local contracts; functions/** remains out of current scope.',
    productionRequired: true,
  },
]

export const summarizeIapReleaseReadiness = (
  gates: IapReleaseGate[] = PBI055_RELEASE_GATES
): IapReleaseReadinessSummary => {
  const passedCount = gates.filter((gate) => gate.status === 'passed').length
  const manualRequiredCount = gates.filter((gate) => gate.status === 'manual_required').length
  const blockedCount = gates.filter((gate) => gate.status === 'blocked').length

  return {
    overallStatus:
      blockedCount > 0 ? 'blocked' : manualRequiredCount > 0 ? 'manual_required' : 'passed',
    passedCount,
    manualRequiredCount,
    blockedCount,
    totalCount: gates.length,
  }
}

export const assertIapCheckoutBoundary = ({
  usesStoreKitInAppPurchase,
  usesApplePayForDigitalUnlock,
  usesExternalCheckoutForDigitalUnlock,
}: IapCheckoutBoundaryInput) => {
  if (!usesStoreKitInAppPurchase) {
    throw new Error('iOS digital subscription unlocks must use StoreKit In-App Purchase.')
  }

  if (usesApplePayForDigitalUnlock) {
    throw new Error('Apple Pay must not be used for iOS digital subscription unlocks.')
  }

  if (usesExternalCheckoutForDigitalUnlock) {
    throw new Error('External checkout must not be used for iOS digital subscription unlocks.')
  }

  return true
}
