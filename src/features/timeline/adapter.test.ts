import { describe, expect, test } from 'bun:test'
import { buildTimelineItems, filterTimelineItems } from './adapter'
import type { DemoCareEvent } from '@/src/features/demo/events'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'

const older = new Date('2026-05-20T10:00:00.000Z')
const middle = new Date('2026-05-21T10:00:00.000Z')
const newer = new Date('2026-05-22T10:00:00.000Z')

const careEvents: DemoCareEvent[] = [
  {
    id: 'feed-1',
    babyId: 'baby-1',
    type: 'breastfeed',
    occurredAt: older,
    metadata: { side: 'left' },
    createdBy: 'Mama',
  },
  {
    id: 'diaper-1',
    babyId: 'baby-1',
    type: 'diaper',
    occurredAt: newer,
    metadata: { kind: 'wet' },
    createdBy: 'Dada',
  },
]

const growthMoments: DemoGrowthMoment[] = [
  {
    id: 'growth-1',
    babyId: 'baby-1',
    localImageUri: '',
    localImageAsset: 'growth-feet-reference',
    caption: 'First smile',
    momentType: 'milestone',
    occurredAt: middle,
  },
]

describe('timeline adapter', () => {
  const timeline = buildTimelineItems(careEvents, growthMoments)

  test('merges care and growth items by descending occurredAt', () => {
    expect(timeline.map((item) => item.id)).toEqual([
      'care-diaper-1',
      'growth-growth-1',
      'care-feed-1',
    ])
  })

  test('filters care events', () => {
    expect(filterTimelineItems(timeline, 'care').map((item) => item.id)).toEqual([
      'care-diaper-1',
      'care-feed-1',
    ])
  })

  test('filters growth moments', () => {
    expect(filterTimelineItems(timeline, 'growth').map((item) => item.id)).toEqual(['growth-growth-1'])
  })

  test('keeps all items for all and notes filters', () => {
    expect(filterTimelineItems(timeline, 'all')).toHaveLength(3)
    expect(filterTimelineItems(timeline, 'notes')).toHaveLength(3)
  })
})
