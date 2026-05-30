import { describe, expect, test } from 'bun:test'
import { canInviteHouseholdMembers, type HouseholdMemberRole } from './permissions'
import {
  defaultRelationshipLabelId,
  getResolvedRelationshipLabelId,
  normalizeCustomRelationshipLabel,
  relationshipLabelIds,
} from './relationshipLabels'

describe('household relationship labels', () => {
  test('provide the approved starter labels', () => {
    expect(relationshipLabelIds).toEqual([
      'parent',
      'partner',
      'husband',
      'grandparent',
      'family',
      'nanny',
      'nurse',
      'babysitter',
      'friend',
      'other',
    ])
  })

  test('fall back to the default display label without affecting permissions', () => {
    expect(getResolvedRelationshipLabelId('unknown')).toBe(defaultRelationshipLabelId)

    const deniedRole: HouseholdMemberRole = 'caregiver'
    expect(canInviteHouseholdMembers(deniedRole)).toBe(false)
    expect(getResolvedRelationshipLabelId('partner')).toBe('partner')
  })

  test('normalizes custom other labels for display only', () => {
    expect(normalizeCustomRelationshipLabel('  Night   doula  ')).toBe('Night doula')
    expect(normalizeCustomRelationshipLabel('A very long custom relationship label')).toBe('A very long custom relat')
  })
})
