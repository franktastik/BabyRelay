import React from 'react'
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'
import { relativeTime } from '@/src/relative-time'

const fallbackGrowthImage = require('../../../app/growth-feet-reference.png')
const growthImages: Record<string, ImageSourcePropType> = {
  'growth-feet-reference': require('../../../app/growth-feet-reference.png'),
}

interface GrowthMomentCardProps {
  moment: DemoGrowthMoment
}

export function GrowthMomentCard({ moment }: GrowthMomentCardProps) {
  const imageSource: ImageSourcePropType = moment.localImageAsset
    ? growthImages[moment.localImageAsset] || fallbackGrowthImage
    : moment.localImageUri
    ? { uri: moment.localImageUri }
    : fallbackGrowthImage

  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{moment.caption || 'The first big smile!'}</Text>
        <Text style={styles.copy}>{getMomentCopy(moment)}</Text>
      </View>
    </View>
  )
}

function getMomentCopy(moment: DemoGrowthMoment) {
  if (moment.momentType === 'milestone') {
    return 'Leo is exactly 6 weeks old today. Captured this while he was playing with Dad.'
  }
  if (moment.momentType === 'photo') {
    return `A local photo moment saved ${relativeTime(moment.occurredAt)}.`
  }
  return 'A small memory saved locally for your household.'
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  imageFrame: {
    width: '100%',
    height: 158,
    backgroundColor: colors.creamAlt,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  copy: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
})
