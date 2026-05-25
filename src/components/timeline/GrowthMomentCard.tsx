import React from 'react'
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
        <Text style={styles.title}>{moment.caption || t('timeline.growth.defaultTitle')}</Text>
        <Text style={styles.copy}>{getMomentCopy(moment, t)}</Text>
      </View>
    </View>
  )
}

function getMomentCopy(
  moment: DemoGrowthMoment,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (moment.momentType === 'milestone') {
    return t('timeline.growth.milestoneCopy')
  }
  if (moment.momentType === 'photo') {
    return t('timeline.growth.photoCopy', { time: relativeTime(moment.occurredAt) })
  }
  return t('timeline.growth.memoryCopy')
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
