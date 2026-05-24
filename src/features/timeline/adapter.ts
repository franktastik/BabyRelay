import type { DemoCareEvent } from '@/src/features/demo/events'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'

export type TimelineItemType = 'care' | 'growth'

export interface TimelineItem {
  id: string
  type: TimelineItemType
  occurredAt: Date
  careEvent?: DemoCareEvent
  growthMoment?: DemoGrowthMoment
}

export function buildTimelineItems(
  careEvents: DemoCareEvent[],
  growthMoments: DemoGrowthMoment[]
): TimelineItem[] {
  const careItems: TimelineItem[] = careEvents.map((e) => ({
    id: `care-${e.id}`,
    type: 'care',
    occurredAt: e.occurredAt,
    careEvent: e,
  }))

  const growthItems: TimelineItem[] = growthMoments.map((m) => ({
    id: `growth-${m.id}`,
    type: 'growth',
    occurredAt: m.occurredAt,
    growthMoment: m,
  }))

  return [...careItems, ...growthItems].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  )
}

export function filterTimelineItems(
  items: TimelineItem[],
  filter: 'all' | 'care' | 'growth' | 'notes'
): TimelineItem[] {
  if (filter === 'all') return items
  if (filter === 'care') return items.filter((i) => i.type === 'care')
  if (filter === 'growth') return items.filter((i) => i.type === 'growth')
  return items
}
