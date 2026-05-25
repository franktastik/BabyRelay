import { describe, expect, test } from 'bun:test'
import {
  getOnboardingGoalLabel,
  getOnboardingPreviewMode,
  useOnboardingQuestionnaireStore,
} from './onboardingQuestionnaireStore'

describe('onboarding questionnaire store', () => {
  test('recommends priorities from the selected goal', () => {
    useOnboardingQuestionnaireStore.getState().resetQuestionnaire()

    useOnboardingQuestionnaireStore.getState().setPrimaryGoal('reminders')

    expect(useOnboardingQuestionnaireStore.getState().primaryGoal).toBe('reminders')
    expect(useOnboardingQuestionnaireStore.getState().priorities).toEqual([
      'feeding',
      'diapers',
      'reminders',
      'due-soon',
    ])
  })

  test('personalizes preview mode from goal and pain points', () => {
    expect(getOnboardingPreviewMode('moments', [])).toBe('growth')
    expect(getOnboardingPreviewMode('sync', ['overnight-confusion'])).toBe('overnight')
    expect(getOnboardingPreviewMode('sync', ['forgot-reminders'])).toBe('reminder')
    expect(getOnboardingPreviewMode('logging', [])).toBe('logging')
    expect(getOnboardingGoalLabel('household')).toBe('care circle coordination')
  })
})
