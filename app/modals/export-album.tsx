import React, { useEffect, useMemo, useState } from 'react'
import { Image, type ImageSourcePropType, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native'
import { Check, ChevronLeft, ChevronRight, FileText, Images, Maximize2, X } from 'lucide-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Screen, Button } from '@/src/components/ui'
import {
  ALBUM_FRAMES_PER_PAGE,
  activeAlbumFrameCatalog,
  buildAlbumExportPayload,
  getActiveAlbumFrameById,
  getActiveAlbumFramePage,
  getDefaultStorybookTimelineItemIds,
  type AlbumFrameTemplate,
  type AlbumOutputFormat,
} from '@/src/features/album'
import { useGrowthTimeline } from '@/src/features/growth'
import { buildGrowthTimelineBackupManifest } from '@/src/features/growth/mediaDurability'
import { useAuthStore } from '@/src/stores/authStore'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const fallbackAlbumPhoto = require('../album-feet-reference.png')
const albumPreviewPhotos: ImageSourcePropType[] = [
  require('../album-test-baby-1.png'),
  require('../album-test-baby-2.png'),
  require('../album-test-baby-3.png'),
  require('../album-test-baby-4.png'),
  require('../album-test-baby-5.png'),
]
const albumGrowthImages: Record<string, ImageSourcePropType> = {
  'growth-feet-reference': require('../growth-feet-reference.png'),
  'album-test-baby-1': require('../album-test-baby-1.png'),
  'album-test-baby-2': require('../album-test-baby-2.png'),
  'album-test-baby-3': require('../album-test-baby-3.png'),
  'album-test-baby-4': require('../album-test-baby-4.png'),
  'album-test-baby-5': require('../album-test-baby-5.png'),
}
const albumThreeDFrameAssets: Record<string, ImageSourcePropType> = {
  'three-d-teddy-fan': require('../album-frame-assets/three-d-teddy-fan.png'),
  'three-d-safari-trio': require('../album-frame-assets/three-d-safari-trio.png'),
  'three-d-woodland-arch': require('../album-frame-assets/three-d-woodland-arch.png'),
  'three-d-dino-cloud': require('../album-frame-assets/three-d-dino-cloud.png'),
  'three-d-moon-cloud': require('../album-frame-assets/three-d-moon-cloud.png'),
  'three-d-rainbow-trio': require('../album-frame-assets/three-d-rainbow-trio.png'),
  'three-d-rose-bow': require('../album-frame-assets/three-d-rose-bow.png'),
  'three-d-ocean-sail': require('../album-frame-assets/three-d-ocean-sail.png'),
  'three-d-balloon-duo': require('../album-frame-assets/three-d-balloon-duo.png'),
  'three-d-castle-portrait': require('../album-frame-assets/three-d-castle-portrait.png'),
}
const ALBUM_TITLE_MAX_LENGTH = 48
const ALBUM_NOTE_MAX_LENGTH = 120
type AlbumFrameColorOption = 'original' | 'cream' | 'sage' | 'pink'
const ALBUM_FRAME_COLOR_OPTIONS: AlbumFrameColorOption[] = ['original', 'cream', 'sage', 'pink']

export default function ExportAlbumModal() {
  const router = useRouter()
  const params = useLocalSearchParams<{ frameId?: string; preview?: string }>()
  const { t } = useTranslation()
  const selectedBabyId = useAuthStore((s) => s.selectedBabyId) || 'baby-1'
  const selectedBaby = useAuthStore((s) => s.babies.find((baby) => baby.id === selectedBabyId))
  const babyName = selectedBaby?.name || 'Luna'
  const { moments } = useGrowthTimeline(selectedBabyId)
  const defaultMomentIds = useMemo(() => moments.slice(0, 5).map((moment) => moment.id), [moments])
  const [selectedMomentIds, setSelectedMomentIds] = useState<string[]>(defaultMomentIds)
  const [selectedFrameId, setSelectedFrameId] = useState(activeAlbumFrameCatalog[0].id)
  const [outputFormat, setOutputFormat] = useState<AlbumOutputFormat>('pdf')
  const [page, setPage] = useState(0)
  const [storybookItemIds, setStorybookItemIds] = useState<string[]>(() => getDefaultStorybookTimelineItemIds(moments))
  const [customTitle, setCustomTitle] = useState(() =>
    clampAlbumText(safeTranslate(t, 'album.customText.defaultTitle', 'Our little story'), ALBUM_TITLE_MAX_LENGTH)
  )
  const [customNote, setCustomNote] = useState(() =>
    clampAlbumText(
      safeTranslate(t, 'album.customText.defaultNote', 'Tiny moments, beautifully remembered.'),
      ALBUM_NOTE_MAX_LENGTH
    )
  )
  const [exportReady, setExportReady] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [decorationsEnabled, setDecorationsEnabled] = useState(false)
  const [frameColorOption, setFrameColorOption] = useState<AlbumFrameColorOption>('original')
  const [showFramePicker, setShowFramePicker] = useState(false)
  const [showCustomText, setShowCustomText] = useState(false)

  useEffect(() => {
    if (!params.frameId) return

    const frame = getActiveAlbumFrameById(params.frameId) || activeAlbumFrameCatalog[0]
    const frameIndex = Math.max(0, activeAlbumFrameCatalog.findIndex((item) => item.id === frame.id))

    setSelectedFrameId(frame.id)
    setPage(Math.floor(frameIndex / ALBUM_FRAMES_PER_PAGE))

    if (params.preview === '1') {
      setPreviewOpen(true)
    }
  }, [params.frameId, params.preview])

  useEffect(() => {
    if (selectedMomentIds.length === 0 && defaultMomentIds.length > 0) {
      setSelectedMomentIds(defaultMomentIds)
    }

    if (storybookItemIds.length === 0 && moments.length > 0) {
      setStorybookItemIds(getDefaultStorybookTimelineItemIds(moments))
    }
  }, [defaultMomentIds, moments, selectedMomentIds.length, storybookItemIds.length])

  const pageData = getActiveAlbumFramePage(page)
  const selectedFrame = getActiveAlbumFrameById(selectedFrameId) || activeAlbumFrameCatalog[0]
  const selectedFrameName = getFrameDisplayName(t, selectedFrame)
  const selectedFrameIndex = Math.max(
    0,
    activeAlbumFrameCatalog.findIndex((frame) => frame.id === selectedFrame.id)
  )
  const selectedMoments = moments.filter((moment) => selectedMomentIds.includes(moment.id))
  const selectedMomentPhotos = selectedMoments.map(getMomentImageSource)
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
      title: clampAlbumText(customTitle, ALBUM_TITLE_MAX_LENGTH).trim(),
      note: clampAlbumText(customNote, ALBUM_NOTE_MAX_LENGTH).trim(),
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

  const closeAlbum = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(tabs)/timeline')
  }

  const selectFrameAtIndex = (index: number) => {
    const nextIndex = (index + activeAlbumFrameCatalog.length) % activeAlbumFrameCatalog.length
    const nextFrame = activeAlbumFrameCatalog[nextIndex]

    setSelectedFrameId(nextFrame.id)
    setPage(Math.floor(nextIndex / ALBUM_FRAMES_PER_PAGE))
    setExportReady(false)
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={closeAlbum}
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
          <Pressable
            onPress={() => setPreviewOpen(true)}
            style={styles.previewButton}
            accessibilityRole="button"
            accessibilityLabel={`${selectedFrameName}. ${t('album.title')}`}
            testID="album-open-frame-preview"
          >
            <AlbumFramePreview
              frame={selectedFrame}
              selectedCount={selectedMoments.length}
              customTitle={customTitle}
              decorationsEnabled={decorationsEnabled}
              colorOption={frameColorOption}
              previewPhotos={selectedMomentPhotos}
            />
            <View style={styles.previewExpandBadge} pointerEvents="none">
              <Maximize2 color={colors.white} size={13} strokeWidth={2.6} />
            </View>
          </Pressable>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{selectedFrameName}</Text>
            <Text style={styles.heroMeta}>
              {safeTranslate(t, 'album.preview.meta', '{slots} photo slots · {type}', {
                slots: selectedFrame.photoSlots,
                type: getAlbumFrameLayoutLabel(t, selectedFrame),
              })}
            </Text>
          </View>
        </View>

        <View style={styles.section} testID="album-custom-text-section">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('album.customText.title')}</Text>
            <Pressable
              onPress={() => setShowCustomText((current) => !current)}
              style={[styles.framePickerToggle, showCustomText && styles.framePickerToggleActive]}
              accessibilityRole="switch"
              accessibilityState={{ checked: showCustomText }}
              accessibilityLabel={safeTranslate(t, 'album.customText.toggle', 'Edit album text')}
              testID="album-custom-text-toggle"
            >
              <Text style={[styles.framePickerToggleText, showCustomText && styles.framePickerToggleTextActive]}>
                {showCustomText
                  ? safeTranslate(t, 'album.decorations.on', 'On')
                  : safeTranslate(t, 'album.decorations.off', 'Off')}
              </Text>
            </Pressable>
          </View>
          {showCustomText ? (
            <>
              <Text style={styles.helperText}>{t('album.customText.meta')}</Text>
              <Text style={styles.inputLabel}>{t('album.customText.titleLabel')}</Text>
              <TextInput
                value={customTitle}
                onChangeText={(value) => {
                  setCustomTitle(clampAlbumText(value, ALBUM_TITLE_MAX_LENGTH))
                  setExportReady(false)
                }}
                maxLength={ALBUM_TITLE_MAX_LENGTH}
                placeholder={t('album.customText.titlePlaceholder')}
                placeholderTextColor={colors.mutedLight}
                style={styles.textInput}
                accessibilityLabel={t('album.customText.titleLabel')}
                testID="album-custom-title-input"
              />
              <Text style={styles.characterCount}>
                {safeTranslate(t, 'album.customText.characterCount', '{count}/{max}', {
                  count: customTitle.length,
                  max: ALBUM_TITLE_MAX_LENGTH,
                })}
              </Text>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>{t('album.customText.noteLabel')}</Text>
                <Text style={[styles.characterCount, styles.inputLabelRowCharacterCount]}>
                  {safeTranslate(t, 'album.customText.characterCount', '{count}/{max}', {
                    count: customNote.length,
                    max: ALBUM_NOTE_MAX_LENGTH,
                  })}
                </Text>
              </View>
              <TextInput
                value={customNote}
                onChangeText={(value) => {
                  setCustomNote(clampAlbumText(value, ALBUM_NOTE_MAX_LENGTH))
                  setExportReady(false)
                }}
                maxLength={ALBUM_NOTE_MAX_LENGTH}
                placeholder={t('album.customText.notePlaceholder')}
                placeholderTextColor={colors.mutedLight}
                style={[styles.textInput, styles.noteInput]}
                multiline
                accessibilityLabel={t('album.customText.noteLabel')}
                testID="album-custom-note-input"
              />
            </>
          ) : (
            <Text style={styles.framePickerOffText}>
              {safeTranslate(t, 'album.customText.offMeta', 'Album text editing is hidden. The default title and note will still be used.')}
            </Text>
          )}
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
                <Image source={getMomentImageSource(moment)} style={styles.momentImage} />
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
            <Pressable
              onPress={() => setShowFramePicker((current) => !current)}
              style={[styles.framePickerToggle, showFramePicker && styles.framePickerToggleActive]}
              accessibilityRole="switch"
              accessibilityState={{ checked: showFramePicker }}
              accessibilityLabel={safeTranslate(t, 'album.frames.toggle', 'Show frame picker')}
              testID="album-frame-picker-toggle"
            >
              <Text style={[styles.framePickerToggleText, showFramePicker && styles.framePickerToggleTextActive]}>
                {showFramePicker
                  ? safeTranslate(t, 'album.decorations.on', 'On')
                  : safeTranslate(t, 'album.decorations.off', 'Off')}
              </Text>
            </Pressable>
          </View>
          {showFramePicker ? (
            <>
              <Text style={[styles.sectionMeta, styles.framePickerPageMeta]}>
                {t('album.frames.page', { page: pageData.page + 1, pageCount: pageData.pageCount })}
              </Text>
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
                    <MiniFrame frame={frame} decorationsEnabled={decorationsEnabled} colorOption={frameColorOption} />
                    <Text style={styles.frameName}>{getFrameDisplayName(t, frame)}</Text>
                    <Text style={styles.frameMeta}>
                      {getAlbumFrameLayoutLabel(t, frame)}
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
            </>
          ) : (
            <Text style={styles.framePickerOffText}>
              {safeTranslate(t, 'album.frames.offMeta', 'Frame picker is hidden. Use the preview arrows to browse frames.')}
            </Text>
          )}
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

      <Modal
        visible={previewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewOpen(false)}
      >
        <View style={styles.previewModalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPreviewOpen(false)}
            accessibilityLabel={t('common.cancel')}
          />
          <View style={styles.previewModalCard} testID="album-frame-preview-modal">
            <View style={styles.previewModalHeader}>
              <View>
                <Text style={styles.previewModalEyebrow}>{t('album.eyebrow')}</Text>
                <Text style={styles.previewModalTitle}>{selectedFrameName}</Text>
              </View>
              <Pressable
                onPress={() => setPreviewOpen(false)}
                style={styles.previewModalClose}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
                testID="album-close-frame-preview"
              >
                <X color={colors.stoneText} size={18} strokeWidth={2.4} />
              </Pressable>
            </View>
            <View style={styles.previewModalPreviewShell}>
              <AlbumFramePreview
                frame={selectedFrame}
                selectedCount={selectedMoments.length}
                customTitle={customTitle}
                decorationsEnabled={decorationsEnabled}
                colorOption={frameColorOption}
                previewPhotos={selectedMomentPhotos}
                variant="large"
              />
              <Pressable
                onPress={() => selectFrameAtIndex(selectedFrameIndex - 1)}
                style={[styles.previewModalNavButton, styles.previewModalNavLeft]}
                accessibilityRole="button"
                accessibilityLabel={safeTranslate(t, 'album.preview.previousFrame', 'Previous frame')}
                testID="album-preview-previous-frame"
              >
                <ChevronLeft color={colors.white} size={24} strokeWidth={2.8} />
              </Pressable>
              <Pressable
                onPress={() => selectFrameAtIndex(selectedFrameIndex + 1)}
                style={[styles.previewModalNavButton, styles.previewModalNavRight]}
                accessibilityRole="button"
                accessibilityLabel={safeTranslate(t, 'album.preview.nextFrame', 'Next frame')}
                testID="album-preview-next-frame"
              >
                <ChevronRight color={colors.white} size={24} strokeWidth={2.8} />
              </Pressable>
            </View>
            <View style={styles.previewModalControlRow}>
              <View style={styles.previewModalSwatches} accessibilityLabel={safeTranslate(t, 'album.color.title', 'Frame color')}>
                {ALBUM_FRAME_COLOR_OPTIONS.map((option) => {
                  const selected = frameColorOption === option
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setFrameColorOption(option)}
                      style={[
                        styles.previewModalColorSwatch,
                        { backgroundColor: getFrameColorPalette(option).background },
                        selected && styles.previewModalColorSwatchSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={safeTranslate(t, `album.color.${option}`, getFrameColorPalette(option).label)}
                      testID={`album-preview-color-${option}`}
                    >
                      {selected ? <View style={[styles.previewModalColorSwatchDot, { backgroundColor: getFrameColorPalette(option).accent }]} /> : null}
                    </Pressable>
                  )
                })}
              </View>
              <Pressable
                onPress={() => setDecorationsEnabled((current) => !current)}
                style={[
                  styles.previewModalDecorationToggle,
                  decorationsEnabled && styles.previewModalDecorationToggleActive,
                ]}
                accessibilityRole="switch"
                accessibilityState={{ checked: decorationsEnabled }}
                accessibilityLabel={safeTranslate(t, 'album.preview.decorationsToggle', 'Toggle frame decorations')}
                testID="album-preview-decorations-toggle"
              >
                <View
                  style={[
                    styles.previewModalDecorationKnob,
                    decorationsEnabled && styles.previewModalDecorationKnobActive,
                  ]}
                >
                  {decorationsEnabled ? <Check color={colors.white} size={10} strokeWidth={3} /> : null}
                </View>
                <Text
                  style={[
                    styles.previewModalDecorationText,
                    decorationsEnabled && styles.previewModalDecorationTextActive,
                  ]}
                >
                  {decorationsEnabled
                    ? safeTranslate(t, 'album.decorations.on', 'On')
                    : safeTranslate(t, 'album.decorations.off', 'Off')}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.previewModalMeta}>
              {safeTranslate(t, 'album.preview.meta', '{slots} photo slots · {type}', {
                slots: selectedFrame.photoSlots,
                type: getAlbumFrameLayoutLabel(t, selectedFrame),
              })}
            </Text>
          </View>
        </View>
      </Modal>
    </Screen>
  )
}

