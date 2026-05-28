import type { RelationshipLabelId } from '@/src/features/household/relationshipLabels'

export interface DemoCaregiver {
  id: string
  name: string
  relationshipLabel: RelationshipLabelId
  customRelationshipLabel?: string
  accessKey: string
  avatar?: 'caregiver-1' | 'caregiver-2'
  current?: boolean
}

export const demoCaregivers: DemoCaregiver[] = [
  {
    id: 'cg-1',
    name: 'Sarah Miller',
    relationshipLabel: 'parent',
    accessKey: 'household.access.admin',
    avatar: 'caregiver-1',
    current: true,
  },
  {
    id: 'cg-2',
    name: 'David Miller',
    relationshipLabel: 'partner',
    accessKey: 'household.access.lastSyncRecent',
    avatar: 'caregiver-2',
  },
  {
    id: 'cg-3',
    name: 'Maria Rodriguez',
    relationshipLabel: 'nanny',
    accessKey: 'household.access.member',
  },
]
