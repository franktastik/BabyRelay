import { describe, expect, test } from 'bun:test'
import enJson from '../../../docs/localization/app-strings/en.json'
import { en } from './en'

describe('English localization resource', () => {
  test('matches the docs source of truth', () => {
    expect(en as Record<string, string>).toEqual(enJson.strings)
  })
})