function AlbumFramePreview({
  frame,
  selectedCount,
  customTitle,
  decorationsEnabled,
  colorOption,
  previewPhotos,
  variant = 'compact',
}: {
  frame: AlbumFrameTemplate
  selectedCount: number
  customTitle: string
  decorationsEnabled: boolean
  colorOption: AlbumFrameColorOption
  previewPhotos: ImageSourcePropType[]
  variant?: 'compact' | 'large'
}) {
  const { t } = useTranslation()
  const palette = getFrameColorPalette(colorOption)
  const large = variant === 'large'
  const compactCollage = !large && frame.layoutKind === 'collage' && !frame.supportsMonthlySlots
  const largeCollage = large && frame.layoutKind === 'collage' && !frame.supportsMonthlySlots
  const largeTwoPhotoCollage = largeCollage && frame.photoSlots <= 2
  const largeThreePhotoCollage = largeCollage && frame.photoSlots === 3
  const stepFrameSlotCount = getStepMilestoneSlotCount(frame.id)
  const isStepFrame = stepFrameSlotCount > 0
  const isFanFoldFrame = frame.id === 'fan-fold-trio'
  const threeDFrameAsset = albumThreeDFrameAssets[frame.id]
  const isThreeDFrame = Boolean(threeDFrameAsset)
  const largeSingle = large && frame.layoutKind === 'single' && !isStepFrame && !isFanFoldFrame && !isThreeDFrame
  const previewSlotCount = isStepFrame || isFanFoldFrame || isThreeDFrame
    ? frame.photoSlots
    : Math.min(frame.photoSlots, frame.supportsMonthlySlots ? 12 : 4)
  const slotIndexes = Array.from({ length: previewSlotCount }, (_, index) => index)
  const availablePhotos = previewPhotos.length > 0 ? previewPhotos : albumPreviewPhotos
  const displayedPhotoCount = Math.min(selectedCount, previewSlotCount)

  return (
    <View
      style={[
        styles.preview,
        large && styles.previewLarge,
        largeSingle && styles.previewLargeSingle,
        large && isThreeDFrame && styles.previewLargeThreeD,
        largeTwoPhotoCollage && styles.previewLargeTwoPhoto,
        toneStyle(frame.tone),
        frameColorOverrideStyle(colorOption),
      ]}
      testID="album-frame-preview"
    >
      {decorationsEnabled ? (
        colorOption === 'original' ? (
          <FrameDecorations frame={frame} variant={variant} />
        ) : (
          <FramePaletteDecorations colorOption={colorOption} variant={variant} />
        )
      ) : null}
      <View
        style={[
          styles.previewDecorTop,
          large && styles.previewDecorTopLarge,
          largeTwoPhotoCollage && styles.previewDecorTopLargeTwoPhoto,
          { backgroundColor: palette.accent },
        ]}
      />
      <View
        style={[
          styles.previewPhotoGrid,
          large && styles.previewPhotoGridLarge,
          frame.layoutKind === 'single' && !isStepFrame && !isFanFoldFrame && !isThreeDFrame && styles.previewPhotoGridSingle,
          largeSingle && styles.previewPhotoGridLargeSingle,
          isStepFrame && styles.previewPhotoGridSteps,
          large && isStepFrame && styles.previewPhotoGridStepsLarge,
          isFanFoldFrame && styles.previewPhotoGridFanFold,
          large && isFanFoldFrame && styles.previewPhotoGridFanFoldLarge,
          isThreeDFrame && styles.previewPhotoGridThreeD,
          large && isThreeDFrame && styles.previewPhotoGridThreeDLarge,
          compactCollage && styles.previewPhotoGridCompactCollage,
          largeCollage && styles.previewPhotoGridLargeCollage,
          largeTwoPhotoCollage && styles.previewPhotoGridLargeTwoPhoto,
          largeThreePhotoCollage && styles.previewPhotoGridLargeThreePhoto,
          frame.supportsMonthlySlots && styles.previewPhotoGridMonthly,
          large && frame.supportsMonthlySlots && styles.previewPhotoGridMonthlyLarge,
        ]}
      >
        {threeDFrameAsset ? (
          <Image source={threeDFrameAsset} style={styles.previewThreeDFrameAsset} resizeMode="contain" />
        ) : null}
        {slotIndexes.map((index) => (
          <View
            key={index}
            style={[
              styles.previewPhotoSlot,
              frame.layoutKind === 'single' && !isStepFrame && !isFanFoldFrame && !isThreeDFrame && styles.previewPhotoSlotSingle,
              isStepFrame && styles.previewPhotoSlotStep,
              getStepMilestoneSlotStyle(frame.id, index, large),
              isFanFoldFrame && styles.previewPhotoSlotFanFold,
              isFanFoldFrame && getFanFoldSlotStyle(index, large),
              isThreeDFrame && styles.previewPhotoSlotThreeD,
              isThreeDFrame && getThreeDFrameSlotStyle(frame.id, index),
              compactCollage && styles.previewPhotoSlotCompactCollage,
              compactCollage && frame.photoSlots <= 2 && styles.previewPhotoSlotCompactTwo,
              largeCollage && styles.previewPhotoSlotLargeCollage,
              largeTwoPhotoCollage && styles.previewPhotoSlotLargeTwoPhoto,
              largeThreePhotoCollage && styles.previewPhotoSlotLargeThreePhoto,
              largeThreePhotoCollage && index === 0 && styles.previewPhotoSlotLargeThreePhotoFirst,
              largeThreePhotoCollage && index === 1 && styles.previewPhotoSlotLargeThreePhotoSecond,
              largeThreePhotoCollage && index === 2 && styles.previewPhotoSlotLargeThreePhotoThird,
              frame.supportsMonthlySlots && styles.previewPhotoSlotMonthly,
              large && frame.supportsMonthlySlots && styles.previewPhotoSlotMonthlyLarge,
            ]}
          >
            {index < Math.max(1, displayedPhotoCount) ? (
              <Image
                source={availablePhotos[index % availablePhotos.length]}
                style={styles.previewImage}
                resizeMode={isThreeDFrame ? 'cover' : large ? 'contain' : 'cover'}
              />
            ) : (
              <Text style={[styles.previewPlaceholderText, large && styles.previewPlaceholderTextLarge]}>{index + 1}</Text>
            )}
          </View>
        ))}
      </View>
      {isThreeDFrame ? null : (
        <>
          <Text style={[styles.previewCaption, large && styles.previewCaptionLarge]} numberOfLines={2} adjustsFontSizeToFit>
            {customTitle.trim() || getFrameDisplayName(t, frame)}
          </Text>
          <Text style={[styles.previewBrand, large && styles.previewBrandLarge, { color: palette.brand }]}>BabyMinimo Memories</Text>
          <Text style={[styles.previewCount, large && styles.previewCountLarge]}>
            {safeTranslate(t, 'album.preview.photoCount', `${displayedPhotoCount} photos`, { count: displayedPhotoCount })}
          </Text>
        </>
      )}
    </View>
  )
}

