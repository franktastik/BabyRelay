export interface DemoGrowthMoment {
  id: string
  babyId: string
  localImageUri: string
  localImageAsset?: string
  caption?: string
  momentType: string
  occurredAt: Date
}

export interface DemoGrowthAdapter {
  addMoment: (moment: Omit<DemoGrowthMoment, 'id'>) => Promise<DemoGrowthMoment>
  getMoments: (babyId: string) => Promise<DemoGrowthMoment[]>
}

const demoMoments: DemoGrowthMoment[] = [
  {
    id: 'gm-1',
    babyId: 'baby-1',
    localImageUri: '',
    localImageAsset: 'growth-feet-reference',
    caption: 'The first big smile!',
    momentType: 'milestone',
    occurredAt: new Date(Date.now() - 35 * 60 * 1000),
  },
  {
    id: 'gm-2',
    babyId: 'baby-1',
    localImageUri: '',
    localImageAsset: 'growth-feet-reference',
    caption: 'Two weeks old',
    momentType: 'photo',
    occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
]

export const createDemoGrowthAdapter = (): DemoGrowthAdapter => ({
  addMoment: async (moment) => {
    const newMoment: DemoGrowthMoment = {
      ...moment,
      id: `gm-${Date.now()}`,
    }
    demoMoments.unshift(newMoment)
    return newMoment
  },
  getMoments: async (babyId: string) => {
    return demoMoments
      .filter((moment) => moment.babyId === babyId)
      .sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
    )
  },
})
