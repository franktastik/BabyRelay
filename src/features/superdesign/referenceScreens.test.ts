import { describe, expect, test } from 'bun:test'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  SUPERDESIGN_REFERENCE_SCREEN_ROUTES,
  findUnmappedSuperdesignReferences,
  getT359Routes,
} from './referenceScreens'

const screenshotDir = join(process.cwd(), 'docs/product/superdesign-reference-assets/screenshots1')

describe('Superdesign reference screen route map', () => {
  test('maps every checked-in reference screenshot to an app route', () => {
    const files = readdirSync(screenshotDir).filter((file) => file.endsWith('.png')).sort()

    expect(findUnmappedSuperdesignReferences(files)).toEqual([])
    expect(SUPERDESIGN_REFERENCE_SCREEN_ROUTES).toHaveLength(files.length)
  })

  test('covers the T359 settings screens that were missing from the app UI', () => {
    const routes = new Set(getT359Routes())

    expect(routes.has('/insights')).toBe(true)
    expect(routes.has('/milestones')).toBe(true)
    expect(routes.has('/journal')).toBe(true)
    expect(routes.has('/support')).toBe(true)
  })
})
