import { useState, useEffect } from 'react'
import { createDemoGrowthAdapter, type DemoGrowthMoment } from '@/src/features/demo/growth'
import { useGrowthTimelineStore } from '@/src/stores/growthTimelineStore'

const demoGrowth = createDemoGrowthAdapter()

export function useGrowthTimeline(babyId: string) {
  const localMoments = useGrowthTimelineStore((s) => s.localMoments)
  const [demoMoments, setDemoMoments] = useState<DemoGrowthMoment[]>([])

  useEffect(() => {
    demoGrowth.getMoments(babyId).then(setDemoMoments)
  }, [babyId])

  const babyLocalMoments = localMoments.filter((moment) => moment.babyId === babyId)
  const allMoments = [...babyLocalMoments, ...demoMoments].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  )

  return { moments: allMoments }
}