function getStepMilestoneSlotCount(frameId: string) {
  if (frameId === 'three-month-steps') return 3
  if (frameId === 'six-month-steps') return 6
  if (frameId === 'twelve-month-steps') return 12
  return 0
}

function getStepMilestoneSlotStyle(frameId: string, index: number, large: boolean): ViewStyle | null {
  const stepSlots: Record<string, Array<{ left: number; top: number; width: number; height: number }>> = {
    'three-month-steps': [
      { left: 5, top: 56, width: 32, height: 35 },
      { left: 34, top: 32, width: 32, height: 35 },
      { left: 63, top: 8, width: 32, height: 35 },
    ],
    'six-month-steps': [
      { left: 4, top: 65, width: 27, height: 28 },
      { left: 19, top: 49, width: 27, height: 28 },
      { left: 34, top: 34, width: 27, height: 28 },
      { left: 49, top: 20, width: 27, height: 28 },
      { left: 64, top: 9, width: 27, height: 28 },
      { left: 69, top: 50, width: 27, height: 28 },
    ],
    'twelve-month-steps': [
      { left: 5, top: 67, width: 18, height: 22 },
      { left: 27, top: 67, width: 18, height: 22 },
      { left: 49, top: 67, width: 18, height: 22 },
      { left: 71, top: 67, width: 18, height: 22 },
      { left: 13, top: 43, width: 18, height: 22 },
      { left: 35, top: 43, width: 18, height: 22 },
      { left: 57, top: 43, width: 18, height: 22 },
      { left: 79, top: 43, width: 18, height: 22 },
      { left: 21, top: 19, width: 18, height: 22 },
      { left: 43, top: 19, width: 18, height: 22 },
      { left: 65, top: 19, width: 18, height: 22 },
      { left: 77, top: 3, width: 18, height: 22 },
    ],
  }

  const slot = stepSlots[frameId]?.[index]
  if (!slot) return null

  const heightScale = large ? 2.55 : 1
  return {
    left: `${slot.left}%`,
    top: `${slot.top}%`,
    width: `${slot.width}%`,
    height: Math.round(slot.height * heightScale),
  } as ViewStyle
}

function getFanFoldSlotStyle(index: number, large: boolean): ViewStyle | null {
  const slots = [
    { left: 12, top: 22, rotate: '-16deg', zIndex: 1 },
    { left: 35, top: 12, rotate: '0deg', zIndex: 3 },
    { left: 58, top: 22, rotate: '16deg', zIndex: 2 },
  ]
  const slot = slots[index]
  if (!slot) return null

  return {
    left: `${slot.left}%`,
    top: `${slot.top}%`,
    width: large ? '30%' : '31%',
    height: large ? 170 : 58,
    zIndex: slot.zIndex,
    transform: [{ rotate: slot.rotate }],
  } as ViewStyle
}

function getThreeDFrameSlotStyle(frameId: string, index: number): ViewStyle | null {
  const slots: Record<string, Array<{ left: number; top: number; width: number; height: number; rotate?: string; radius?: number }>> = {
    'three-d-teddy-fan': [
      { left: 11.34, top: 27.47, width: 22.99, height: 39.71, rotate: '-11deg', radius: 12 },
      { left: 39.03, top: 23.29, width: 22.99, height: 45.98, radius: 12 },
      { left: 65.68, top: 27.47, width: 22.99, height: 39.71, rotate: '11deg', radius: 12 },
    ],
    'three-d-safari-trio': [
      { left: 15, top: 25.34, width: 20.49, height: 38.93, rotate: '-10deg', radius: 10 },
      { left: 39.59, top: 21.24, width: 20.49, height: 45.08, radius: 10 },
      { left: 64.18, top: 25.34, width: 20.49, height: 38.93, rotate: '10deg', radius: 10 },
    ],
    'three-d-woodland-arch': [{ left: 30.51, top: 21.52, width: 37.35, height: 55.5, radius: 999 }],
    'three-d-dino-cloud': [{ left: 31.12, top: 21.01, width: 35, height: 51.48, radius: 18 }],
    'three-d-moon-cloud': [{ left: 32.38, top: 21.44, width: 33.69, height: 52.16, radius: 16 }],
    'three-d-rainbow-trio': [
      { left: 20.15, top: 31.38, width: 21.2, height: 39.22, rotate: '-9deg', radius: 10 },
      { left: 40.29, top: 26.08, width: 21.2, height: 45.58, radius: 10 },
      { left: 60.43, top: 31.38, width: 21.2, height: 39.22, rotate: '9deg', radius: 10 },
    ],
    'three-d-rose-bow': [{ left: 30.88, top: 19.19, width: 37.91, height: 53.27, radius: 20 }],
    'three-d-ocean-sail': [{ left: 31.58, top: 22.59, width: 35.22, height: 52.29, radius: 16 }],
    'three-d-balloon-duo': [
      { left: 21.98, top: 29.87, width: 25.77, height: 43.71, rotate: '-8deg', radius: 11 },
      { left: 54.48, top: 29.87, width: 25.77, height: 43.71, rotate: '8deg', radius: 11 },
    ],
    'three-d-castle-portrait': [{ left: 35.02, top: 22.61, width: 34.07, height: 53.85, radius: 18 }],
  }

  const slot = slots[frameId]?.[index]
  if (!slot) return null

  const style: ViewStyle = {
    left: `${slot.left}%`,
    top: `${slot.top}%`,
    width: `${slot.width}%`,
    height: `${slot.height}%`,
    borderRadius: slot.radius ?? radius.sm,
  } as ViewStyle

  if (slot.rotate) {
    style.transform = [{ rotate: slot.rotate }]
  }

  return style
}

