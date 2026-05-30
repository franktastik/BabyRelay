import type { DemoGrowthMoment } from '@/src/features/demo/growth'

export type GrowthMediaStatus = 'ready' | 'bundled-demo' | 'missing'

export interface GrowthTimelineMediaRecord {
  momentId: string
  babyId: string
  caption: string
  localImageUri: string | null
  thumbnailUri: string | null
  bundledAssetId: string | null
  status: GrowthMediaStatus
  needsBackup: boolean
  displaySource: 'local-file' | 'thumbnail' | 'bundled-demo' | 'missing'
}

export interface GrowthTimelineBackupManifest {
  version: 1
  babyId: string
  createdAt: string
  storageMode: 'local-user-archive'
  mediaCount: number
  records: GrowthTimelineMediaRecord[]
}

export function buildGrowthTimelineMediaRecord(moment: DemoGrowthMoment): GrowthTimelineMediaRecord {
  const localImageUri = normalizeUri(moment.localImageUri)
  const bundledAssetId = moment.localImageAsset || null
  const status: GrowthMediaStatus = localImageUri ? 'ready' : bundledAssetId ? 'bundled-demo' : 'missing'

  return {
    momentId: moment.id,
    babyId: moment.babyId,
    caption: moment.caption || '',
    localImageUri,
    thumbnailUri: null,
    bundledAssetId,
    status,
    needsBackup: status !== 'missing',
    displaySource: getGrowthMediaDisplaySource({ localImageUri, bundledAssetId, status }),
  }
}

export function summarizeGrowthTimelineMediaDurability(records: GrowthTimelineMediaRecord[]) {
  return records.reduce(
    (summary, record) => ({
      readyCount: summary.readyCount + (record.status === 'ready' ? 1 : 0),
      bundledDemoCount: summary.bundledDemoCount + (record.status === 'bundled-demo' ? 1 : 0),
      missingCount: summary.missingCount + (record.status === 'missing' ? 1 : 0),
      backupCandidateCount: summary.backupCandidateCount + (record.needsBackup ? 1 : 0),
    }),
    {
      readyCount: 0,
      bundledDemoCount: 0,
      missingCount: 0,
      backupCandidateCount: 0,
    }
  )
}

export function buildGrowthTimelineBackupManifest({
  babyId,
  moments,
  createdAt = new Date(),
}: {
  babyId: string
  moments: DemoGrowthMoment[]
  createdAt?: Date
}): GrowthTimelineBackupManifest {
  const records = moments.map(buildGrowthTimelineMediaRecord)

  return {
    version: 1,
    babyId,
    createdAt: createdAt.toISOString(),
    storageMode: 'local-user-archive',
    mediaCount: records.length,
    records,
  }
}

function getGrowthMediaDisplaySource({
  localImageUri,
  bundledAssetId,
  status,
}: {
  localImageUri: string | null
  bundledAssetId: string | null
  status: GrowthMediaStatus
}): GrowthTimelineMediaRecord['displaySource'] {
  if (status === 'ready' && localImageUri) return 'local-file'
  if (bundledAssetId) return 'bundled-demo'
  return 'missing'
}

function normalizeUri(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
