import { create } from 'zustand'

export type OnboardingGoal =
  | 'sync'
  | 'logging'
  | 'reminders'
  | 'moments'
  | 'household'
  | 'overnight'

export type OnboardingPainPoint =
  | 'missed-handoffs'
  | 'partner-updates'
  | 'overnight-confusion'
  | 'forgot-reminders'
  | 'scattered-notes'
  | 'photo-moments-buried'

export type OnboardingPriority =
  | 'feeding'
  | 'diapers'
  | 'sleep'
  | 'medication'
  | 'reminders'
  | 'due-soon'
  | 'photo-moments'
  | 'caregiver-notes'

export type NotificationPrimingChoice = 'enabled' | 'skipped' | 'blocked' | null

interface OnboardingQuestionnaireState {
  primaryGoal: OnboardingGoal | null
  painPoints: OnboardingPainPoint[]
  priorities: OnboardingPriority[]
  notificationPrimingChoice: NotificationPrimingChoice
  setPrimaryGoal: (goal: OnboardingGoal) => void
  togglePainPoint: (painPoint: OnboardingPainPoint) => void
  togglePriority: (priority: OnboardingPriority) => void
  setPriorities: (priorities: OnboardingPriority[]) => void
  setNotificationPrimingChoice: (choice: NotificationPrimingChoice) => void
  resetQuestionnaire: () => void
}

const defaultPriorities: OnboardingPriority[] = ['feeding', 'diapers', 'sleep']

function withToggledValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

function getRecommendedPriorities(goal: OnboardingGoal): OnboardingPriority[] {
  switch (goal) {
    case 'sync':
      return ['feeding', 'diapers', 'caregiver-notes', 'due-soon']
    case 'logging':
      return ['feeding', 'diapers', 'sleep', 'medication']
    case 'reminders':
      return ['feeding', 'diapers', 'reminders', 'due-soon']
    case 'moments':
      return ['feeding', 'sleep', 'photo-moments', 'caregiver-notes']
    case 'household':
      return ['feeding', 'diapers', 'caregiver-notes', 'reminders']
    case 'overnight':
      return ['feeding', 'sleep', 'due-soon', 'caregiver-notes']
    default:
      return defaultPriorities
  }
}

export const useOnboardingQuestionnaireStore = create<OnboardingQuestionnaireState>((set) => ({
  primaryGoal: null,
  painPoints: [],
  priorities: defaultPriorities,
  notificationPrimingChoice: null,
  setPrimaryGoal: (goal) =>
    set({
      primaryGoal: goal,
      priorities: getRecommendedPriorities(goal),
    }),
  togglePainPoint: (painPoint) =>
    set((state) => ({
      painPoints: withToggledValue(state.painPoints, painPoint),
    })),
  togglePriority: (priority) =>
    set((state) => ({
      priorities: withToggledValue(state.priorities, priority),
    })),
  setPriorities: (priorities) => set({ priorities }),
  setNotificationPrimingChoice: (choice) => set({ notificationPrimingChoice: choice }),
  resetQuestionnaire: () =>
    set({
      primaryGoal: null,
      painPoints: [],
      priorities: defaultPriorities,
      notificationPrimingChoice: null,
    }),
}))

export function getOnboardingPreviewMode(goal: OnboardingGoal | null, painPoints: OnboardingPainPoint[]) {
  if (goal === 'moments' || painPoints.includes('photo-moments-buried')) {
    return 'growth'
  }

  if (goal === 'reminders' || painPoints.includes('forgot-reminders')) {
    return 'reminder'
  }

  if (goal === 'overnight' || painPoints.includes('overnight-confusion')) {
    return 'overnight'
  }

  if (goal === 'logging') {
    return 'logging'
  }

  return 'handoff'
}

export function getOnboardingGoalLabel(goal: OnboardingGoal | null) {
  switch (goal) {
    case 'sync':
      return 'shared handoffs'
    case 'logging':
      return 'feeding, diaper, and sleep logs'
    case 'reminders':
      return 'gentle reminders'
    case 'moments':
      return 'local photo moments'
    case 'household':
      return 'care circle coordination'
    case 'overnight':
      return 'overnight handoffs'
    default:
      return 'calm baby care'
  }
}
