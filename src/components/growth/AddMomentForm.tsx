import React, { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/src/components/ui'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const momentTypes = [
  { key: 'milestone', labelKey: 'growth.add.type.milestone' },
  { key: 'photo', labelKey: 'growth.add.type.photo' },
  { key: 'memory', labelKey: 'growth.add.type.memory' },
]

interface AddMomentFormProps {
  onSave: (data: {
    caption: string
    momentType: string
    localImageUri: string
    localImageAsset?: string
  }) => void
  onCancel: () => void
}

export function AddMomentForm({ onSave, onCancel }: AddMomentFormProps) {
  const { t } = useTranslation()
  const [caption, setCaption] = useState('First smile!')
  const [momentType, setMomentType] = useState('milestone')
  const [photoChosen, setPhotoChosen] = useState(false)
  const [notes, setNotes] = useState('She smiled at Dad today.')

  const handleSave = () => {
    onSave({
      caption,
      momentType,
      localImageUri: '',
      localImageAsset: photoChosen ? 'growth-feet-reference' : undefined,
    })
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable onPress={onCancel} style={styles.backButton} hitSlop={14}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{t('growth.add.title')}</Text>
      </View>

      <Text style={styles.dateText}>{t('growth.add.date')}</Text>

      <Pressable
        style={[styles.photoCard, photoChosen && styles.photoCardChosen]}
        onPress={() => setPhotoChosen(true)}
      >
        {photoChosen ? (
          <Image
            source={require('../../../app/growth-feet-reference.png')}
            style={styles.photoPreview}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoEmpty}>
            <Text style={styles.photoIcon}>⌁</Text>
            <Text style={styles.photoText}>{t('growth.add.choosePhoto')}</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('growth.add.typeLabel')}</Text>
        <View style={styles.typeRow}>
          {momentTypes.map((type) => {
            const selected = momentType === type.key
            return (
              <Pressable
                key={type.key}
                style={[styles.typeChip, selected && styles.typeChipSelected]}
                onPress={() => setMomentType(type.key)}
              >
                <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
                  {t(type.labelKey)}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Input
          label={t('growth.add.titleLabel')}
          placeholder={t('growth.add.titlePlaceholder')}
          value={caption}
          onChangeText={setCaption}
        />
        <View style={styles.fieldSpacer} />
        <Input
          label={t('growth.add.notesLabel')}
          placeholder={t('growth.add.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <Text style={styles.localNote}>
        {t('growth.add.localNote')}
      </Text>

      <View style={styles.actions}>
        <Button variant="ghost" onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>{t('common.cancel')}</Text>
        </Button>
        <Button variant="primary" onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>{t('common.save')}</Text>
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: 112,
  },
  topBar: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  backText: {
    color: colors.stoneText,
    fontSize: 30,
    lineHeight: 32,
  },
  title: {
    ...typography.h2,
    color: colors.ink,
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  photoCard: {
    height: 238,
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  photoCardChosen: {
    borderColor: colors.sage,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.creamAlt,
  },
  photoIcon: {
    fontSize: 34,
    color: colors.sageText,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  photoText: {
    ...typography.action,
    color: colors.sageText,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  typeChipText: {
    ...typography.label,
    color: colors.stoneText,
  },
  typeChipTextSelected: {
    color: colors.sageText,
  },
  fieldSpacer: {
    height: spacing.base,
  },
  localNote: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    ...typography.bodySmall,
    color: colors.muted,
    fontWeight: '700',
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.clay,
  },
  saveText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '700',
  },
})
