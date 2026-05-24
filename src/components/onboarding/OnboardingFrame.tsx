import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

interface OnboardingFrameProps {
  children: React.ReactNode
  eyebrow?: string
  title: string
  subtitle?: string
  step?: string
  progress?: number
  onBack?: () => void
  rightAction?: React.ReactNode
  center?: boolean
}

export function OnboardingFrame({
  children,
  eyebrow,
  title,
  subtitle,
  step,
  progress,
  onBack,
  rightAction,
  center = false,
}: OnboardingFrameProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, center && styles.centerContent]}
    >
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.circleButton} accessibilityLabel="Go back">
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.circleButton}>
            <Image source={require('../../../app/logo.png')} style={styles.logoImage} />
          </View>
        )}
        <View style={styles.stepArea}>
          {step && <Text style={styles.stepText}>{step}</Text>}
          {typeof progress === 'number' && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(8, progress * 100)}%` }]} />
            </View>
          )}
        </View>
        {rightAction ?? <View style={styles.rightSpacer} />}
      </View>

      <View style={[styles.header, center && styles.headerCenter]}>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={[styles.title, center && styles.titleCenter]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, center && styles.subtitleCenter]}>{subtitle}</Text>}
      </View>

      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 18,
    paddingBottom: 44,
  },
  centerContent: {
    paddingTop: 36,
  },
  topRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  backGlyph: {
    color: colors.inkLight,
    fontSize: 31,
    lineHeight: 31,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  stepArea: {
    alignItems: 'center',
    gap: 7,
  },
  stepText: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: 92,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.creamAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.sage,
  },
  rightSpacer: {
    width: 44,
    height: 44,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerCenter: {
    alignItems: 'center',
  },
  eyebrow: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
  },
  titleCenter: {
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.inkLight,
    marginTop: spacing.sm,
  },
  subtitleCenter: {
    textAlign: 'center',
    maxWidth: 292,
  },
})