function FrameDecorations({ frame, variant }: { frame: AlbumFrameTemplate; variant: 'compact' | 'large' }) {
  const large = variant === 'large'
  const decoration = getFrameDecorationStyle(frame.id)

  return (
    <View pointerEvents="none" style={styles.frameDecorationLayer}>
      {decoration === 'blushGallery' ? (
        <>
          <View style={[styles.frameBlushMat, large && styles.frameBlushMatLarge]} />
          <Text style={[styles.frameBlushPetal, styles.frameBlushPetalTopLeft, large && styles.frameBlushPetalLarge]}>✿</Text>
          <Text style={[styles.frameBlushPetal, styles.frameBlushPetalBottomRight, large && styles.frameBlushPetalLarge]}>✿</Text>
        </>
      ) : null}
      {decoration === 'roseFloral' ? (
        <>
          <FrameRoseCorners large={large} color="#B94A61" />
          <Text style={[styles.frameRoseSpray, styles.frameRoseSprayTopLeft, large && styles.frameRoseSprayLarge]}>✽</Text>
          <Text style={[styles.frameRoseSpray, styles.frameRoseSprayBottomRight, large && styles.frameRoseSprayLarge]}>✽</Text>
        </>
      ) : null}
      {decoration === 'blushMoon' ? (
        <>
          <View style={[styles.frameBlushMat, large && styles.frameBlushMatLarge]} />
          <Text style={[styles.frameMoon, styles.frameMoonBlush, large && styles.frameMoonLarge]}>☾</Text>
          <Text style={[styles.frameBlushStars, styles.frameBlushStarsTopRight, large && styles.frameBlushStarsLarge]}>✦ ✧</Text>
          <Text style={[styles.frameBlushPetal, styles.frameBlushPetalBottomLeft, large && styles.frameBlushPetalLarge]}>✿</Text>
        </>
      ) : null}
      {decoration === 'classic' ? (
        <>
          <FrameCornerLines large={large} />
          <Text style={[styles.frameTinyHeart, large && styles.frameTinyHeartLarge]}>♥</Text>
          <Text style={[styles.frameClassicDot, styles.frameClassicDotTopLeft, large && styles.frameClassicDotLarge]}>✣</Text>
          <Text style={[styles.frameClassicDot, styles.frameClassicDotTopRight, large && styles.frameClassicDotLarge]}>✣</Text>
          <Text style={[styles.frameClassicDot, styles.frameClassicDotBottomLeft, large && styles.frameClassicDotLarge]}>✣</Text>
          <Text style={[styles.frameClassicDot, styles.frameClassicDotBottomRight, large && styles.frameClassicDotLarge]}>✣</Text>
        </>
      ) : null}
      {decoration === 'sage' ? (
        <>
          <View style={[styles.frameInsetBorder, styles.frameInsetBorderSage, large && styles.frameInsetBorderLarge]} />
          <Text style={[styles.frameLeafGarlandTop, large && styles.frameLeafGarlandTopLarge]}>‹‹  ❧  ♥  ❧  ››</Text>
          <Text style={[styles.frameWhiteSprig, styles.frameWhiteSprigRight, large && styles.frameWhiteSprigLarge]}>❧</Text>
          <Text style={[styles.frameWhiteSprig, styles.frameWhiteSprigBottomLeft, large && styles.frameWhiteSprigLarge]}>❧</Text>
        </>
      ) : null}
      {decoration === 'storybook' ? (
        <>
          <Text style={[styles.frameVineCorner, styles.frameVineTopLeft, large && styles.frameVineCornerLarge]}>⌞❧</Text>
          <Text style={[styles.frameVineCorner, styles.frameVineBottomRight, large && styles.frameVineCornerLarge]}>❧⌟</Text>
          <Text style={[styles.frameMoon, large && styles.frameMoonLarge]}>☾</Text>
          <Text style={[styles.frameStars, styles.frameStarsTopRight, large && styles.frameStarsLarge]}>✦ ✧</Text>
          <Text style={[styles.frameStars, styles.frameStarsLeft, large && styles.frameStarsLarge]}>✧</Text>
        </>
      ) : null}
      {decoration === 'milestone' ? (
        <>
          <FrameMilestoneRulers large={large} />
        </>
      ) : null}
      {decoration === 'printShop' ? (
        <>
          <View style={[styles.frameInsetBorder, styles.frameInsetBorderGold, large && styles.frameInsetBorderLarge]} />
          <View style={[styles.frameInsetBorder, styles.frameInsetBorderFine, large && styles.frameInsetBorderFineLarge]} />
          <Text style={[styles.frameTinyHeart, large && styles.frameTinyHeartLarge]}>♥</Text>
          <Text style={[styles.framePrintCorner, styles.framePrintTopLeft, large && styles.framePrintCornerLarge]}>⌜</Text>
          <Text style={[styles.framePrintCorner, styles.framePrintTopRight, large && styles.framePrintCornerLarge]}>⌝</Text>
          <Text style={[styles.framePrintCorner, styles.framePrintBottomLeft, large && styles.framePrintCornerLarge]}>⌞</Text>
          <Text style={[styles.framePrintCorner, styles.framePrintBottomRight, large && styles.framePrintCornerLarge]}>⌟</Text>
        </>
      ) : null}
      {decoration === 'twoTogether' ? (
        <>
          <FrameTwinMarks large={large} />
        </>
      ) : null}
      {decoration === 'strip' ? (
        <>
          <FrameStripRails large={large} />
        </>
      ) : null}
      {decoration === 'grid' ? (
        <>
          <FrameCornerLines large={large} />
          <View style={[styles.frameInsetBorder, styles.frameInsetBorderFine, large && styles.frameInsetBorderFineLarge]} />
        </>
      ) : null}
      {decoration === 'familyCircle' ? (
        <>
          <Text style={[styles.frameArchSprig, styles.frameArchSprigLeft, large && styles.frameArchSprigLarge]}>❧</Text>
          <Text style={[styles.frameArchSprig, styles.frameArchSprigRight, large && styles.frameArchSprigLarge]}>❧</Text>
        </>
      ) : null}
      {decoration === 'scrapbook' ? (
        <>
          <View style={[styles.frameTape, styles.frameTapeLeft, large && styles.frameTapeLarge]} />
          <View style={[styles.frameTape, styles.frameTapeRight, large && styles.frameTapeLarge]} />
          <Text style={[styles.frameFineSprig, styles.frameFineSprigBottomLeft, large && styles.frameFineSprigLarge]}>❧</Text>
          <Text style={[styles.frameScriptBottomRight, large && styles.frameScriptBottomRightLarge]}>⌁  ♥</Text>
        </>
      ) : null}
      {decoration === 'firstYear' ? (
        <>
          <FrameCornerLines large={large} />
        </>
      ) : null}
      {decoration === 'grandparent' ? (
        <>
          <Text style={[styles.frameLargeBloom, styles.frameLargeBloomTopLeft, large && styles.frameLargeBloomLarge]}>✿</Text>
          <Text style={[styles.frameVineCorner, styles.frameVineTopRight, large && styles.frameVineCornerLarge]}>❧</Text>
          <Text style={[styles.frameVineCorner, styles.frameVineBottomLeft, large && styles.frameVineCornerLarge]}>❧</Text>
        </>
      ) : null}
      {decoration === 'tinyToes' ? (
        <>
          <Text style={[styles.frameTinyFootprints, styles.frameTinyFootprintsTop, large && styles.frameTinyFootprintsLarge]}>• •</Text>
          <Text style={[styles.frameTinyFootprints, styles.frameTinyFootprintsBottom, large && styles.frameTinyFootprintsLarge]}>• •</Text>
          <Text style={[styles.frameTinyHeart, large && styles.frameTinyHeartLarge]}>♥</Text>
        </>
      ) : null}
      {decoration === 'welcomeHome' ? (
        <>
          <View style={[styles.frameInsetBorder, styles.frameInsetBorderSage, large && styles.frameInsetBorderLarge]} />
          <Text style={[styles.frameHouseMark, large && styles.frameHouseMarkLarge]}>⌂</Text>
        </>
      ) : null}
      {decoration === 'littleStar' ? (
        <>
          <Text style={[styles.frameStars, styles.frameStarsTopRight, large && styles.frameStarsLarge]}>✦ ✧ ✦</Text>
          <Text style={[styles.frameStars, styles.frameStarsLeft, large && styles.frameStarsLarge]}>✧</Text>
        </>
      ) : null}
      {decoration === 'heirloom' ? (
        <>
          <View style={[styles.frameInsetBorder, styles.frameInsetBorderGold, large && styles.frameInsetBorderLarge]} />
          <Text style={[styles.frameSmallGarlandTop, large && styles.frameSmallGarlandTopLarge]}>❧  ♥  ❧</Text>
        </>
      ) : null}
      {decoration === 'roseGarden' ? (
        <>
          <FrameRoseCorners large={large} color="#A93A4F" />
          <Text style={[styles.frameRoseBud, styles.frameRoseBudTopRight, large && styles.frameRoseBudLarge]}>●</Text>
          <Text style={[styles.frameRoseBud, styles.frameRoseBudBottomLeft, large && styles.frameRoseBudLarge]}>●</Text>
        </>
      ) : null}
      {decoration === 'pinkPeony' ? (
        <>
          <View style={[styles.framePeonyWash, large && styles.framePeonyWashLarge]} />
          <Text style={[styles.framePeonyBloom, styles.framePeonyBloomTopLeft, large && styles.framePeonyBloomLarge]}>✿</Text>
          <Text style={[styles.framePeonyBloom, styles.framePeonyBloomBottomRight, large && styles.framePeonyBloomLarge]}>✿</Text>
        </>
      ) : null}
      {decoration === 'blushBow' ? (
        <>
          <FrameBowRibbon large={large} />
        </>
      ) : null}
      {decoration === 'redRose' ? (
        <>
          <View style={[styles.frameRoseBorder, large && styles.frameRoseBorderLarge]} />
          <Text style={[styles.frameRedRose, styles.frameRedRoseTopLeft, large && styles.frameRedRoseLarge]}>✹</Text>
          <Text style={[styles.frameRedRose, styles.frameRedRoseBottomRight, large && styles.frameRedRoseLarge]}>✹</Text>
        </>
      ) : null}
      {decoration === 'butterflyBlush' ? (
        <>
          <Text style={[styles.frameButterfly, styles.frameButterflyTopLeft, large && styles.frameButterflyLarge]}>♡</Text>
          <Text style={[styles.frameButterfly, styles.frameButterflyBottomRight, large && styles.frameButterflyLarge]}>♡</Text>
          <View style={[styles.frameBlushMat, large && styles.frameBlushMatLarge]} />
        </>
      ) : null}
      {decoration === 'lacePrincess' ? (
        <>
          <FrameLaceDots large={large} />
          <Text style={[styles.frameLaceCrown, large && styles.frameLaceCrownLarge]}>♕</Text>
        </>
      ) : null}
      {decoration === 'gardenParty' ? (
        <>
          <Text style={[styles.frameGardenBloom, styles.frameGardenBloomTopLeft, large && styles.frameGardenBloomLarge]}>✿</Text>
          <Text style={[styles.frameGardenBloom, styles.frameGardenBloomTopRight, large && styles.frameGardenBloomLarge]}>✽</Text>
          <Text style={[styles.frameGardenBloom, styles.frameGardenBloomBottomLeft, large && styles.frameGardenBloomLarge]}>✾</Text>
          <Text style={[styles.frameGardenBloom, styles.frameGardenBloomBottomRight, large && styles.frameGardenBloomLarge]}>✿</Text>
        </>
      ) : null}
      {decoration === 'curlingVine' ? (
        <>
          <FrameCurlingLines large={large} color="#82937D" />
          <Text style={[styles.frameCurlLeaf, styles.frameCurlLeafTopRight, large && styles.frameCurlLeafLarge]}>❧</Text>
          <Text style={[styles.frameCurlLeaf, styles.frameCurlLeafBottomLeft, large && styles.frameCurlLeafLarge]}>❧</Text>
        </>
      ) : null}
      {decoration === 'roseLace' ? (
        <>
          <FrameLaceDots large={large} />
          <FrameRoseCorners large={large} color="#C85C75" />
        </>
      ) : null}
      {decoration === 'daisyChain' ? (
        <>
          <FrameDaisyChain large={large} />
        </>
      ) : null}
      {decoration === 'pearlOval' ? (
        <>
          <FramePearlOval large={large} />
        </>
      ) : null}
      {decoration === 'nurseryPlaid' ? (
        <>
          <FramePlaidLines large={large} />
        </>
      ) : null}
      {decoration === 'cloudDream' ? (
        <>
          <Text style={[styles.frameCloud, styles.frameCloudTopLeft, large && styles.frameCloudLarge]}>☁</Text>
          <Text style={[styles.frameCloud, styles.frameCloudBottomRight, large && styles.frameCloudLarge]}>☁</Text>
          <Text style={[styles.frameCloudStar, styles.frameCloudStarTopRight, large && styles.frameCloudStarLarge]}>✦</Text>
        </>
      ) : null}
      {decoration === 'goldenScroll' ? (
        <>
          <FrameScrollCorners large={large} />
        </>
      ) : null}
      {decoration === 'meadowWreath' ? (
        <>
          <Text style={[styles.frameMeadowStem, styles.frameMeadowStemLeft, large && styles.frameMeadowStemLarge]}>❦</Text>
          <Text style={[styles.frameMeadowStem, styles.frameMeadowStemRight, large && styles.frameMeadowStemLarge]}>❦</Text>
          <Text style={[styles.frameMeadowBloom, styles.frameMeadowBloomBottomLeft, large && styles.frameMeadowBloomLarge]}>✿</Text>
        </>
      ) : null}
      {decoration === 'ribbonKeepsake' ? (
        <>
          <FrameBowRibbon large={large} />
          <View style={[styles.frameRibbonTail, styles.frameRibbonTailLeft, large && styles.frameRibbonTailLarge]} />
          <View style={[styles.frameRibbonTail, styles.frameRibbonTailRight, large && styles.frameRibbonTailLarge]} />
        </>
      ) : null}
      {decoration === 'blushPolka' ? (
        <>
          <FramePolkaDots large={large} />
        </>
      ) : null}
      {decoration === 'storybookCurl' ? (
        <>
          <FrameCurlingLines large={large} color="#B48A52" />
          <Text style={[styles.frameOpenBook, large && styles.frameOpenBookLarge]}>⌁</Text>
          <Text style={[styles.frameStars, styles.frameStarsTopRight, large && styles.frameStarsLarge]}>✧</Text>
        </>
      ) : null}
      {decoration === 'littleCrown' ? (
        <>
          <View style={[styles.frameCrownRule, large && styles.frameCrownRuleLarge]} />
          <Text style={[styles.frameLaceCrown, large && styles.frameLaceCrownLarge]}>♕</Text>
          <Text style={[styles.frameTinyHeart, large && styles.frameTinyHeartLarge]}>♥</Text>
        </>
      ) : null}
      {decoration === 'gardenArch' ? (
        <>
          <View style={[styles.frameGardenArch, large && styles.frameGardenArchLarge]} />
          <Text style={[styles.frameGardenBloom, styles.frameGardenBloomTopLeft, large && styles.frameGardenBloomLarge]}>✿</Text>
          <Text style={[styles.frameGardenBloom, styles.frameGardenBloomBottomRight, large && styles.frameGardenBloomLarge]}>✾</Text>
        </>
      ) : null}
    </View>
  )
}

