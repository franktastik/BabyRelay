import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@/src/theme'

interface LogChoiceOption<T extends string> {
  key: T
  label: string
  helper?: string
}

interface LogChoiceGroupProps<T extends string> {
  label: string
  value: T
  options: LogChoiceOption<T>[]
  onChange: (value: T) => void
}

export function LogChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: LogChoiceGroupProps<T>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.key === value
          return (
            <Pressable
              key={option.key}
              onPress={() => onChange(option.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              testID={`log-choice-${option.key}`}
              style={[styles.choice, selected && styles.choiceSelected]}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                {option.label}
              </Text>
              {option.helper && (
                <Text style={[styles.helper, selected && styles.helperSelected]}>
                  {option.helper}
                </Text>
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  choice: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  choiceSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  choiceText: {
    ...typography.action,
    color: colors.stoneText,
    textAlign: 'center',
  },
  choiceTextSelected: {
    color: colors.sageText,
  },
  helper: {
    ...typography.label,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  helperSelected: {
    color: colors.sageText,
  },
})
