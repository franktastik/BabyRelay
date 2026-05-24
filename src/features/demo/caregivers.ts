export interface DemoCaregiver {
  id: string
  name: string
  role: string
  access: string
  avatar?: 'caregiver-1' | 'caregiver-2'
  current?: boolean
}

export const demoCaregivers: DemoCaregiver[] = [
  {
    id: 'cg-1',
    name: 'Sarah Miller',
    role: 'Parent',
    access: 'Admin Access',
    avatar: 'caregiver-1',
    current: true,
  },
  {
    id: 'cg-2',
    name: 'David Miller',
    role: 'Parent',
    access: 'Last sync 2m ago',
    avatar: 'caregiver-2',
  },
  {
    id: 'cg-3',
    name: 'Maria Rodriguez',
    role: 'Nanny',
    access: 'Caregiver Access',
  },
]

