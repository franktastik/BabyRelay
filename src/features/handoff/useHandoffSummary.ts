import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { createDemoHandoffAdapter, type DemoHandoffSummary } from '@/src/features/demo/handoff'

const adapter = createDemoHandoffAdapter()

export function useHandoffSummary(babyId: string) {
  const [summary, setSummary] = useState<DemoHandoffSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
    let cancelled = false
    setLoading(true)

    const unsubscribe = adapter.subscribeToSummary(babyId, (data) => {
      if (!cancelled) {
        setSummary(data)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
    }, [babyId])
  )

  return { summary, loading }
}
