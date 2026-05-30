import type { DemoCareEvent } from '@/src/features/demo/events'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'

export type TimelineItemType = 'care' | 'growth'
export type TimelineSortOrder = 'newest' | 'oldest'

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

export function searchTimelineItems(items: TimelineItem[], query: string): TimelineItem[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return items
  }

  return items.filter((item) => timelineSearchText(item).includes(normalizedQuery))
}

export function sortTimelineItems(items: TimelineItem[], sortOrder: TimelineSortOrder): TimelineItem[] {
  return [...items].sort((a, b) => {
    const difference = b.occurredAt.getTime() - a.occurredAt.getTime()
    return sortOrder === 'newest' ? difference : -difference
  })
}

function timelineSearchText(item: TimelineItem) {
  const careEvent = item.careEvent
  const growthMoment = item.growthMoment
  const metadata = careEvent ? Object.values(careEvent.metadata).join(' ') : ''

  return [
    item.type,
    item.occurredAt.toISOString(),
    careEvent?.type,
    careEvent?.createdBy,
    metadata,
    growthMoment?.caption,
    growthMoment?.momentType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}
