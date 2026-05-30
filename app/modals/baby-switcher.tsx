import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Baby, Check, Plus } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { createDemoHouseholdAdapter } from '@/src/features/demo/household'
import { trackEvent } from '@/src/features/analytics'
import { useAuthStore } from '@/src/stores/authStore'
import { useBabyMinimoActivityStore } from '@/src/stores/activityStore'
import { colors, radius, shadows, spacing, typography } from '@/src/theme'

const householdAdapter = createDemoHouseholdAdapter()

export default function BabySwitcherModal() {
  const router = useRouter()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const householdId = useAuthStore((state) => state.currentHouseholdId)
  const selectedBabyId = useAuthStore((state) => state.selectedBabyId)
  const babies = useAuthStore((state) => state.babies)
  const setSelectedBabyId = useAuthStore((state) => state.setSelectedBabyId)
  const addBaby = useAuthStore((state) => state.addBaby)
  const addActivity = useBabyMinimoActivityStore((state) => state.addActivity)
  const [babyName, setBabyName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const closeModal = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(tabs)/home')
  }

  const selectBaby = async (babyId: string) => {
    setSelectedBabyId(babyId)
    const baby = babies.find((item) => item.id === babyId)
    addActivity({
      babyId,
      type: 'baby_selected',
      label: 'Baby selected',
      detail: baby?.name,
    })
    if (user?.id && householdId) {
      await householdAdapter.selectBaby(user.id, householdId, babyId).catch(() => null)
    }
    closeModal()
  }

  const createBaby = async () => {
    if (!householdId || !babyName.trim()) {
      setError(t('babySwitcher.error'))
      return
    }

    setLoading(true)
    setError(null)
    try {
      const baby = await householdAdapter.createBaby(householdId, babyName.trim(), birthDate || null)
      addBaby(baby)
      if (user?.id) {
        await householdAdapter.selectBaby(user.id, householdId, baby.id)
      }
      trackEvent('baby_created', {
        householdId,
        babyId: baby.id,
        source: 'baby_switcher',
      })
      addActivity({
        babyId: baby.id,
        type: 'baby_created',
        label: 'Baby profile added',
        detail: baby.name,
      })
      closeModal()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t('babySwitcher.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t('babySwitcher.eyebrow')}</Text>
          <Text style={styles.title}>{t('babySwitcher.title')}</Text>
          <Text style={styles.copy}>{t('babySwitcher.copy')}</Text>
        </View>

        <View style={styles.list}>
          {babies.length ? (
            babies.map((baby) => {
              const selected = baby.id === selectedBabyId
              return (
                <Pressable
                  key={baby.id}
                  onPress={() => selectBaby(baby.id)}
                  style={[styles.babyRow, selected && styles.babyRowSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={t('babySwitcher.select', { babyName: baby.name })}
                >
                  <View style={[styles.iconShell, selected && styles.iconShellSelected]}>
                    <Baby color={selected ? colors.white : colors.sageText} size={18} strokeWidth={2.2} />
                  </View>
                  <View style={styles.babyCopy}>
                    <Text style={styles.babyName}>{baby.name}</Text>
                    <Text style={styles.babyMeta}>
                      {baby.birthDate || t('babySwitcher.birthDateMissing')}
                    </Text>
                  </View>
                  {selected ? <Check color={colors.sageText} size={20} strokeWidth={2.4} /> : null}
                </Pressable>
              )
            })
          ) : (
            <Text style={styles.empty}>{t('babySwitcher.empty')}</Text>
          )}
        </View>

        <View style={styles.addCard}>
          <View style={styles.addHeader}>
            <View style={styles.addIcon}>
              <Plus color={colors.white} size={18} strokeWidth={2.6} />
            </View>
            <View style={styles.addCopy}>
              <Text style={styles.addTitle}>{t('babySwitcher.addTitle')}</Text>
              <Text style={styles.addSubtitle}>{t('babySwitcher.addSubtitle')}</Text>
            </View>
          </View>
          <TextInput
            value={babyName}
            onChangeText={setBabyName}
            placeholder={t('babySwitcher.namePlaceholder')}
            placeholderTextColor={colors.mutedLight}
            style={styles.input}
          />
          <TextInput
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder={t('babySwitcher.birthDatePlaceholder')}
            placeholderTextColor={colors.mutedLight}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            onPress={createBaby}
            disabled={loading}
            style={[styles.primaryButton, loading && styles.disabledButton]}
          >
            <Text style={styles.primaryText}>
              {loading ? t('babySwitcher.adding') : t('babySwitcher.addButton')}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={closeModal} style={styles.cancelButton}>
          <Text style={styles.cancelText}>{t('common.cancel')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 96,
    paddingBottom: 88,
  },
  header: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.label,
    color: colors.sageText,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
  },
  copy: {
    ...typography.body,
    color: colors.inkLight,
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  list: {
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  babyRow: {
    minHeight: 72,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    ...shadows.sm,
  },
  babyRowSelected: {
    borderColor: colors.sage,
    backgroundColor: colors.softSage,
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellSelected: {
    backgroundColor: colors.sage,
  },
  babyCopy: {
    flex: 1,
  },
  babyName: {
    ...typography.action,
    color: colors.ink,
  },
  babyMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  addCard: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.base,
    ...shadows.sm,
  },
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  addCopy: {
    flex: 1,
  },
  addIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTitle: {
    ...typography.action,
    color: colors.ink,
  },
  addSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    color: colors.ink,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryText: {
    ...typography.action,
    color: colors.white,
  },
  cancelButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.base,
  },
  cancelText: {
    ...typography.action,
    color: colors.sageText,
  },
})
