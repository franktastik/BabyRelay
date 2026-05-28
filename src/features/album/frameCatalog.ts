import type { DemoGrowthMoment } from '@/src/features/demo/growth'
import type { GrowthTimelineBackupManifest } from '@/src/features/growth/mediaDurability'

export type AlbumOutputFormat = 'pdf' | 'image-pages'
export type AlbumFrameLayoutKind = 'single' | 'collage'

export interface AlbumFrameTemplate {
  id: string
  name: string
  nameKey: string
  layoutKind: AlbumFrameLayoutKind
  photoSlots: number
  tone: 'cream' | 'sage' | 'white' | 'floral' | 'gold' | 'storybook' | 'blush' | 'rose'
  branding: 'BabyMinimo' | 'BabyMinimo Memories'
  availability?: 'active' | 'experimental'
  disabledReason?: 'needsPhotoPositioning'
  supportsTimelineItems?: boolean
  supportsMonthlySlots?: boolean
  staticAssetMode: 'styleDefinition'
  previewAssetMode: 'generatedSampleStyle'
}

export interface AlbumExportMoment {
  id: string
  caption: string
  date: string
  momentType: string
}

export interface AlbumExportPayload {
  babyName: string
  frameId: string
  frameName: string
  outputFormat: AlbumOutputFormat
  selectedMomentIds: string[]
  moments: AlbumExportMoment[]
  storybookTimelineItemIds: string[]
  firstYearSlots?: AlbumMonthSlot[]
  householdAttribution?: string
  customText?: AlbumCustomText
  mediaBackupManifest?: GrowthTimelineBackupManifest
  generatedAt: string
  storageMode: 'local-user-artifact'
}

export interface AlbumCustomText {
  title: string
  note: string
}

export interface AlbumMonthSlot {
  monthNumber: number
  momentId: string | null
  placeholder: boolean
}

export const ALBUM_FRAMES_PER_PAGE = 8
const THREE_D_EXPERIMENTAL_OPTIONS = {
  availability: 'experimental',
  disabledReason: 'needsPhotoPositioning',
} as const

export const albumFrameCatalog: AlbumFrameTemplate[] = [
  singleFrame('classic-cream', 'Classic Cream', 1, 'cream'),
  singleFrame('sage-keepsake', 'Sage Keepsake', 1, 'sage'),
  singleFrame('storybook-single', 'Storybook', 1, 'storybook', { supportsTimelineItems: true }),
  singleFrame('minimal-white', 'Blush Gallery', 1, 'blush'),
  singleFrame('soft-floral', 'Rose Floral', 1, 'rose'),
  singleFrame('milestone-card', 'Milestone Card', 1, 'gold'),
  singleFrame('print-shop-border', 'Print Shop Border', 1, 'cream'),
  singleFrame('tiny-toes', 'Tiny Toes', 1, 'cream'),
  singleFrame('welcome-home', 'Welcome Home', 1, 'sage'),
  singleFrame('moonlight-nap', 'Blush Moon Nap', 1, 'blush'),
  singleFrame('little-star', 'Little Star', 1, 'gold'),
  singleFrame('heirloom-portrait', 'Heirloom Portrait', 1, 'white'),
  singleFrame('rose-garden', 'Rose Garden', 1, 'rose'),
  singleFrame('pink-peony', 'Pink Peony', 1, 'blush'),
  singleFrame('blush-bow', 'Blush Bow', 1, 'blush'),
  singleFrame('red-rose-keepsake', 'Red Rose Keepsake', 1, 'rose'),
  singleFrame('butterfly-blush', 'Butterfly Blush', 1, 'blush'),
  singleFrame('lace-princess', 'Lace Princess', 1, 'rose'),
  singleFrame('garden-party', 'Garden Party', 1, 'floral'),
  singleFrame('curling-vine', 'Curling Vine', 1, 'sage'),
  singleFrame('rose-lace', 'Rose Lace', 1, 'rose'),
  singleFrame('daisy-chain', 'Daisy Chain', 1, 'floral'),
  singleFrame('pearl-oval', 'Pearl Oval', 1, 'white'),
  singleFrame('three-month-steps', 'Three Month Steps', 3, 'cream'),
  singleFrame('cloud-dream', 'Cloud Dream', 1, 'white'),
  singleFrame('golden-scroll', 'Golden Scroll', 1, 'gold'),
  singleFrame('meadow-wreath', 'Meadow Wreath', 1, 'sage'),
  singleFrame('ribbon-keepsake', 'Ribbon Keepsake', 1, 'blush'),
  singleFrame('six-month-steps', 'Six Month Steps', 6, 'blush'),
  singleFrame('twelve-month-steps', 'Twelve Month Steps', 12, 'storybook', { supportsMonthlySlots: true }),
  singleFrame('little-crown', 'Little Crown', 1, 'gold'),
  singleFrame('garden-arch', 'Garden Arch', 1, 'floral'),
  singleFrame('fan-fold-trio', 'Fan Fold Trio', 3, 'gold'),
  singleFrame('three-d-teddy-fan', '3D Teddy Fan', 3, 'blush', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-safari-trio', '3D Safari Trio', 3, 'sage', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-woodland-arch', '3D Woodland Arch', 1, 'sage', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-dino-cloud', '3D Dino Cloud', 1, 'sage', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-moon-cloud', '3D Moon Cloud', 1, 'storybook', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-rainbow-trio', '3D Rainbow Trio', 3, 'blush', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-rose-bow', '3D Rose Bow', 1, 'rose', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-ocean-sail', '3D Ocean Sail', 1, 'white', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-balloon-duo', '3D Balloon Duo', 2, 'gold', THREE_D_EXPERIMENTAL_OPTIONS),
  singleFrame('three-d-castle-portrait', '3D Castle Portrait', 1, 'blush', THREE_D_EXPERIMENTAL_OPTIONS),
  collageFrame('two-together', 'Two Together', 2, 'cream'),
  collageFrame('little-moments-strip', 'Little Moments Strip', 3, 'white'),
  collageFrame('first-smiles-grid', 'First Smiles Grid', 4, 'cream'),
  collageFrame('family-circle', 'Family Circle', 3, 'sage'),
  collageFrame('scrapbook-keepsake', 'Scrapbook Keepsake', 4, 'storybook'),
  collageFrame('milestone-collage', 'Milestone Collage', 4, 'gold'),
  collageFrame('first-year-grid', 'First Year Grid', 12, 'cream', { supportsMonthlySlots: true }),
  collageFrame('grandparent-keepsake', 'Grandparent Keepsake', 3, 'floral'),
]

