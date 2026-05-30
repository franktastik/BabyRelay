import { describe, expect, test } from 'bun:test'

const readStorageRules = () => Bun.file('storage.rules').text()

describe('storage.rules readiness', () => {
  test('requires signed-in users for allowed storage paths', async () => {
    const rules = await readStorageRules()

    expect(rules).toContain('request.auth != null')
    expect(rules).toContain('request.auth.uid == uid')
  })

  test('scopes household storage paths to household membership claims', async () => {
    const rules = await readStorageRules()

    expect(rules).toContain('match /households/{householdId}/babies/{babyId}/growthTimeline/{fileName}')
    expect(rules).toContain('request.auth.token.householdIds is list')
    expect(rules).toContain('householdId in request.auth.token.householdIds')
  })

  test('keeps a deny-by-default fallback for unmodeled storage paths', async () => {
    const rules = await readStorageRules()

    expect(rules).toContain('match /{allPaths=**}')
    expect(rules).toContain('allow read, write: if false')
  })

  test('limits local readiness writes to media or export artifacts', async () => {
    const rules = await readStorageRules()

    expect(rules).toContain('request.resource.size < 20 * 1024 * 1024')
    expect(rules).toContain("request.resource.contentType.matches('image/.*')")
    expect(rules).toContain("'application/pdf'")
    expect(rules).toContain("'application/zip'")
  })
})