function MiniFrame({
  frame,
  decorationsEnabled,
  colorOption,
}: {
  frame: AlbumFrameTemplate
  decorationsEnabled: boolean
  colorOption: AlbumFrameColorOption
}) {
  const threeDFrameAsset = albumThreeDFrameAssets[frame.id]

  return (
    <View style={[styles.miniFrame, toneStyle(frame.tone), frameColorOverrideStyle(colorOption)]}>
      {threeDFrameAsset ? (
        <Image source={threeDFrameAsset} style={styles.miniThreeDFrameAsset} resizeMode="contain" />
      ) : null}
      {decorationsEnabled ? (
        colorOption === 'original' ? (
          <FrameDecorations frame={frame} variant="compact" />
        ) : (
          <FramePaletteDecorations colorOption={colorOption} variant="compact" />
        )
      ) : null}
      {threeDFrameAsset
        ? null
        : Array.from({ length: Math.min(frame.photoSlots, 4) }, (_, index) => (
            <View key={index} style={[styles.miniSlot, frame.layoutKind === 'single' && styles.miniSlotSingle]} />
          ))}
    </View>
  )
}

function FramePaletteDecorations({
  colorOption,
  variant,
}: {
  colorOption: AlbumFrameColorOption
  variant: 'compact' | 'large'
}) {
  const large = variant === 'large'
  const palette = getFrameColorPalette(colorOption)

  return (
    <View pointerEvents="none" style={styles.frameDecorationLayer}>
      <View style={[styles.frameCornerLine, large && styles.frameCornerLineLarge, styles.frameCornerTopLeft, { borderColor: palette.accent }]} />
      <View style={[styles.frameCornerLine, large && styles.frameCornerLineLarge, styles.frameCornerTopRight, { borderColor: palette.accent }]} />
      <View style={[styles.frameCornerLine, large && styles.frameCornerLineLarge, styles.frameCornerBottomLeft, { borderColor: palette.accent }]} />
      <View style={[styles.frameCornerLine, large && styles.frameCornerLineLarge, styles.frameCornerBottomRight, { borderColor: palette.accent }]} />
      <Text style={[styles.frameTinyHeart, large && styles.frameTinyHeartLarge, { color: palette.accent }]}>♥</Text>
      <Text style={[styles.frameFloral, styles.frameFloralTopLeft, large && styles.frameFloralLarge, { color: palette.decoration }]}>✿</Text>
      <Text style={[styles.frameFloral, styles.frameFloralBottomRight, large && styles.frameFloralLarge, { color: palette.decoration }]}>✿</Text>
    </View>
  )
}

function FrameCornerLines({ large }: { large: boolean }) {
  return (
    <>
      <View style={[styles.frameCornerLine, large && styles.frameCornerLineLarge, styles.frameCornerTopLeft]} />
      <View style={[styles.frameCornerLine, large && styles.frameCornerLineLarge, styles.frameCornerTopRight]} />
      <View style={[styles.frameCornerLine, large && styles.frameCornerLineLarge, styles.frameCornerBottomLeft]} />
      <View style={[styles.frameCornerLine, large && styles.frameCornerLineLarge, styles.frameCornerBottomRight]} />
    </>
  )
}

function FrameStripRails({ large }: { large: boolean }) {
  return (
    <>
      <View style={[styles.frameStripRail, styles.frameStripRailLeft, large && styles.frameStripRailLarge]}>
        <View style={[styles.frameStripRailDot, large && styles.frameStripRailDotLarge]} />
        <View style={[styles.frameStripRailDot, large && styles.frameStripRailDotLarge]} />
        <View style={[styles.frameStripRailDot, large && styles.frameStripRailDotLarge]} />
      </View>
      <View style={[styles.frameStripRail, styles.frameStripRailRight, large && styles.frameStripRailLarge]}>
        <View style={[styles.frameStripRailDot, large && styles.frameStripRailDotLarge]} />
        <View style={[styles.frameStripRailDot, large && styles.frameStripRailDotLarge]} />
        <View style={[styles.frameStripRailDot, large && styles.frameStripRailDotLarge]} />
      </View>
    </>
  )
}

function FrameMilestoneRulers({ large }: { large: boolean }) {
  return (
    <>
      <View style={[styles.frameMilestoneRuler, styles.frameMilestoneRulerLeft, large && styles.frameMilestoneRulerLarge]} />
      <View style={[styles.frameMilestoneRuler, styles.frameMilestoneRulerRight, large && styles.frameMilestoneRulerLarge]} />
      <Text style={[styles.frameMilestoneDot, styles.frameMilestoneDotLeft, large && styles.frameMilestoneDotLarge]}>•</Text>
      <Text style={[styles.frameMilestoneDot, styles.frameMilestoneDotRight, large && styles.frameMilestoneDotLarge]}>•</Text>
    </>
  )
}

function FrameTwinMarks({ large }: { large: boolean }) {
  return (
    <>
      <View style={[styles.frameTwinMark, styles.frameTwinMarkLeft, large && styles.frameTwinMarkLarge]} />
      <View style={[styles.frameTwinMark, styles.frameTwinMarkRight, large && styles.frameTwinMarkLarge]} />
    </>
  )
}

function FrameRoseCorners({ large, color }: { large: boolean; color: string }) {
  return (
    <>
      <View style={[styles.frameRoseCorner, styles.frameRoseCornerTopLeft, large && styles.frameRoseCornerLarge, { borderColor: color }]} />
      <View style={[styles.frameRoseCorner, styles.frameRoseCornerBottomRight, large && styles.frameRoseCornerLarge, { borderColor: color }]} />
    </>
  )
}

function FrameBowRibbon({ large }: { large: boolean }) {
  return (
    <>
      <View style={[styles.frameBowRibbon, large && styles.frameBowRibbonLarge]} />
      <View style={[styles.frameBowLoop, styles.frameBowLoopLeft, large && styles.frameBowLoopLarge]} />
      <View style={[styles.frameBowLoop, styles.frameBowLoopRight, large && styles.frameBowLoopLarge]} />
      <View style={[styles.frameBowKnot, large && styles.frameBowKnotLarge]} />
    </>
  )
}

function FrameLaceDots({ large }: { large: boolean }) {
  return (
    <>
      {Array.from({ length: 7 }, (_, index) => (
        <View key={`lace-top-${index}`} style={[styles.frameLaceDot, large && styles.frameLaceDotLarge, { left: `${12 + index * 12}%`, top: large ? 25 : 10 }]} />
      ))}
      {Array.from({ length: 7 }, (_, index) => (
        <View key={`lace-bottom-${index}`} style={[styles.frameLaceDot, large && styles.frameLaceDotLarge, { left: `${12 + index * 12}%`, bottom: large ? 25 : 10 }]} />
      ))}
    </>
  )
}

function FrameCurlingLines({ large, color }: { large: boolean; color: string }) {
  return (
    <>
      <Text style={[styles.frameCurlLine, styles.frameCurlLineTop, large && styles.frameCurlLineLarge, { color }]}>⌇⌁⌇⌁⌇</Text>
      <Text style={[styles.frameCurlLine, styles.frameCurlLineBottom, large && styles.frameCurlLineLarge, { color }]}>⌁⌇⌁⌇⌁</Text>
    </>
  )
}

function FrameDaisyChain({ large }: { large: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <Text
          key={`daisy-top-${index}`}
          style={[styles.frameDaisy, large && styles.frameDaisyLarge, { left: `${14 + index * 17}%`, top: large ? 29 : 12 }]}
        >
          ✿
        </Text>
      ))}
      {Array.from({ length: 4 }, (_, index) => (
        <Text
          key={`daisy-bottom-${index}`}
          style={[styles.frameDaisy, large && styles.frameDaisyLarge, { left: `${22 + index * 18}%`, bottom: large ? 29 : 12 }]}
        >
          ✿
        </Text>
      ))}
    </>
  )
}

function FramePearlOval({ large }: { large: boolean }) {
  return (
    <>
      <View style={[styles.framePearlOval, large && styles.framePearlOvalLarge]} />
      <Text style={[styles.framePearl, styles.framePearlTop, large && styles.framePearlLarge]}>• • • • •</Text>
      <Text style={[styles.framePearl, styles.framePearlBottom, large && styles.framePearlLarge]}>• • • • •</Text>
    </>
  )
}

function FramePlaidLines({ large }: { large: boolean }) {
  return (
    <>
      <View style={[styles.framePlaidLine, styles.framePlaidLineTop, large && styles.framePlaidLineLarge]} />
      <View style={[styles.framePlaidLine, styles.framePlaidLineBottom, large && styles.framePlaidLineLarge]} />
      <View style={[styles.framePlaidLineVertical, styles.framePlaidLineLeft, large && styles.framePlaidLineVerticalLarge]} />
      <View style={[styles.framePlaidLineVertical, styles.framePlaidLineRight, large && styles.framePlaidLineVerticalLarge]} />
    </>
  )
}

function FrameScrollCorners({ large }: { large: boolean }) {
  return (
    <>
      <Text style={[styles.frameScrollCorner, styles.frameScrollTopLeft, large && styles.frameScrollCornerLarge]}>⌘</Text>
      <Text style={[styles.frameScrollCorner, styles.frameScrollTopRight, large && styles.frameScrollCornerLarge]}>⌘</Text>
      <Text style={[styles.frameScrollCorner, styles.frameScrollBottomLeft, large && styles.frameScrollCornerLarge]}>⌘</Text>
      <Text style={[styles.frameScrollCorner, styles.frameScrollBottomRight, large && styles.frameScrollCornerLarge]}>⌘</Text>
      <Text style={[styles.frameSmallGarlandTop, large && styles.frameSmallGarlandTopLarge]}>⌁  ♥  ⌁</Text>
    </>
  )
}

function FramePolkaDots({ large }: { large: boolean }) {
  return (
    <>
      {Array.from({ length: 12 }, (_, index) => (
        <View
          key={`polka-${index}`}
          style={[
            styles.framePolkaDot,
            large && styles.framePolkaDotLarge,
            {
              left: `${8 + (index % 6) * 16}%`,
              top: index < 6 ? (large ? 27 : 10) : undefined,
              bottom: index >= 6 ? (large ? 27 : 10) : undefined,
            },
          ]}
        />
      ))}
    </>
  )
}