export const activeAlbumFrameCatalog: AlbumFrameTemplate[] = albumFrameCatalog.filter(
  (frame) => frame.availability !== 'experimental'
)

export function getAlbumFrameById(frameId: string): AlbumFrameTemplate | undefined {
  return albumFrameCatalog.find((frame) => frame.id === frameId)
}

export function getAlbumFramePage(pageIndex: number, pageSize = ALBUM_FRAMES_PER_PAGE) {
  return getFramePage(albumFrameCatalog, pageIndex, pageSize)
}

export function getActiveAlbumFrameById(frameId: string): AlbumFrameTemplate | undefined {
  return activeAlbumFrameCatalog.find((frame) => frame.id === frameId)
}

export function getActiveAlbumFramePage(pageIndex: number, pageSize = ALBUM_FRAMES_PER_PAGE) {
  return getFramePage(activeAlbumFrameCatalog, pageIndex, pageSize)
}

function getFramePage(frames: AlbumFrameTemplate[], pageIndex: number, pageSize = ALBUM_FRAMES_PER_PAGE) {
  const pageCount = Math.ceil(frames.length / pageSize)
  const page = Math.min(Math.max(pageIndex, 0), pageCount - 1)
  const start = page * pageSize

  return {
    page,
    pageCount,
    frames: frames.slice(start, start + pageSize),
  }
}

export function getDefaultStorybookTimelineItemIds(moments: DemoGrowthMoment[], maxItems = 3) {
  return moments.slice(0, maxItems).map((moment) => moment.id)
}

export function buildFirstYearSlots(moments: DemoGrowthMoment[]): AlbumMonthSlot[] {
  return Array.from({ length: 12 }, (_, index) => {
    const moment = moments[index]

    return {
      monthNumber: index + 1,
      momentId: moment?.id ?? null,
      placeholder: !moment,
    }
  })
}

export function buildAlbumExportPayload({
  babyName,
  frameId,
  outputFormat,
  selectedMoments,
  storybookTimelineItemIds = [],
  householdAttribution,
  customText,
  mediaBackupManifest,
  generatedAt = new Date(),
}: {
  babyName: string
  frameId: string
  outputFormat: AlbumOutputFormat
  selectedMoments: DemoGrowthMoment[]
  storybookTimelineItemIds?: string[]
  householdAttribution?: string
  customText?: AlbumCustomText
  mediaBackupManifest?: GrowthTimelineBackupManifest
  generatedAt?: Date
}): AlbumExportPayload {
  const frame = getAlbumFrameById(frameId)

  if (!frame) {
    throw new Error(`Unknown album frame: ${frameId}`)
  }

  return {
    babyName,
    frameId,
    frameName: frame.name,
    outputFormat,
    selectedMomentIds: selectedMoments.map((moment) => moment.id),
    moments: selectedMoments.map((moment) => ({
      id: moment.id,
      caption: moment.caption || 'BabyMinimo memory',
      date: moment.occurredAt.toISOString(),
      momentType: moment.momentType,
    })),
    storybookTimelineItemIds: frame.supportsTimelineItems ? storybookTimelineItemIds : [],
    firstYearSlots: frame.supportsMonthlySlots ? buildFirstYearSlots(selectedMoments) : undefined,
    householdAttribution,
    customText,
    mediaBackupManifest,
    generatedAt: generatedAt.toISOString(),
    storageMode: 'local-user-artifact',
  }
}

function singleFrame(
  id: string,
  name: string,
  photoSlots: number,
  tone: AlbumFrameTemplate['tone'],
  options: Pick<
    AlbumFrameTemplate,
    'availability' | 'disabledReason' | 'supportsTimelineItems' | 'supportsMonthlySlots'
  > = {}
): AlbumFrameTemplate {
  return {
    id,
    name,
    nameKey: `album.frame.${id}`,
    layoutKind: 'single',
    photoSlots,
    tone,
    branding: 'BabyMinimo Memories',
    staticAssetMode: 'styleDefinition',
    previewAssetMode: 'generatedSampleStyle',
    ...options,
  }
}

function collageFrame(
  id: string,
  name: string,
  photoSlots: number,
  tone: AlbumFrameTemplate['tone'],
  options: Pick<AlbumFrameTemplate, 'supportsTimelineItems' | 'supportsMonthlySlots'> = {}
): AlbumFrameTemplate {
  return {
    id,
    name,
    nameKey: `album.frame.${id}`,
    layoutKind: 'collage',
    photoSlots,
    tone,
    branding: 'BabyMinimo Memories',
    staticAssetMode: 'styleDefinition',
    previewAssetMode: 'generatedSampleStyle',
    ...options,
  }
}
