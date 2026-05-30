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
    id: 'gm-upload-1',
    babyId: 'baby-1',
    localImageUri: '',
    localImageAsset: 'album-test-baby-1',
    caption: 'Sleepy newborn morning',
    momentType: 'photo',
    occurredAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'gm-upload-2',
    babyId: 'baby-1',
    localImageUri: '',
    localImageAsset: 'album-test-baby-2',
    caption: 'Big smile after breakfast',
    momentType: 'milestone',
    occurredAt: new Date(Date.now() - 18 * 60 * 1000),
  },
  {
    id: 'gm-upload-3',
    babyId: 'baby-1',
    localImageUri: '',
    localImageAsset: 'album-test-baby-3',
    caption: 'Tiny toes close-up',
    momentType: 'photo',
    occurredAt: new Date(Date.now() - 26 * 60 * 1000),
  },
  {
    id: 'gm-upload-4',
    babyId: 'baby-1',
    localImageUri: '',
    localImageAsset: 'album-test-baby-4',
    caption: 'Cuddle with bunny',
    momentType: 'photo',
    occurredAt: new Date(Date.now() - 42 * 60 * 1000),
  },
  {
    id: 'gm-upload-5',
    babyId: 'baby-1',
    localImageUri: '',
    localImageAsset: 'album-test-baby-5',
    caption: 'Pink blanket afternoon',
    momentType: 'photo',
    occurredAt: new Date(Date.now() - 55 * 60 * 1000),
  },
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