function getFrameDecorationStyle(frameId: string) {
  if (albumThreeDFrameAssets[frameId]) return 'classic'
  if (frameId === 'classic-cream') return 'classic'
  if (frameId === 'sage-keepsake') return 'sage'
  if (frameId === 'storybook-single') return 'storybook'
  if (frameId === 'minimal-white') return 'blushGallery'
  if (frameId === 'soft-floral') return 'roseFloral'
  if (frameId === 'milestone-card') return 'milestone'
  if (frameId === 'print-shop-border') return 'printShop'
  if (frameId === 'tiny-toes') return 'tinyToes'
  if (frameId === 'welcome-home') return 'welcomeHome'
  if (frameId === 'moonlight-nap') return 'blushMoon'
  if (frameId === 'little-star') return 'littleStar'
  if (frameId === 'heirloom-portrait') return 'heirloom'
  if (frameId === 'rose-garden') return 'roseGarden'
  if (frameId === 'pink-peony') return 'pinkPeony'
  if (frameId === 'blush-bow') return 'blushBow'
  if (frameId === 'red-rose-keepsake') return 'redRose'
  if (frameId === 'butterfly-blush') return 'butterflyBlush'
  if (frameId === 'lace-princess') return 'lacePrincess'
  if (frameId === 'garden-party') return 'gardenParty'
  if (frameId === 'curling-vine') return 'curlingVine'
  if (frameId === 'rose-lace') return 'roseLace'
  if (frameId === 'daisy-chain') return 'daisyChain'
  if (frameId === 'pearl-oval') return 'pearlOval'
  if (frameId === 'three-month-steps') return 'nurseryPlaid'
  if (frameId === 'cloud-dream') return 'cloudDream'
  if (frameId === 'golden-scroll') return 'goldenScroll'
  if (frameId === 'meadow-wreath') return 'meadowWreath'
  if (frameId === 'ribbon-keepsake') return 'ribbonKeepsake'
  if (frameId === 'six-month-steps') return 'blushPolka'
  if (frameId === 'twelve-month-steps') return 'storybookCurl'
  if (frameId === 'little-crown') return 'littleCrown'
  if (frameId === 'garden-arch') return 'gardenArch'
  if (frameId === 'fan-fold-trio') return 'scrapbook'
  if (frameId === 'two-together') return 'twoTogether'
  if (frameId === 'little-moments-strip') return 'strip'
  if (frameId === 'first-smiles-grid') return 'grid'
  if (frameId === 'family-circle') return 'familyCircle'
  if (frameId === 'scrapbook-keepsake') return 'scrapbook'
  if (frameId === 'milestone-collage') return 'milestone'
  if (frameId === 'first-year-grid') return 'firstYear'
  if (frameId === 'grandparent-keepsake') return 'grandparent'
  return 'classic'
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
  if (tone === 'blush') return styles.toneBlush
  if (tone === 'rose') return styles.toneRose
  return styles.toneCream
}

function frameColorOverrideStyle(option: AlbumFrameColorOption) {
  if (option === 'original') return null
  return { backgroundColor: getFrameColorPalette(option).background }
}

