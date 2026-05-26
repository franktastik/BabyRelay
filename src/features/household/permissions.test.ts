import { describe, expect, test } from 'bun:test'
import {
  canInviteHouseholdMembers,
  normalizeHouseholdMemberRole,
  type HouseholdMemberRole,
} from './permissions'

describe('household permissions', () => {
  test('only owners and admins can invite household members', () => {
    const allowed: HouseholdMemberRole[] = ['owner', 'admin']
    const denied: Array<HouseholdMemberRole | null> = ['caregiver', 'viewer', null]

    for (const role of allowed) {
      expect(canInviteHouseholdMembers(role)).toBe(true)
    }

    for (const role of denied) {
      expect(canInviteHouseholdMembers(role)).toBe(false)
    }
  })

  test('rejects unknown household roles', () => {
    expect(normalizeHouseholdMemberRole('owner')).toBe('owner')
    expect(normalizeHouseholdMemberRole('member')).toBeNull()
    expect(normalizeHouseholdMemberRole(undefined)).toBeNull()
  })
})
