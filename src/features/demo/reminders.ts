export interface DemoReminder {
  id: string
  title: string
  detail: string
  dueLabel: string
  dueAt: Date
  active: boolean
  category: 'feed' | 'medication' | 'sleep' | 'custom'
  scheduledNotificationId?: string | null
  delayedForQuietHours?: boolean
}

const tomorrowAt = (hour: number, minute = 0) => {
  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + 1)
  dueAt.setHours(hour, minute, 0, 0)
  return dueAt
}

export const demoReminders: DemoReminder[] = [
  {
    id: 'rem-1',
    title: 'Vitamin D Drops',
    detail: '1 dose · Morning routine',
    dueLabel: '08:00 daily',
    dueAt: tomorrowAt(8),
    active: true,
    category: 'medication',
  },
  {
    id: 'rem-2',
    title: 'Tummy Time',
    detail: '15 minutes · Living room',
    dueLabel: '10:30 daily',
    dueAt: tomorrowAt(10, 30),
    active: true,
    category: 'custom',
  },
  {
    id: 'rem-3',
    title: 'Pumping Session',
    detail: 'Recurring every 3 hours',
    dueLabel: '15:00',
    dueAt: tomorrowAt(15),
    active: false,
    category: 'feed',
  },
]
