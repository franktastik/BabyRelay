export interface DemoPlan {
  id: 'free' | 'premium' | 'family'
  name: string
  price: string
  cadence: string
  recommended?: string
  features: string[]
}

export const demoPlans: DemoPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    features: ['Standard care logging', '7-day timeline history', 'Up to 1 caregiver'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$4.99',
    cadence: 'per month',
    recommended: 'Recommended for partners',
    features: [
      'Everything in Free',
      'Unlimited timeline history',
      'Smart handoff reminders',
      'Growth Timeline photo memory',
    ],
  },
  {
    id: 'family',
    name: 'Family',
    price: '$11.99',
    cadence: 'per month',
    features: [
      'For multi-caregiver households',
      'Expanded care circle',
      'Shared coordination plan',
    ],
  },
]
