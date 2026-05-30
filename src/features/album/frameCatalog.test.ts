import { describe, expect, test } from 'bun:test'
import {
  ALBUM_FRAMES_PER_PAGE,
  activeAlbumFrameCatalog,
  albumFrameCatalog,
  buildAlbumExportPayload,
  buildFirstYearSlots,
  getActiveAlbumFrameById,
  getActiveAlbumFramePage,
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
  test('has exactly 51 stable frame IDs split into 43 single and 8 collage frames', () => {
    expect(albumFrameCatalog).toHaveLength(51)
    expect(new Set(albumFrameCatalog.map((frame) => frame.id)).size).toBe(51)
    expect(albumFrameCatalog.filter((frame) => frame.layoutKind === 'single')).toHaveLength(43)
    expect(albumFrameCatalog.filter((frame) => frame.layoutKind === 'collage')).toHaveLength(8)
    expect(albumFrameCatalog.every((frame) => frame.branding.includes('BabyMinimo'))).toBe(true)
  })

  test('includes the expanded unique design set for non-collage frames', () => {
    const expandedFrameIds = [
      'curling-vine',
      'rose-lace',
      'daisy-chain',
      'pearl-oval',
      'three-month-steps',
      'cloud-dream',
      'golden-scroll',
      'meadow-wreath',
      'ribbon-keepsake',
      'six-month-steps',
      'twelve-month-steps',
      'little-crown',
      'garden-arch',
      'fan-fold-trio',
    ]

    expect(expandedFrameIds.every((id) => albumFrameCatalog.some((frame) => frame.id === id))).toBe(true)
    expect(expandedFrameIds.every((id) => albumFrameCatalog.find((frame) => frame.id === id)?.layoutKind === 'single')).toBe(true)
  })

  test('includes feminine blush and rose frame options without changing collage count', () => {
    const feminineFrameIds = [
      'minimal-white',
      'soft-floral',
      'moonlight-nap',
      'rose-garden',
      'pink-peony',
      'blush-bow',
      'red-rose-keepsake',
      'butterfly-blush',
      'lace-princess',
      'garden-party',
    ]

    expect(feminineFrameIds.every((id) => albumFrameCatalog.some((frame) => frame.id === id))).toBe(true)
    expect(albumFrameCatalog.filter((frame) => frame.tone === 'blush' || frame.tone === 'rose').length).toBeGreaterThanOrEqual(12)
    expect(albumFrameCatalog.filter((frame) => frame.layoutKind === 'collage')).toHaveLength(8)
  })

  test('includes stepped milestone layouts for 3, 6, and 12 month photo arrangements', () => {
    expect(albumFrameCatalog.find((frame) => frame.id === 'three-month-steps')).toMatchObject({
      layoutKind: 'single',
      photoSlots: 3,
    })
    expect(albumFrameCatalog.find((frame) => frame.id === 'six-month-steps')).toMatchObject({
      layoutKind: 'single',
      photoSlots: 6,
    })
    expect(albumFrameCatalog.find((frame) => frame.id === 'twelve-month-steps')).toMatchObject({
      layoutKind: 'single',
      photoSlots: 12,
      supportsMonthlySlots: true,
    })
  })

  test('includes a fan-fold trio frame with three overlapping photo panels', () => {
    expect(albumFrameCatalog.find((frame) => frame.id === 'fan-fold-trio')).toMatchObject({
      layoutKind: 'single',
      photoSlots: 3,
      tone: 'gold',
    })
  })

  test('includes ten static 3D frame designs from the new sample set', () => {
    const threeDFrameIds = [
      'three-d-teddy-fan',
      'three-d-safari-trio',
      'three-d-woodland-arch',
      'three-d-dino-cloud',
      'three-d-moon-cloud',
      'three-d-rainbow-trio',
      'three-d-rose-bow',
      'three-d-ocean-sail',
      'three-d-balloon-duo',
      'three-d-castle-portrait',
    ]

    expect(threeDFrameIds.every((id) => albumFrameCatalog.some((frame) => frame.id === id))).toBe(true)
    expect(threeDFrameIds.every((id) => albumFrameCatalog.find((frame) => frame.id === id)?.layoutKind === 'single')).toBe(true)
  })

  test('keeps 3D frame designs experimental until photo positioning is available', () => {
    const threeDFrames = albumFrameCatalog.filter((frame) => frame.id.startsWith('three-d-'))

    expect(threeDFrames).toHaveLength(10)
    expect(threeDFrames.every((frame) => frame.availability === 'experimental')).toBe(true)
    expect(threeDFrames.every((frame) => frame.disabledReason === 'needsPhotoPositioning')).toBe(true)
    expect(activeAlbumFrameCatalog).toHaveLength(41)
    expect(activeAlbumFrameCatalog.some((frame) => frame.id.startsWith('three-d-'))).toBe(false)
    expect(getActiveAlbumFrameById('three-d-castle-portrait')).toBeUndefined()
  })

  test('adds 3D frame designs without replacing existing flat frame IDs', () => {
    const originalFlatFrameIds = [
      'classic-cream',
      'sage-keepsake',
      'storybook-single',
      'minimal-white',
      'soft-floral',
      'milestone-card',
      'print-shop-border',
      'tiny-toes',
      'welcome-home',
      'moonlight-nap',
      'little-star',
      'heirloom-portrait',
    ]

    expect(originalFlatFrameIds.every((id) => albumFrameCatalog.some((frame) => frame.id === id))).toBe(true)
    expect(originalFlatFrameIds.every((id) => !id.startsWith('three-d-'))).toBe(true)
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
    const fourthPage = getAlbumFramePage(3)
    const fifthPage = getAlbumFramePage(4)
    const sixthPage = getAlbumFramePage(5)
    const seventhPage = getAlbumFramePage(6)

    expect(ALBUM_FRAMES_PER_PAGE).toBe(8)
    expect(firstPage.frames).toHaveLength(8)
    expect(secondPage.frames).toHaveLength(8)
    expect(thirdPage.frames).toHaveLength(8)
    expect(fourthPage.frames).toHaveLength(8)
    expect(fifthPage.frames).toHaveLength(8)
    expect(sixthPage.frames).toHaveLength(8)
    expect(seventhPage.frames).toHaveLength(3)
    expect(fifthPage.pageCount).toBe(7)
  })

  test('paginates only active frames for the user-facing picker', () => {
    const firstPage = getActiveAlbumFramePage(0)
    const fifthPage = getActiveAlbumFramePage(4)
    const sixthPage = getActiveAlbumFramePage(5)

    expect(firstPage.frames).toHaveLength(8)
    expect(fifthPage.frames).toHaveLength(8)
    expect(sixthPage.frames).toHaveLength(1)
    expect(sixthPage.pageCount).toBe(6)
    expect([firstPage, fifthPage, sixthPage].flatMap((page) => page.frames).some((frame) => frame.id.startsWith('three-d-'))).toBe(false)
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

  test('keeps Storybook timeline items inside the selected photo set', () => {
    const payload = buildAlbumExportPayload({
      babyName: 'Luna',
      frameId: 'storybook-single',
      outputFormat: 'image-pages',
      selectedMoments: moments.slice(0, 2),
      storybookTimelineItemIds: ['gm-1', 'gm-3', 'missing'],
    })

    expect(payload.storybookTimelineItemIds).toEqual(['gm-1'])
    expect(payload.selectedMomentIds).toEqual(['gm-1', 'gm-2'])
  })

  test('uses the caller-provided localized fallback caption for empty moment captions', () => {
    const [emptyCaptionMoment] = moments
    const payload = buildAlbumExportPayload({
      babyName: 'Luna',
      frameId: 'classic-cream',
      outputFormat: 'pdf',
      selectedMoments: [{ ...emptyCaptionMoment, caption: '' }],
      fallbackCaption: 'Localized growth moment',
    })

    expect(payload.moments[0].caption).toBe('Localized growth moment')
  })

  test('orders First Year slots from month 1 through 12 with placeholders for missing months', () => {
    const slots = buildFirstYearSlots(moments.slice(0, 2))

    expect(slots.map((slot) => slot.monthNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(slots[0]).toEqual({ monthNumber: 1, momentId: 'gm-1', placeholder: false })
    expect(slots[1]).toEqual({ monthNumber: 2, momentId: 'gm-2', placeholder: false })
    expect(slots.slice(2).every((slot) => slot.placeholder && slot.momentId === null)).toBe(true)
  })
})
