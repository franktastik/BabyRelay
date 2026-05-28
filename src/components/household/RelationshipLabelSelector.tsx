import React from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  getRelationshipLabelKey,
  normalizeCustomRelationshipLabel,
  relationshipLabelIds,
  type RelationshipLabelId,
} from '@/src/features/household/relationshipLabels'
import { colors, radius, spacing, typography } from '@/src/theme'

interface RelationshipLabelSelectorProps {
  selectedLabelId: RelationshipLabelId
  customLabel: string
  onSelectLabel: (labelId: RelationshipLabelId) => void
  onChangeCustomLabel: (label: string) => void
  testIDPrefix?: string
}

export function RelationshipLabelSelector({
  selectedLabelId,
  customLabel,
  onSelectLabel,
  onChangeCustomLabel,
  testIDPrefix = 'relationship-label',
}: RelationshipLabelSelectorProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('household.relationship.selectorLabel')}</Text>
      <View style={styles.options}>
        {relationshipLabelIds.map((labelId) => {
          const selected = selectedLabelId === labelId
          return (
            <Pressable
              key={labelId}
              onPress={() => onSelectLabel(labelId)}
              style={[styles.option, selected && styles.optionSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(getRelationshipLabelKey(labelId))}
              testID={`${testIDPrefix}-${labelId}`}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {t(getRelationshipLabelKey(labelId))}
              </Text>
            </Pressable>
          )
        })}
      </View>
      {selectedLabelId === 'other' ? (
        <TextInput
          value={customLabel}
          onChangeText={(value) => onChangeCustomLabel(normalizeCustomRelationshipLabel(value))}
          placeholder={t('household.relationship.customPlaceholder')}
          placeholderTextColor={colors.mutedLight}
          style={styles.customInput}
          accessibilityLabel={t('household.relationship.customLabel')}
          testID={`${testIDPrefix}-custom-input`}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  option: {
    minHeight: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  optionText: {
    ...typography.bodySmall,
    color: colors.muted,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: colors.white,
  },
  customInput: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.stone,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
  },
})
