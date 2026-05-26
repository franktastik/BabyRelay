import React, { useEffect, useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Check, ChevronLeft, ChevronRight, FileText, Images, X } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Screen, Button } from '@/src/components/ui'
import {
  ALBUM_FRAMES_PER_PAGE,
  albumFrameCatalog,
  buildAlbumExportPayload,
  getAlbumFrameById,
  getAlbumFramePage,
  getDefaultStorybookTimelineItemIds,
  type AlbumFrameTemplate,
  type AlbumOutputFormat,
} from '@/src/features/album'
import { useGrowthTimeline } from '@/src/features/growth'
import { buildGrowthTimelineBackupManifest } from '@/src/features/growth/mediaDurability'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

export default function ExportAlbumModal() {
  const router = useRouter()
  const { t } = useTranslation()
  const selectedBabyId = useAuthStore((s) => s.selectedBabyId) || 'baby-1'
  const selectedBaby = useAuthStore((s) => s.babies.find((baby) => baby.id === selectedBabyId))
  const babyName = selectedBaby?.name || 'Luna'
  const { moments } = useGrowthTimeline(selectedBabyId)
  const defaultMomentIds = useMemo(() => moments.slice(0, 4).map((moment) => moment.id), [moments])
  const [selectedMomentIds, setSelectedMomentIds] = useState<string[]>(defaultMomentIds)
  const [selectedFrameId, setSelectedFrameId] = useState(albumFrameCatalog[0].id)
  const [outputFormat, setOutputFormat] = useState<AlbumOutputFormat>('pdf')
  const [page, setPage] = useState(0)
  const [storybookItemIds, setStorybookItemIds] = useState<string[]>(() => getDefaultStorybookTimelineItemIds(moments))
  const [customTitle, setCustomTitle] = useState(() => safeTranslate(t, 'album.customText.defaultTitle', 'Our little story'))
  const [customNote, setCustomNote] = useState(() =>
    safeTranslate(t, 'album.customText.defaultNote', 'Tiny moments, beautifully remembered.')
  )
  const [exportReady, setExportReady] = useState(false)

  useEffect(() => {
    if (selectedMomentIds.length === 0 && defaultMomentIds.length > 0) {
      setSelectedMomentIds(defaultMomentIds)
    }

    if (storybookItemIds.length === 0 && moments.length > 0) {
      setStorybookItemIds(getDefaultStorybookTimelineItemIds(moments))
    }
  }, [defaultMomentIds, moments, selectedMomentIds.length, storybookItemIds.length])

  const pageData = getAlbumFramePage(page)
  const selectedFrame = getAlbumFrameById(selectedFrameId) || albumFrameCatalog[0]
  const selectedFrameName = getFrameDisplayName(t, selectedFrame)
  const selectedMoments = moments.filter((moment) => selectedMomentIds.includes(moment.id))
  const mediaBackupManifest = buildGrowthTimelineBackupManifest({
    babyId: selectedBabyId,
    moments: selectedMoments,
  })
  const payload = buildAlbumExportPayload({
    babyName,
    frameId: selectedFrame.id,
    outputFormat,
    selectedMoments,
    storybookTimelineItemIds: storybookItemIds,
    householdAttribution: t('album.householdAttribution'),
    customText: {
      title: customTitle.trim(),
      note: customNote.trim(),
    },
    mediaBackupManifest,
  })

  const toggleMoment = (momentId: string) => {
    setExportReady(false)
    setSelectedMomentIds((current) =>
      current.includes(momentId) ? current.filter((id) => id !== momentId) : [...current, momentId]
    )
  }

  const toggleStorybookItem = (momentId: string) => {
    setExportReady(false)
    setStorybookItemIds((current) =>
      current.includes(momentId) ? current.filter((id) => id !== momentId) : [...current, momentId]
    )
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          >
            <X color={colors.stoneText} size={18} strokeWidth={2.3} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('album.eyebrow')}</Text>
            <Text style={styles.title}>{t('album.title')}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          <AlbumFramePreview
            frame={selectedFrame}
            selectedCount={selectedMoments.length}
            customTitle={customTitle}
          />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{selectedFrameName}</Text>
            <Text style={styles.heroMeta}>
              {safeTranslate(t, 'album.preview.meta', '{slots} photo slots · {type}', {
                slots: selectedFrame.photoSlots,
                type: safeTranslate(
                  t,
                  selectedFrame.layoutKind === 'collage' ? 'album.layout.collage' : 'album.layout.single',
                  selectedFrame.layoutKind === 'collage' ? 'Collage' : 'Single'
                ),
              })}
            </Text>
          </View>
        </View>

        <View style={styles.section} testID="album-custom-text-section">
          <Text style={styles.sectionTitle}>{t('album.customText.title')}</Text>
          <Text style={styles.helperText}>{t('album.customText.meta')}</Text>
          <Text style={styles.inputLabel}>{t('album.customText.titleLabel')}</Text>
          <TextInput
            value={customTitle}
            onChangeText={(value) => {
              setCustomTitle(value)
              setExportReady(false)
            }}
            placeholder={t('album.customText.titlePlaceholder')}
            placeholderTextColor={colors.mutedLight}
            style={styles.textInput}
            accessibilityLabel={t('album.customText.titleLabel')}
            testID="album-custom-title-input"
          />
          <Text style={styles.inputLabel}>{t('album.customText.noteLabel')}</Text>
          <TextInput
            value={customNote}
            onChangeText={(value) => {
              setCustomNote(value)
              setExportReady(false)
            }}
            placeholder={t('album.customText.notePlaceholder')}
            placeholderTextColor={colors.mutedLight}
            style={[styles.textInput, styles.noteInput]}
            multiline
            accessibilityLabel={t('album.customText.noteLabel')}
            testID="album-custom-note-input"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('album.moments.title')}</Text>
            <Text style={styles.sectionMeta}>{t('album.moments.count', { count: selectedMoments.length })}</Text>
          </View>
          {moments.map((moment) => {
            const selected = selectedMomentIds.includes(moment.id)
            return (
              <Pressable
                key={moment.id}
                onPress={() => toggleMoment(moment.id)}
                style={[styles.momentRow, selected && styles.momentRowSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                testID={`album-moment-${moment.id}`}
              >
                <Image source={require('../growth-feet-reference.png')} style={styles.momentImage} />
                <View style={styles.momentCopy}>
                  <Text style={styles.momentTitle}>{moment.caption || t('timeline.growth.defaultTitle')}</Text>
                  <Text style={styles.momentMeta}>{formatAlbumDate(moment.occurredAt)}</Text>
                </View>
                <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
                  {selected ? <Check color={colors.white} size={14} strokeWidth={3} /> : null}
                </View>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('album.frames.title')}</Text>
            <Text style={styles.sectionMeta}>
              {t('album.frames.page', { page: pageData.page + 1, pageCount: pageData.pageCount })}
            </Text>
          </View>
          <View style={styles.frameGrid}>
            {pageData.frames.map((frame) => (
              <Pressable
                key={frame.id}
                onPress={() => {
                  setSelectedFrameId(frame.id)
                  setExportReady(false)
                }}
                style={[styles.frameTile, selectedFrameId === frame.id && styles.frameTileSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedFrameId === frame.id }}
                testID={`album-frame-${frame.id}`}
              >
                <MiniFrame frame={frame} />
                <Text style={styles.frameName}>{getFrameDisplayName(t, frame)}</Text>
                <Text style={styles.frameMeta}>
                  {safeTranslate(
                    t,
                    frame.layoutKind === 'collage' ? 'album.layout.collage' : 'album.layout.single',
                    frame.layoutKind === 'collage' ? 'Collage' : 'Single'
                  )}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPage((current) => Math.max(0, current - 1))}
              disabled={pageData.page === 0}
              style={[styles.pageButton, pageData.page === 0 && styles.pageButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel={t('album.frames.previous')}
              testID="album-frame-page-prev"
            >
              <ChevronLeft color={colors.sageText} size={16} strokeWidth={2.5} />
              <Text style={styles.pageButtonText}>{t('album.frames.previous')}</Text>
            </Pressable>
            <Text style={styles.pageCount}>{`${pageData.frames.length}/${ALBUM_FRAMES_PER_PAGE}`}</Text>
            <Pressable
              onPress={() => setPage((current) => Math.min(pageData.pageCount - 1, current + 1))}
              disabled={pageData.page === pageData.pageCount - 1}
              style={[styles.pageButton, pageData.page === pageData.pageCount - 1 && styles.pageButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel={t('album.frames.next')}
              testID="album-frame-page-next"
            >
              <Text style={styles.pageButtonText}>{t('album.frames.next')}</Text>
              <ChevronRight color={colors.sageText} size={16} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        {selectedFrame.supportsTimelineItems ? (
          <View style={styles.section} testID="album-storybook-editor">
            <Text style={styles.sectionTitle}>{t('album.storybook.title')}</Text>
            <Text style={styles.helperText}>{t('album.storybook.meta')}</Text>
            {moments.slice(0, 4).map((moment) => {
              const selected = storybookItemIds.includes(moment.id)
              return (
                <Pressable
                  key={moment.id}
                  onPress={() => toggleStorybookItem(moment.id)}
                  style={styles.timelineToggle}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  testID={`album-storybook-item-${moment.id}`}
                >
                  <View style={[styles.smallCheck, selected && styles.smallCheckSelected]}>
                    {selected ? <Check color={colors.white} size={11} strokeWidth={3} /> : null}
                  </View>
                  <Text style={styles.timelineToggleText}>{moment.caption || t('timeline.growth.defaultTitle')}</Text>
                </Pressable>
              )
            })}
          </View>
        ) : null}

        {selectedFrame.supportsMonthlySlots ? (
          <View style={styles.section} testID="album-first-year-grid-preview">
            <Text style={styles.sectionTitle}>{t('album.firstYear.title')}</Text>
            <View style={styles.monthGrid}>
              {payload.firstYearSlots?.map((slot) => (
                <View key={slot.monthNumber} style={[styles.monthSlot, slot.placeholder && styles.monthSlotPlaceholder]}>
                  <Text style={styles.monthNumber}>{slot.monthNumber}</Text>
                  <Text style={styles.monthLabel}>{slot.placeholder ? t('album.firstYear.empty') : t('album.firstYear.filled')}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('album.output.title')}</Text>
          <Text style={styles.helperText}>{t('album.mediaBackup.meta')}</Text>
          <View style={styles.outputRow}>
            <OutputButton
              icon="pdf"
              label={t('album.output.pdf')}
              selected={outputFormat === 'pdf'}
              onPress={() => {
                setOutputFormat('pdf')
                setExportReady(false)
              }}
            />
            <OutputButton
              icon="image"
              label={t('album.output.images')}
              selected={outputFormat === 'image-pages'}
              onPress={() => {
                setOutputFormat('image-pages')
                setExportReady(false)
              }}
            />
          </View>
        </View>

        {exportReady ? (
          <View style={styles.readyCard} testID="album-local-export-payload-preview">
            <Text style={styles.readyTitle}>{t('album.ready.title')}</Text>
            <Text style={styles.readyMeta}>
              {t('album.ready.meta', {
                format: outputFormat === 'pdf' ? t('album.output.pdf') : t('album.output.images'),
                frameName: selectedFrameName,
              })}
            </Text>
            <Text style={styles.readyMeta}>
              {t('album.ready.mediaBackup', { count: payload.mediaBackupManifest?.mediaCount ?? 0 })}
            </Text>
          </View>
        ) : null}

        <Button
          variant="primary"
          onPress={() => setExportReady(true)}
          style={styles.exportButton}
          accessibilityLabel={t('album.export.button')}
          testID="album-build-local-export-button"
        >
          <Text style={styles.exportButtonText}>{t('album.export.button')}</Text>
        </Button>
      </ScrollView>
    </Screen>
  )
}

function AlbumFramePreview({
  frame,
  selectedCount,
  customTitle,
}: {
  frame: AlbumFrameTemplate
  selectedCount: number
  customTitle: string
}) {
  const { t } = useTranslation()
  const previewSlotCount = Math.min(frame.photoSlots, frame.supportsMonthlySlots ? 12 : 4)
  const slotIndexes = Array.from({ length: previewSlotCount }, (_, index) => index)

  return (
    <View style={[styles.preview, toneStyle(frame.tone)]} testID="album-frame-preview">
      <View style={styles.previewDecorTop} />
      <View
        style={[
          styles.previewPhotoGrid,
          frame.layoutKind === 'single' && styles.previewPhotoGridSingle,
          frame.supportsMonthlySlots && styles.previewPhotoGridMonthly,
        ]}
      >
        {slotIndexes.map((index) => (
          <View
            key={index}
            style={[
              styles.previewPhotoSlot,
              frame.layoutKind === 'single' && styles.previewPhotoSlotSingle,
              frame.supportsMonthlySlots && styles.previewPhotoSlotMonthly,
            ]}
          >
            {index < Math.max(1, Math.min(selectedCount, previewSlotCount)) ? (
              <Image source={require('../growth-feet-reference.png')} style={styles.previewImage} />
            ) : (
              <Text style={styles.previewPlaceholderText}>{index + 1}</Text>
            )}
          </View>
        ))}
      </View>
      <Text style={styles.previewCaption} numberOfLines={2} adjustsFontSizeToFit>
        {customTitle.trim() || getFrameDisplayName(t, frame)}
      </Text>
      <Text style={styles.previewBrand}>BabyMinimo Memories</Text>
      <Text style={styles.previewCount}>
        {safeTranslate(t, 'album.preview.photoCount', `${selectedCount} photos`, { count: selectedCount })}
      </Text>
    </View>
  )
}

function MiniFrame({ frame }: { frame: AlbumFrameTemplate }) {
  return (
    <View style={[styles.miniFrame, toneStyle(frame.tone)]}>
      {Array.from({ length: Math.min(frame.photoSlots, 4) }, (_, index) => (
        <View key={index} style={[styles.miniSlot, frame.layoutKind === 'single' && styles.miniSlotSingle]} />
      ))}
    </View>
  )
}

function OutputButton({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: 'pdf' | 'image'
  label: string
  selected: boolean
  onPress: () => void
}) {
  const Icon = icon === 'pdf' ? FileText : Images

  return (
    <Pressable
      onPress={onPress}
      style={[styles.outputButton, selected && styles.outputButtonSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Icon color={selected ? colors.white : colors.sageText} size={17} strokeWidth={2.4} />
      <Text style={[styles.outputText, selected && styles.outputTextSelected]}>{label}</Text>
    </Pressable>
  )
}

function toneStyle(tone: AlbumFrameTemplate['tone']) {
  if (tone === 'sage') return styles.toneSage
  if (tone === 'white') return styles.toneWhite
  if (tone === 'floral') return styles.toneFloral
  if (tone === 'gold') return styles.toneGold
  if (tone === 'storybook') return styles.toneStorybook
  return styles.toneCream
}

function formatAlbumDate(date: Date) {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function getFrameDisplayName(
  t: (key: string, options?: Record<string, unknown>) => string,
  frame: AlbumFrameTemplate
) {
  return safeTranslate(t, frame.nameKey, frame.name)
}

function safeTranslate(
  t: (key: string, options?: Record<string, unknown>) => string,
  key: string,
  fallback: string,
  options: Record<string, unknown> = {}
) {
  const translated = t(key, { ...options, defaultValue: fallback })
  return translated === key ? fallback : translated
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: 80,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 42,
  },
  eyebrow: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h2,
    color: colors.ink,
    marginTop: 2,
  },
  heroCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    gap: spacing.base,
    ...shadows.md,
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  heroMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  preview: {
    width: 132,
    minHeight: 170,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewDecorTop: {
    width: 46,
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    marginBottom: spacing.sm,
  },
  previewPhotoGrid: {
    width: 98,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    padding: 3,
  },
  previewPhotoGridSingle: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  previewPhotoGridMonthly: {
    gap: 2,
    alignContent: 'center',
    justifyContent: 'center',
  },
  previewPhotoSlot: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.74)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPhotoSlotSingle: {
    flexBasis: '100%',
  },
  previewPhotoSlotMonthly: {
    flexBasis: '22%',
    flexGrow: 0,
    height: 20,
    borderRadius: 6,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholderText: {
    ...typography.label,
    color: colors.mutedLight,
    fontSize: 8,
  },
  previewCaption: {
    ...typography.label,
    color: colors.ink,
    textAlign: 'center',
  },
  previewBrand: {
    ...typography.label,
    color: colors.sageText,
    fontSize: 9,
    marginTop: spacing.xs,
  },
  previewCount: {
    ...typography.label,
    color: colors.muted,
    fontSize: 9,
    marginTop: spacing.xs,
  },
  section: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.action,
    color: colors.ink,
  },
  sectionMeta: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginBottom: spacing.base,
  },
  inputLabel: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  textInput: {
    ...typography.body,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    color: colors.ink,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    marginBottom: spacing.base,
  },
  noteInput: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  momentRow: {
    minHeight: 68,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.base,
    marginBottom: spacing.sm,
  },
  momentRowSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  momentImage: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  momentCopy: {
    flex: 1,
  },
  momentTitle: {
    ...typography.action,
    color: colors.ink,
  },
  momentMeta: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  frameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frameTile: {
    width: '48%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    padding: spacing.sm,
  },
  frameTileSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  miniFrame: {
    height: 74,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  miniSlot: {
    flexBasis: '45%',
    flexGrow: 1,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniSlotSingle: {
    flexBasis: '100%',
  },
  frameName: {
    ...typography.label,
    color: colors.ink,
  },
  frameMeta: {
    ...typography.label,
    color: colors.muted,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.base,
  },
  pageButton: {
    minHeight: 34,
    borderRadius: radius.full,
    backgroundColor: colors.softSage,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
  pageButtonText: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
  },
  pageCount: {
    ...typography.label,
    color: colors.muted,
  },
  timelineToggle: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  smallCheck: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCheckSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  timelineToggleText: {
    ...typography.bodySmall,
    color: colors.ink,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  monthSlot: {
    width: '22%',
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSlotPlaceholder: {
    borderColor: colors.border,
    backgroundColor: colors.cream,
  },
  monthNumber: {
    ...typography.action,
    color: colors.ink,
  },
  monthLabel: {
    ...typography.label,
    color: colors.muted,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  outputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  outputButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  outputButtonSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  outputText: {
    ...typography.action,
    color: colors.sageText,
  },
  outputTextSelected: {
    color: colors.white,
  },
  readyCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.softSage,
    borderWidth: 1,
    borderColor: colors.sage,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  readyTitle: {
    ...typography.action,
    color: colors.ink,
  },
  readyMeta: {
    ...typography.bodySmall,
    color: colors.sageText,
    marginTop: spacing.xs,
  },
  exportButton: {
    marginBottom: spacing.xl,
  },
  exportButtonText: {
    ...typography.action,
    color: colors.white,
  },
  toneCream: {
    backgroundColor: colors.cream,
  },
  toneSage: {
    backgroundColor: colors.softSage,
  },
  toneWhite: {
    backgroundColor: colors.white,
  },
  toneFloral: {
    backgroundColor: '#FFF7F4',
  },
  toneGold: {
    backgroundColor: '#FFF8E3',
  },
  toneStorybook: {
    backgroundColor: '#FBF4EA',
  },
})
