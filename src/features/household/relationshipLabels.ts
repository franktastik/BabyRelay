export const relationshipLabelIds = [
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
] as const

export type RelationshipLabelId = (typeof relationshipLabelIds)[number]

export const defaultRelationshipLabelId: RelationshipLabelId = 'partner'

export const relationshipLabelTranslationKeys: Record<RelationshipLabelId, string> = {
  parent: 'household.relationship.parent',
  partner: 'household.relationship.partner',
  husband: 'household.relationship.husband',
  grandparent: 'household.relationship.grandparent',
  family: 'household.relationship.family',
  nanny: 'household.relationship.nanny',
  nurse: 'household.relationship.nurse',
  babysitter: 'household.relationship.babysitter',
  friend: 'household.relationship.friend',
  other: 'household.relationship.other',
}

export const normalizeCustomRelationshipLabel = (label: string): string => {
  return label.trim().replace(/\s+/g, ' ').slice(0, 24)
}

export const getRelationshipLabelKey = (labelId: RelationshipLabelId): string => {
  return relationshipLabelTranslationKeys[labelId]
}

export const getResolvedRelationshipLabelId = (labelId: string | null | undefined): RelationshipLabelId => {
  return relationshipLabelIds.includes(labelId as RelationshipLabelId)
    ? (labelId as RelationshipLabelId)
    : defaultRelationshipLabelId
}
