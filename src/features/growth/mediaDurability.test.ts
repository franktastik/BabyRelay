import { describe, expect, test } from 'bun:test'
import {
  buildGrowthTimelineBackupManifest,
  buildGrowthTimelineMediaRecord,
  summarizeGrowthTimelineMediaDurability,
} from './mediaDurability'
import type { DemoGrowthMoment } from '@/src/features/demo/growth'

const baseMoment: DemoGrowthMoment = {
  id: 'gm-1',
  babyId: 'baby-1',
  localImageUri: 'file:///app/Documents/growth/gm-1.jpg',
  caption: 'First smile',
  momentType: 'milestone',
  occurredAt: new Date(Date.UTC(2026, 4, 26)),
}

describe('growth timeline media durability', () => {
  test('classifies app-local image files as ready backup candidates', () => {
    const record = buildGrowthTimelineMediaRecord(baseMoment)

    expect(record).toMatchObject({
      momentId: 'gm-1',
      localImageUri: 'file:///app/Documents/growth/gm-1.jpg',
      status: 'ready',
      needsBackup: true,
      displaySource: 'local-file',
    })
  })

  test('classifies bundled demo assets separately from user media', () => {
    const record = buildGrowthTimelineMediaRecord({
      ...baseMoment,
      id: 'gm-2',
      localImageUri: '',
      localImageAsset: 'growth-feet-reference',
    })

    expect(record.status).toBe('bundled-demo')
    expect(record.displaySource).toBe('bundled-demo')
    expect(record.needsBackup).toBe(true)
  })

  test('marks records missing when no durable media pointer exists', () => {
    const record = buildGrowthTimelineMediaRecord({
      ...baseMoment,
      id: 'gm-3',
      localImageUri: '',
    })

    expect(record.status).toBe('missing')
    expect(record.displaySource).toBe('missing')
    expect(record.needsBackup).toBe(false)
  })

  test('builds a local backup manifest without backend storage assumptions', () => {
    const manifest = buildGrowthTimelineBackupManifest({
      babyId: 'baby-1',
      moments: [
        baseMoment,
        { ...baseMoment, id: 'gm-2', localImageUri: '', localImageAsset: 'growth-feet-reference' },
      ],
      createdAt: new Date(Date.UTC(2026, 4, 26)),
    })

    expect(manifest).toMatchObject({
      version: 1,
      babyId: 'baby-1',
      createdAt: '2026-05-26T00:00:00.000Z',
      storageMode: 'local-user-archive',
      mediaCount: 2,
    })
    expect(manifest.records.map((record) => record.status)).toEqual(['ready', 'bundled-demo'])
  })

  test('summarizes ready, demo, missing, and backup candidate counts', () => {
    const summary = summarizeGrowthTimelineMediaDurability([
      buildGrowthTimelineMediaRecord(baseMoment),
      buildGrowthTimelineMediaRecord({ ...baseMoment, id: 'gm-2', localImageUri: '', localImageAsset: 'growth-feet-reference' }),
      buildGrowthTimelineMediaRecord({ ...baseMoment, id: 'gm-3', localImageUri: '' }),
    ])

    expect(summary).toEqual({
      readyCount: 1,
      bundledDemoCount: 1,
      missingCount: 1,
      backupCandidateCount: 2,
    })
  })
})
