export type HouseholdMemberRole = 'owner' | 'admin' | 'caregiver' | 'viewer'

const inviteRoles = new Set<HouseholdMemberRole>(['owner', 'admin'])

export const normalizeHouseholdMemberRole = (role: unknown): HouseholdMemberRole | null => {
  if (role === 'owner' || role === 'admin' || role === 'caregiver' || role === 'viewer') {
    return role
  }

  return null
}

export const canInviteHouseholdMembers = (role: HouseholdMemberRole | null): boolean => {
  return role ? inviteRoles.has(role) : false
}
