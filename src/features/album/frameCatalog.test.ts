import { describe, expect, test } from 'bun:test'
import {
  ALBUM_FRAMES_PER_PAGE,
  albumFrameCatalog,
  buildAlbumExportPayload,
  buildFirstYearSlots,
  getAlbumFramePage,
  getDefaultStorybookTimelineItemIds,
} from './frameCatalog'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'
import { de } from '@/src/localization/resources/de'
import { en } from '@/src/localization/resources/en'

const moments: DemoGrowthMoment[] = Array.from({ length: 4 }, (_, index) => ({
  id: `gm-${index + 1}`,
  babyId: 'baby-1',
  localImageUri: '',
  caption: `Month ${index + 1}`,
  momentType: index === 0 ? 'milestone' : 'photo',
  occurredAt: new Date(Date.UTC(2026, index, 12)),
}))

describe('album frame catalog', () => {
  test('has exactly 20 stable frame IDs split into 12 single and 8 collage frames', () => {
    expect(albumFrameCatalog).toHaveLength(20)
    expect(new Set(albumFrameCatalog.map((frame) => frame.id)).size).toBe(20)
    expect(albumFrameCatalog.filter((frame) => frame.layoutKind === 'single')).toHaveLength(12)
    expect(albumFrameCatalog.filter((frame) => frame.layoutKind === 'collage')).toHaveLength(8)
    expect(albumFrameCatalog.every((frame) => frame.branding.includes('BabyMinimo'))).toBe(true)
  })

  test('has runtime localization strings for every frame in English and German draft resources', () => {
    for (const frame of albumFrameCatalog) {
      expect(en[frame.nameKey as keyof typeof en]).toBeTruthy()
      expect(de[frame.nameKey as keyof typeof de]).toBeTruthy()
      expect(en[frame.nameKey as keyof typeof en]).not.toBe(frame.nameKey)
      expect(de[frame.nameKey as keyof typeof de]).not.toBe(frame.nameKey)
    }
  })

  test('paginates the frame picker with eight frames per page', () => {
    const firstPage = getAlbumFramePage(0)
    const secondPage = getAlbumFramePage(1)
    const thirdPage = getAlbumFramePage(2)

    expect(ALBUM_FRAMES_PER_PAGE).toBe(8)
    expect(firstPage.frames).toHaveLength(8)
    expect(secondPage.frames).toHaveLength(8)
    expect(thirdPage.frames).toHaveLength(4)
    expect(thirdPage.pageCount).toBe(3)
  })

  test('builds local export payloads without changing storage mode', () => {
    const payload = buildAlbumExportPayload({
      babyName: 'Luna',
      frameId: 'classic-cream',
      outputFormat: 'pdf',
      selectedMoments: moments.slice(0, 2),
      householdAttribution: 'The Miller Household',
      customText: {
        title: 'Nuestra historia',
        note: 'Primeras sonrisas en casa',
      },
      generatedAt: new Date(Date.UTC(2026, 4, 26)),
    })

    expect(payload).toMatchObject({
      babyName: 'Luna',
      frameId: 'classic-cream',
      frameName: 'Classic Cream',
      outputFormat: 'pdf',
      selectedMomentIds: ['gm-1', 'gm-2'],
      storageMode: 'local-user-artifact',
      householdAttribution: 'The Miller Household',
      customText: {
        title: 'Nuestra historia',
        note: 'Primeras sonrisas en casa',
      },
      generatedAt: '2026-05-26T00:00:00.000Z',
    })
  })

  test('keeps Storybook timeline item removal separate from selected photos', () => {
    expect(getDefaultStorybookTimelineItemIds(moments)).toEqual(['gm-1', 'gm-2', 'gm-3'])

    const payload = buildAlbumExportPayload({
      babyName: 'Luna',
      frameId: 'storybook-single',
      outputFormat: 'image-pages',
      selectedMoments: moments,
      storybookTimelineItemIds: ['gm-1', 'gm-3'],
    })

    expect(payload.storybookTimelineItemIds).toEqual(['gm-1', 'gm-3'])
    expect(payload.selectedMomentIds).toEqual(['gm-1', 'gm-2', 'gm-3', 'gm-4'])
  })

  test('orders First Year slots from month 1 through 12 with placeholders for missing months', () => {
    const slots = buildFirstYearSlots(moments.slice(0, 2))

    expect(slots.map((slot) => slot.monthNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(slots[0]).toEqual({ monthNumber: 1, momentId: 'gm-1', placeholder: false })
    expect(slots[1]).toEqual({ monthNumber: 2, momentId: 'gm-2', placeholder: false })
    expect(slots.slice(2).every((slot) => slot.placeholder && slot.momentId === null)).toBe(true)
  })
})