function getFrameColorPalette(option: AlbumFrameColorOption) {
  if (option === 'cream') {
    return {
      label: 'Cream color',
      background: colors.cream,
      accent: colors.gold,
      decoration: colors.sageText,
      brand: colors.sageText,
    }
  }

  if (option === 'sage') {
    return {
      label: 'Sage color',
      background: colors.softSage,
      accent: colors.sage,
      decoration: colors.sageText,
      brand: colors.sageText,
    }
  }

  if (option === 'pink') {
    return {
      label: 'Pink color',
      background: '#FFF0F5',
      accent: '#D9879B',
      decoration: '#C85C75',
      brand: '#A85F6F',
    }
  }

  return {
    label: 'Original color',
    background: colors.white,
    accent: colors.gold,
    decoration: colors.sageText,
    brand: colors.sageText,
  }
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

function getMomentImageSource(moment: { localImageAsset?: string; localImageUri?: string }): ImageSourcePropType {
  if (moment.localImageAsset && albumGrowthImages[moment.localImageAsset]) {
    return albumGrowthImages[moment.localImageAsset]
  }

  if (moment.localImageUri) {
    return { uri: moment.localImageUri }
  }

  return fallbackAlbumPhoto
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

function getAlbumFrameLayoutLabel(t: (key: string, options?: Record<string, unknown>) => string, frame: AlbumFrameTemplate) {
  if (getStepMilestoneSlotCount(frame.id) > 0) {
    return safeTranslate(t, 'album.layout.milestone', 'Milestone')
  }

  if (albumThreeDFrameAssets[frame.id]) {
    return safeTranslate(t, 'album.layout.threeD', '3D Frame')
  }

  return safeTranslate(
    t,
    frame.layoutKind === 'collage' ? 'album.layout.collage' : 'album.layout.single',
    frame.layoutKind === 'collage' ? 'Collage' : 'Single'
  )
}

function clampAlbumText(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value
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
  previewButton: {
    position: 'relative',
    borderRadius: radius.lg,
  },
  previewExpandBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
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
  frameDecorationLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  frameCornerLine: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: colors.gold,
  },
  frameCornerLineLarge: {
    width: 34,
    height: 34,
    borderWidth: 0,
  },
  frameCornerTopLeft: {
    top: 7,
    left: 7,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  frameCornerTopRight: {
    top: 7,
    right: 7,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  frameCornerBottomLeft: {
    bottom: 7,
    left: 7,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  frameCornerBottomRight: {
    right: 7,
    bottom: 7,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  frameFloral: {
    position: 'absolute',
    color: colors.sageText,
    fontSize: 10,
    opacity: 0.68,
  },
  frameFloralLarge: {
    fontSize: 19,
    opacity: 0.78,
  },
  frameFloralTopLeft: {
    top: 10,
    left: 11,
  },
  frameFloralTopRight: {
    top: 10,
    right: 12,
  },
  frameFloralBottomLeft: {
    bottom: 10,
    left: 12,
  },
  frameFloralBottomRight: {
    right: 11,
    bottom: 10,
  },
  frameHeart: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    color: colors.gold,
    fontSize: 11,
    opacity: 0.8,
  },
  frameHeartLarge: {
    top: 10,
    fontSize: 17,
  },
  frameTinyHeart: {
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
    color: colors.gold,
    fontSize: 8,
    opacity: 0.78,
  },
  frameTinyHeartLarge: {
    top: 20,
    fontSize: 16,
  },
  frameMinimalDot: {
    position: 'absolute',
    top: 12,
    color: colors.sageText,
    fontSize: 8,
    opacity: 0.44,
  },
  frameMinimalDotLarge: {
    top: 25,
    fontSize: 16,
  },
  frameMinimalDotLeft: {
    left: 23,
  },
  frameMinimalDotRight: {
    right: 23,
  },
  frameBlushMat: {
    position: 'absolute',
    top: 9,
    right: 9,
    bottom: 9,
    left: 9,
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: 'rgba(219, 126, 145, 0.24)',
  },
  frameBlushMatLarge: {
    top: 18,
    right: 18,
    bottom: 18,
    left: 18,
    borderRadius: radius.xl,
  },
  frameBlushPetal: {
    position: 'absolute',
    color: '#D9879B',
    fontSize: 10,
    opacity: 0.7,
  },
  frameBlushPetalLarge: {
    fontSize: 22,
  },
  frameBlushPetalTopLeft: {
    top: 10,
    left: 13,
  },
  frameBlushPetalBottomRight: {
    right: 13,
    bottom: 13,
  },
  frameBlushPetalBottomLeft: {
    left: 13,
    bottom: 13,
  },
  frameBlushStars: {
    position: 'absolute',
    color: '#D9879B',
    fontSize: 8,
    opacity: 0.7,
  },
  frameBlushStarsLarge: {
    fontSize: 17,
  },
  frameBlushStarsTopRight: {
    top: 10,
    right: 12,
  },
  frameTinyHeartBottom: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    color: colors.gold,
    fontSize: 8,
    opacity: 0.78,
  },
  frameTinyHeartBottomLarge: {
    bottom: 17,
    fontSize: 15,
  },
  frameClassicDot: {
    position: 'absolute',
    color: colors.gold,
    fontSize: 7,
    opacity: 0.86,
  },
  frameClassicDotLarge: {
    fontSize: 13,
  },
  frameClassicDotTopLeft: {
    top: 7,
    left: 7,
  },
  frameClassicDotTopRight: {
    top: 7,
    right: 7,
  },
  frameClassicDotBottomLeft: {
    bottom: 7,
    left: 7,
  },
  frameClassicDotBottomRight: {
    bottom: 7,
    right: 7,
  },
  frameInsetBorder: {
    position: 'absolute',
    top: 7,
    right: 7,
    bottom: 7,
    left: 7,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  frameInsetBorderLarge: {
    top: 13,
    right: 13,
    bottom: 13,
    left: 13,
    borderRadius: radius.xl,
  },
  frameInsetBorderSage: {
    borderColor: 'rgba(100, 122, 97, 0.42)',
  },
  frameInsetBorderGold: {
    borderColor: 'rgba(201, 160, 73, 0.48)',
  },
  frameInsetBorderFine: {
    top: 11,
    right: 11,
    bottom: 11,
    left: 11,
    borderColor: 'rgba(201, 160, 73, 0.28)',
  },
  frameInsetBorderFineLarge: {
    top: 21,
    right: 21,
    bottom: 21,
    left: 21,
  },
  frameLeafGarlandTop: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    color: colors.sageText,
    fontSize: 7,
    opacity: 0.72,
  },
  frameLeafGarlandTopLarge: {
    top: 17,
    fontSize: 16,
  },
  frameLeafGarlandBottom: {
    position: 'absolute',
    bottom: 11,
    alignSelf: 'center',
    color: colors.sageText,
    fontSize: 7,
    opacity: 0.72,
  },
  frameLeafGarlandBottomLarge: {
    bottom: 18,
    fontSize: 15,
  },
  frameSmallGarlandTop: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    color: colors.sageText,
    fontSize: 7,
    opacity: 0.76,
  },
  frameSmallGarlandTopLarge: {
    top: 31,
    fontSize: 14,
  },
  frameSmallGarlandBottom: {
    position: 'absolute',
    bottom: 9,
    alignSelf: 'center',
    color: colors.sageText,
    fontSize: 7,
    opacity: 0.74,
  },
  frameSmallGarlandBottomLarge: {
    bottom: 19,
    fontSize: 14,
  },
  frameWhiteSprig: {
    position: 'absolute',
    color: colors.white,
    fontSize: 16,
    opacity: 0.82,
  },
  frameWhiteSprigLarge: {
    fontSize: 34,
  },
  frameWhiteSprigRight: {
    top: 22,
    right: 11,
  },
  frameWhiteSprigBottomLeft: {
    left: 10,
    bottom: 14,
  },
  frameVineCorner: {
    position: 'absolute',
    color: colors.sageText,
    fontSize: 16,
    opacity: 0.7,
  },
  frameVineCornerLarge: {
    fontSize: 31,
  },
  frameVineTopLeft: {
    top: 6,
    left: 8,
  },
  frameVineTopRight: {
    top: 8,
    right: 10,
  },
  frameVineBottomLeft: {
    bottom: 8,
    left: 10,
  },
  frameVineBottomRight: {
    bottom: 6,
    right: 8,
  },
  frameMoon: {
    position: 'absolute',
    top: 8,
    right: 17,
    color: colors.gold,
    fontSize: 12,
    opacity: 0.74,
  },
  frameMoonBlush: {
    color: '#CF6F88',
  },
  frameMoonLarge: {
    top: 21,
    right: 37,
    fontSize: 28,
  },
  frameStars: {
    position: 'absolute',
    color: colors.gold,
    fontSize: 8,
    opacity: 0.74,
  },
  frameStarsLarge: {
    fontSize: 17,
  },
  frameStarsTopRight: {
    top: 9,
    right: 9,
  },
  frameStarsLeft: {
    top: 29,
    left: 10,
  },
  frameLargeBloom: {
    position: 'absolute',
    color: colors.sageText,
    fontSize: 16,
    opacity: 0.68,
  },
  frameLargeBloomLarge: {
    fontSize: 36,
  },
  frameLargeBloomTopLeft: {
    top: 7,
    left: 7,
  },
  frameLargeBloomBottomRight: {
    right: 8,
    bottom: 8,
  },
  frameRoseSpray: {
    position: 'absolute',
    color: '#B94A61',
    fontSize: 15,
    opacity: 0.72,
  },
  frameRoseSprayLarge: {
    fontSize: 34,
  },
  frameRoseSprayTopLeft: {
    top: 8,
    left: 8,
  },
  frameRoseSprayBottomRight: {
    right: 8,
    bottom: 8,
  },
  frameFineSprig: {
    position: 'absolute',
    color: colors.sageText,
    fontSize: 13,
    opacity: 0.64,
  },
  frameFineSprigLarge: {
    fontSize: 29,
  },
  frameFineSprigTop: {
    top: 7,
    right: 23,
  },
  frameFineSprigBottom: {
    bottom: 7,
    left: 22,
  },
  frameFineSprigBottomLeft: {
    bottom: 9,
    left: 11,
  },
  frameWritingLine: {
    position: 'absolute',
    right: 12,
    left: 12,
    height: 1,
    backgroundColor: 'rgba(201, 160, 73, 0.3)',
  },
  frameWritingLineLarge: {
    right: 31,
    left: 31,
  },
  frameWritingLineOne: {
    bottom: 24,
  },
  frameWritingLineTwo: {
    bottom: 36,
  },
  frameMilestoneRuler: {
    position: 'absolute',
    top: 23,
    bottom: 35,
    width: 1,
    backgroundColor: 'rgba(201, 160, 73, 0.25)',
  },
  frameMilestoneRulerLarge: {
    top: 56,
    bottom: 88,
  },
  frameMilestoneRulerLeft: {
    left: 16,
  },
  frameMilestoneRulerRight: {
    right: 16,
  },
  frameMilestoneDot: {
    position: 'absolute',
    top: 17,
    color: colors.gold,
    fontSize: 8,
    opacity: 0.7,
  },
  frameMilestoneDotLarge: {
    top: 40,
    fontSize: 16,
  },
  frameMilestoneDotLeft: {
    left: 14,
  },
  frameMilestoneDotRight: {
    right: 14,
  },
  framePrintCorner: {
    position: 'absolute',
    color: colors.gold,
    fontSize: 12,
    opacity: 0.75,
  },
  framePrintCornerLarge: {
    fontSize: 25,
  },
  framePrintTopLeft: {
    top: 6,
    left: 6,
  },
  framePrintTopRight: {
    top: 6,
    right: 6,
  },
  framePrintBottomLeft: {
    bottom: 6,
    left: 6,
  },
  framePrintBottomRight: {
    bottom: 6,
    right: 6,
  },
  frameScriptTop: {
    position: 'absolute',
    top: 7,
    alignSelf: 'center',
    color: colors.gold,
    fontSize: 7,
    opacity: 0.82,
  },
  frameScriptTopLarge: {
    top: 16,
    fontSize: 16,
  },
  frameStripRail: {
    position: 'absolute',
    top: 32,
    bottom: 32,
    width: 6,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  frameStripRailLarge: {
    top: 65,
    bottom: 70,
    width: 12,
  },
  frameStripRailLeft: {
    left: 10,
  },
  frameStripRailRight: {
    right: 10,
  },
  frameStripRailDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
    opacity: 0.7,
  },
  frameStripRailDotLarge: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  frameTwinMark: {
    position: 'absolute',
    top: 13,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gold,
    opacity: 0.58,
  },
  frameTwinMarkLarge: {
    top: 31,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  frameTwinMarkLeft: {
    left: 30,
  },
  frameTwinMarkRight: {
    right: 30,
  },
  frameRoseCorner: {
    position: 'absolute',
    width: 26,
    height: 26,
  },
  frameRoseCornerLarge: {
    width: 58,
    height: 58,
    borderWidth: 0,
  },
  frameRoseCornerTopLeft: {
    top: 8,
    left: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  frameRoseCornerBottomRight: {
    right: 8,
    bottom: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  frameRoseBud: {
    position: 'absolute',
    color: '#A93A4F',
    fontSize: 9,
    opacity: 0.72,
  },
  frameRoseBudLarge: {
    fontSize: 20,
  },
  frameRoseBudTopRight: {
    top: 11,
    right: 18,
  },
  frameRoseBudBottomLeft: {
    left: 18,
    bottom: 11,
  },
  framePeonyWash: {
    position: 'absolute',
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(252, 224, 232, 0.34)',
  },
  framePeonyWashLarge: {
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
    borderRadius: radius.xxl,
  },
  framePeonyBloom: {
    position: 'absolute',
    color: '#CF6F88',
    fontSize: 18,
    opacity: 0.7,
  },
  framePeonyBloomLarge: {
    fontSize: 40,
  },
  framePeonyBloomTopLeft: {
    top: 9,
    left: 10,
  },
  framePeonyBloomBottomRight: {
    right: 10,
    bottom: 10,
  },
  frameBowRibbon: {
    position: 'absolute',
    top: 15,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(207, 111, 136, 0.6)',
  },
  frameBowRibbonLarge: {
    top: 35,
    left: 58,
    right: 58,
    height: 2,
  },
  frameBowLoop: {
    position: 'absolute',
    top: 10,
    width: 13,
    height: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CF6F88',
    opacity: 0.78,
  },
  frameBowLoopLarge: {
    top: 25,
    width: 28,
    height: 20,
    borderRadius: 14,
  },
  frameBowLoopLeft: {
    left: 48,
  },
  frameBowLoopRight: {
    right: 48,
  },
  frameBowKnot: {
    position: 'absolute',
    top: 13,
    alignSelf: 'center',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CF6F88',
    opacity: 0.78,
  },
  frameBowKnotLarge: {
    top: 31,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  frameRoseBorder: {
    position: 'absolute',
    top: 9,
    right: 9,
    bottom: 9,
    left: 9,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(169, 58, 79, 0.28)',
  },
  frameRoseBorderLarge: {
    top: 19,
    right: 19,
    bottom: 19,
    left: 19,
    borderRadius: radius.xxl,
  },
  frameRedRose: {
    position: 'absolute',
    color: '#A93A4F',
    fontSize: 15,
    opacity: 0.78,
  },
  frameRedRoseLarge: {
    fontSize: 34,
  },
  frameRedRoseTopLeft: {
    top: 8,
    left: 9,
  },
  frameRedRoseBottomRight: {
    right: 9,
    bottom: 9,
  },
  frameButterfly: {
    position: 'absolute',
    color: '#D9879B',
    fontSize: 13,
    opacity: 0.68,
  },
  frameButterflyLarge: {
    fontSize: 30,
  },
  frameButterflyTopLeft: {
    top: 8,
    left: 11,
    transform: [{ rotate: '-18deg' }],
  },
  frameButterflyBottomRight: {
    right: 11,
    bottom: 10,
    transform: [{ rotate: '18deg' }],
  },
  frameLaceDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D9879B',
    opacity: 0.58,
  },
  frameLaceDotLarge: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  frameLaceCrown: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    color: '#CF6F88',
    fontSize: 10,
    opacity: 0.7,
  },
  frameLaceCrownLarge: {
    top: 18,
    fontSize: 22,
  },
  frameGardenBloom: {
    position: 'absolute',
    color: '#C7798E',
    fontSize: 13,
    opacity: 0.7,
  },
  frameGardenBloomLarge: {
    fontSize: 30,
  },
  frameGardenBloomTopLeft: {
    top: 9,
    left: 9,
  },
  frameGardenBloomTopRight: {
    top: 10,
    right: 11,
    color: '#8EA07E',
  },
  frameGardenBloomBottomLeft: {
    bottom: 10,
    left: 12,
    color: '#8EA07E',
  },
  frameGardenBloomBottomRight: {
    right: 10,
    bottom: 10,
  },
  frameCurlLine: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 9,
    opacity: 0.72,
  },
  frameCurlLineLarge: {
    fontSize: 19,
  },
  frameCurlLineTop: {
    top: 8,
  },
  frameCurlLineBottom: {
    bottom: 8,
  },
  frameCurlLeaf: {
    position: 'absolute',
    color: '#82937D',
    fontSize: 15,
    opacity: 0.68,
  },
  frameCurlLeafLarge: {
    fontSize: 32,
  },
  frameCurlLeafTopRight: {
    top: 18,
    right: 10,
  },
  frameCurlLeafBottomLeft: {
    left: 10,
    bottom: 18,
  },
  frameDaisy: {
    position: 'absolute',
    color: '#D6AD55',
    fontSize: 8,
    opacity: 0.72,
  },
  frameDaisyLarge: {
    fontSize: 17,
  },
  framePearlOval: {
    position: 'absolute',
    top: 10,
    right: 13,
    bottom: 10,
    left: 13,
    borderWidth: 1,
    borderColor: 'rgba(201, 160, 73, 0.3)',
    borderRadius: radius.full,
  },
  framePearlOvalLarge: {
    top: 23,
    right: 34,
    bottom: 23,
    left: 34,
  },
  framePearl: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(201, 160, 73, 0.55)',
    fontSize: 8,
  },
  framePearlLarge: {
    fontSize: 17,
  },
  framePearlTop: {
    top: 8,
  },
  framePearlBottom: {
    bottom: 8,
  },
  framePlaidLine: {
    position: 'absolute',
    right: 8,
    left: 8,
    height: 7,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(201, 160, 73, 0.18)',
    backgroundColor: 'rgba(130, 147, 125, 0.08)',
  },
  framePlaidLineLarge: {
    right: 19,
    left: 19,
    height: 16,
  },
  framePlaidLineTop: {
    top: 11,
  },
  framePlaidLineBottom: {
    bottom: 11,
  },
  framePlaidLineVertical: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: 7,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(201, 160, 73, 0.18)',
    backgroundColor: 'rgba(207, 111, 136, 0.08)',
  },
  framePlaidLineVerticalLarge: {
    top: 19,
    bottom: 19,
    width: 16,
  },
  framePlaidLineLeft: {
    left: 11,
  },
  framePlaidLineRight: {
    right: 11,
  },
  frameCloud: {
    position: 'absolute',
    color: 'rgba(130, 147, 125, 0.58)',
    fontSize: 15,
  },
  frameCloudLarge: {
    fontSize: 34,
  },
  frameCloudTopLeft: {
    top: 8,
    left: 10,
  },
  frameCloudBottomRight: {
    right: 10,
    bottom: 9,
  },
  frameCloudStar: {
    position: 'absolute',
    color: colors.gold,
    fontSize: 8,
    opacity: 0.72,
  },
  frameCloudStarLarge: {
    fontSize: 18,
  },
  frameCloudStarTopRight: {
    top: 12,
    right: 14,
  },
  frameScrollCorner: {
    position: 'absolute',
    color: colors.gold,
    fontSize: 11,
    opacity: 0.72,
  },
  frameScrollCornerLarge: {
    fontSize: 25,
  },
  frameScrollTopLeft: {
    top: 7,
    left: 7,
  },
  frameScrollTopRight: {
    top: 7,
    right: 7,
  },
  frameScrollBottomLeft: {
    bottom: 7,
    left: 7,
  },
  frameScrollBottomRight: {
    right: 7,
    bottom: 7,
  },
  frameMeadowStem: {
    position: 'absolute',
    color: '#82937D',
    fontSize: 19,
    opacity: 0.66,
  },
  frameMeadowStemLarge: {
    fontSize: 42,
  },
  frameMeadowStemLeft: {
    top: 20,
    left: 8,
  },
  frameMeadowStemRight: {
    right: 8,
    bottom: 20,
    transform: [{ rotate: '180deg' }],
  },
  frameMeadowBloom: {
    position: 'absolute',
    color: '#D6AD55',
    fontSize: 12,
    opacity: 0.74,
  },
  frameMeadowBloomLarge: {
    fontSize: 26,
  },
  frameMeadowBloomBottomLeft: {
    left: 17,
    bottom: 12,
  },
  frameRibbonTail: {
    position: 'absolute',
    top: 16,
    width: 16,
    height: 9,
    borderBottomWidth: 1,
    borderColor: '#CF6F88',
    opacity: 0.5,
  },
  frameRibbonTailLarge: {
    top: 37,
    width: 35,
    height: 20,
  },
  frameRibbonTailLeft: {
    left: 19,
    transform: [{ rotate: '-12deg' }],
  },
  frameRibbonTailRight: {
    right: 19,
    transform: [{ rotate: '12deg' }],
  },
  framePolkaDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2A6B4',
    opacity: 0.45,
  },
  framePolkaDotLarge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  frameOpenBook: {
    position: 'absolute',
    bottom: 11,
    alignSelf: 'center',
    color: colors.gold,
    fontSize: 11,
    opacity: 0.72,
  },
  frameOpenBookLarge: {
    bottom: 25,
    fontSize: 26,
  },
  frameCrownRule: {
    position: 'absolute',
    top: 14,
    left: 34,
    right: 34,
    height: 1,
    backgroundColor: 'rgba(201, 160, 73, 0.42)',
  },
  frameCrownRuleLarge: {
    top: 33,
    left: 80,
    right: 80,
    height: 2,
  },
  frameGardenArch: {
    position: 'absolute',
    top: 12,
    right: 22,
    bottom: 12,
    left: 22,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(130, 147, 125, 0.34)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  frameGardenArchLarge: {
    top: 29,
    right: 55,
    bottom: 29,
    left: 55,
  },
  frameFirstYearTop: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    color: colors.gold,
    fontSize: 7,
    opacity: 0.82,
  },
  frameFirstYearTopLarge: {
    top: 24,
    fontSize: 16,
  },
  frameArchSprig: {
    position: 'absolute',
    bottom: 18,
    color: colors.sageText,
    fontSize: 16,
    opacity: 0.65,
  },
  frameArchSprigLarge: {
    bottom: 36,
    fontSize: 34,
  },
  frameArchSprigLeft: {
    left: 13,
  },
  frameArchSprigRight: {
    right: 13,
  },
  frameTape: {
    position: 'absolute',
    top: 10,
    width: 28,
    height: 9,
    borderRadius: 2,
    backgroundColor: 'rgba(214, 178, 115, 0.34)',
  },
  frameTapeLarge: {
    top: 22,
    width: 64,
    height: 19,
  },
  frameTapeLeft: {
    left: 16,
    transform: [{ rotate: '-8deg' }],
  },
  frameTapeRight: {
    right: 15,
    transform: [{ rotate: '8deg' }],
  },
  frameScriptBottomRight: {
    position: 'absolute',
    right: 10,
    bottom: 13,
    color: colors.gold,
    fontSize: 7,
    opacity: 0.75,
  },
  frameScriptBottomRightLarge: {
    right: 26,
    bottom: 30,
    fontSize: 14,
  },
  frameTinyFootprints: {
    position: 'absolute',
    color: colors.gold,
    fontSize: 9,
    opacity: 0.76,
  },
  frameTinyFootprintsLarge: {
    fontSize: 20,
  },
  frameTinyFootprintsTop: {
    top: 8,
    right: 12,
    transform: [{ rotate: '-18deg' }],
  },
  frameTinyFootprintsBottom: {
    bottom: 8,
    left: 12,
    transform: [{ rotate: '18deg' }],
  },
  frameHouseMark: {
    position: 'absolute',
    top: 9,
    alignSelf: 'center',
    color: colors.sageText,
    fontSize: 10,
    opacity: 0.76,
  },
  frameHouseMarkLarge: {
    top: 18,
    fontSize: 23,
  },
  previewLarge: {
    width: '100%',
    minHeight: 390,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    alignSelf: 'center',
  },
  previewLargeSingle: {
    minHeight: 330,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  previewLargeThreeD: {
    minHeight: 430,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  previewLargeTwoPhoto: {
    minHeight: 340,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  previewDecorTop: {
    width: 46,
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    marginBottom: spacing.sm,
  },
  previewDecorTopLarge: {
    width: 86,
    height: 3,
    marginBottom: spacing.lg,
  },
  previewDecorTopLargeTwoPhoto: {
    marginBottom: spacing.lg,
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
  previewPhotoGridLarge: {
    width: '100%',
    height: 210,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.base,
  },
  previewPhotoGridSingle: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  previewPhotoGridLargeSingle: {
    height: 176,
    marginBottom: spacing.sm,
  },
  previewPhotoGridSteps: {
    position: 'relative',
    overflow: 'hidden',
    padding: 0,
    gap: 0,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  previewPhotoGridStepsLarge: {
    height: 226,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  previewPhotoGridFanFold: {
    position: 'relative',
    overflow: 'visible',
    padding: 0,
    gap: 0,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  previewPhotoGridFanFoldLarge: {
    height: 226,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  previewPhotoGridThreeD: {
    position: 'relative',
    overflow: 'visible',
    padding: 0,
    gap: 0,
    backgroundColor: 'transparent',
  },
  previewPhotoGridThreeDLarge: {
    height: 300,
    marginTop: -spacing.sm,
    marginBottom: -spacing.xs,
    transform: [{ scale: 1.22 }],
  },
  previewThreeDFrameAsset: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
  previewPhotoGridCompactCollage: {
    overflow: 'hidden',
  },
  previewPhotoGridLargeCollage: {
    height: 216,
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  previewPhotoGridLargeTwoPhoto: {
    height: 176,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  previewPhotoGridLargeThreePhoto: {
    height: 226,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  previewPhotoGridMonthly: {
    gap: 2,
    alignContent: 'center',
    justifyContent: 'center',
  },
  previewPhotoGridMonthlyLarge: {
    height: 216,
    paddingHorizontal: spacing.base,
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
  previewPhotoSlotStep: {
    position: 'absolute',
    flexBasis: 0,
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(231, 218, 200, 0.72)',
    shadowColor: 'rgba(54, 48, 42, 0.22)',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  previewPhotoSlotFanFold: {
    position: 'absolute',
    flexBasis: 0,
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.creamAlt,
  },
  previewPhotoSlotThreeD: {
    position: 'absolute',
    zIndex: 2,
    flexBasis: 0,
    flexGrow: 0,
    flexShrink: 0,
    borderWidth: 0,
    backgroundColor: colors.creamAlt,
    shadowColor: 'rgba(46, 35, 27, 0.18)',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  previewPhotoSlotCompactCollage: {
    flexGrow: 0,
    height: 30,
  },
  previewPhotoSlotCompactTwo: {
    height: 66,
  },
  previewPhotoSlotLargeCollage: {
    flexGrow: 0,
    height: 74,
  },
  previewPhotoSlotLargeTwoPhoto: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    height: 156,
    borderRadius: radius.md,
  },
  previewPhotoSlotLargeThreePhoto: {
    position: 'absolute',
    flexGrow: 0,
    flexShrink: 0,
    width: '31%',
    height: 86,
    borderRadius: radius.md,
  },
  previewPhotoSlotLargeThreePhotoFirst: {
    top: spacing.sm,
    left: '16%',
  },
  previewPhotoSlotLargeThreePhotoSecond: {
    top: spacing.sm,
    right: '16%',
  },
  previewPhotoSlotLargeThreePhotoThird: {
    bottom: spacing.sm,
    alignSelf: 'center',
    width: '38%',
    height: 92,
  },
  previewPhotoSlotMonthly: {
    flexBasis: '22%',
    flexGrow: 0,
    height: 20,
    borderRadius: 6,
  },
  previewPhotoSlotMonthlyLarge: {
    height: 36,
    borderRadius: radius.md,
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
  previewPlaceholderTextLarge: {
    fontSize: 14,
  },
  previewCaption: {
    ...typography.label,
    color: colors.ink,
    textAlign: 'center',
  },
  previewCaptionLarge: {
    ...typography.h3,
    marginTop: spacing.xs,
  },
  previewBrand: {
    ...typography.label,
    color: colors.sageText,
    fontSize: 9,
    marginTop: spacing.xs,
  },
  previewBrandLarge: {
    ...typography.action,
    color: colors.sageText,
    marginTop: spacing.sm,
  },
  previewCount: {
    ...typography.label,
    color: colors.muted,
    fontSize: 9,
    marginTop: spacing.xs,
  },
  previewCountLarge: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  previewModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 30, 28, 0.68)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  previewModalCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    padding: spacing.base,
    ...shadows.lg,
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  previewModalEyebrow: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
  },
  previewModalTitle: {
    ...typography.h3,
    color: colors.ink,
    marginTop: 2,
  },
  previewModalClose: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewModalPreviewShell: {
    position: 'relative',
    alignItems: 'center',
  },
  previewModalNavButton: {
    position: 'absolute',
    top: '45%',
    zIndex: 4,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: 'rgba(107, 128, 108, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.md,
  },
  previewModalNavLeft: {
    left: -8,
  },
  previewModalNavRight: {
    right: -8,
  },
  previewModalControlRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  previewModalSwatches: {
    minHeight: 30,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    ...shadows.sm,
  },
  previewModalColorSwatch: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewModalColorSwatchSelected: {
    borderColor: colors.sage,
    borderWidth: 2,
  },
  previewModalColorSwatchDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  previewModalDecorationToggle: {
    minHeight: 30,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    ...shadows.sm,
  },
  previewModalDecorationToggleActive: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  previewModalDecorationKnob: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewModalDecorationKnobActive: {
    borderColor: colors.sage,
    backgroundColor: colors.sage,
  },
  previewModalDecorationText: {
    ...typography.label,
    color: colors.muted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  previewModalDecorationTextActive: {
    color: colors.sageText,
  },
  previewModalMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.base,
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
  framePickerToggle: {
    minHeight: 30,
    minWidth: 52,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  framePickerToggleActive: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  framePickerToggleText: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  framePickerToggleTextActive: {
    color: colors.sageText,
  },
  framePickerPageMeta: {
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  framePickerOffText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: -spacing.xs,
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
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  characterCount: {
    ...typography.label,
    color: colors.muted,
    fontSize: 10,
    textAlign: 'right',
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  inputLabelRowCharacterCount: {
    marginTop: 0,
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
  miniThreeDFrameAsset: {
    position: 'absolute',
    top: -6,
    right: -6,
    bottom: -6,
    left: -6,
    width: undefined,
    height: undefined,
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
  toneBlush: {
    backgroundColor: '#FFF3F6',
  },
  toneRose: {
    backgroundColor: '#FFF0F2',
  },
})
