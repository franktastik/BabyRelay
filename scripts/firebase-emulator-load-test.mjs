const DEFAULT_RATES = {
  readsPer100kUsd: 0.06,
  writesPer100kUsd: 0.18,
  deletesPer100kUsd: 0.02,
}

const readArg = (name, fallback) => {
  const prefix = `--${name}=`
  const arg = process.argv.find((value) => value.startsWith(prefix))
  return arg ? arg.slice(prefix.length) : fallback
}

const readBooleanArg = (name, fallback) => {
  const value = readArg(name, String(fallback)).toLowerCase()
  return value === 'true' || value === '1' || value === 'yes'
}

const readPositiveInt = (name, fallback) => {
  const value = Number(readArg(name, String(fallback)))
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`--${name} must be a non-negative integer`)
  }
  return value
}

const options = {
  projectId: readArg('projectId', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'babyminimo-demo'),
  host: readArg('host', process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1'),
  port: readPositiveInt(
    'port',
    Number(process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080)
  ),
  households: readPositiveInt('households', 10),
  eventsPerBaby: readPositiveInt('eventsPerBaby', 40),
  readPasses: readPositiveInt('readPasses', 5),
  latestLimit: readPositiveInt('latestLimit', 20),
  cleanup: readBooleanArg('cleanup', true),
}

const baseUrl = `http://${options.host}:${options.port}/v1/projects/${options.projectId}/databases/(default)/documents`
const runId = `load-${Date.now()}`
const counts = { reads: 0, writes: 0, deletes: 0 }
const createdDocuments = []
const babyIds = []

const estimateUsd = (operationCount, ratePer100k) => (operationCount / 100_000) * ratePer100k

const value = {
  string: (input) => ({ stringValue: input }),
  integer: (input) => ({ integerValue: String(input) }),
  boolean: (input) => ({ booleanValue: input }),
  timestamp: (input) => ({ timestampValue: input.toISOString() }),
  map: (fields) => ({ mapValue: { fields } }),
}

const requestJson = async (url, init) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${init.method || 'GET'} ${url} failed with ${response.status}: ${body}`)
  }

  return response.json()
}

const createDocument = async (collectionName, fields) => {
  const document = await requestJson(`${baseUrl}/${collectionName}`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  })
  const path = document.name.split('/documents/')[1]
  createdDocuments.push({ name: document.name, path })
  counts.writes += 1
  return { ...document, id: path.split('/').at(-1) || path, path }
}

const setDocument = async (path, fields) => {
  const document = await requestJson(`${baseUrl}/${path}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  })
  createdDocuments.push({ name: document.name, path })
  counts.writes += 1
  return document
}

const deleteDocument = async (path) => {
  const response = await fetch(`${baseUrl}/${path}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE ${path} failed with ${response.status}: ${await response.text()}`)
  }
  counts.deletes += 1
}

const createSeedData = async () => {
  for (let householdIndex = 0; householdIndex < options.households; householdIndex += 1) {
    const household = await createDocument('households', {
      name: value.string(`Load Household ${householdIndex + 1}`),
      runId: value.string(runId),
      createdAt: value.timestamp(new Date()),
      updatedAt: value.timestamp(new Date()),
    })

    const baby = await createDocument('babies', {
      householdId: value.string(household.id),
      name: value.string(`Load Baby ${householdIndex + 1}`),
      birthDate: value.string(''),
      runId: value.string(runId),
      createdAt: value.timestamp(new Date()),
      updatedAt: value.timestamp(new Date()),
    })
    babyIds.push(baby.id)

    await setDocument(`users/${runId}-user-${householdIndex + 1}`, {
      currentHouseholdId: value.string(household.id),
      selectedBabyId: value.string(baby.id),
      onboardingCompleted: value.boolean(true),
      runId: value.string(runId),
      updatedAt: value.timestamp(new Date()),
    })

    for (let eventIndex = 0; eventIndex < options.eventsPerBaby; eventIndex += 1) {
      const isFeed = eventIndex % 2 === 0
      await createDocument('careEvents', {
        babyId: value.string(baby.id),
        type: value.string(isFeed ? 'breastfeed' : 'diaper'),
        occurredAt: value.timestamp(new Date(Date.now() - eventIndex * 60_000)),
        metadata: value.map(
          isFeed
            ? { side: value.string('left'), durationMin: value.integer(12) }
            : { kind: value.string(eventIndex % 3 === 0 ? 'dirty' : 'wet') }
        ),
        createdBy: value.string(`Load Caregiver ${householdIndex + 1}`),
        runId: value.string(runId),
        createdAt: value.timestamp(new Date()),
        updatedAt: value.timestamp(new Date()),
      })
    }
  }
}

const readLatestEventsForBaby = async (babyId) => {
  const response = await requestJson(`${baseUrl}:runQuery`, {
    method: 'POST',
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'careEvents' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'babyId' },
            op: 'EQUAL',
            value: value.string(babyId),
          },
        },
        orderBy: [
          {
            field: { fieldPath: 'occurredAt' },
            direction: 'DESCENDING',
          },
        ],
        limit: options.latestLimit,
      },
    }),
  })

  const returnedDocuments = response.filter((item) => Boolean(item.document)).length
  counts.reads += Math.max(returnedDocuments, 1)
}

const runReadPasses = async () => {
  const startedAt = performance.now()

  for (let pass = 0; pass < options.readPasses; pass += 1) {
    for (const babyId of babyIds) {
      await readLatestEventsForBaby(babyId)
    }
  }

  return performance.now() - startedAt
}

const cleanupSeedData = async () => {
  for (const document of createdDocuments.reverse()) {
    await deleteDocument(document.path)
  }
}

const main = async () => {
  const startedAt = performance.now()
  await createSeedData()
  const readMs = await runReadPasses()

  if (options.cleanup) {
    await cleanupSeedData()
  }

  const totalMs = performance.now() - startedAt
  const cost = {
    readsUsd: estimateUsd(counts.reads, DEFAULT_RATES.readsPer100kUsd),
    writesUsd: estimateUsd(counts.writes, DEFAULT_RATES.writesPer100kUsd),
    deletesUsd: estimateUsd(counts.deletes, DEFAULT_RATES.deletesPer100kUsd),
  }
  const totalUsd = cost.readsUsd + cost.writesUsd + cost.deletesUsd

  console.log(
    JSON.stringify(
      {
        runId,
        options,
        counts,
        estimatedFirestoreOperationCostUsd: {
          ...cost,
          totalUsd,
          note:
            'Operation-only estimate using default US-style rates. Confirm current location-specific Firebase prices before production budgeting.',
        },
        timingsMs: {
          reads: Math.round(readMs),
          total: Math.round(totalMs),
        },
        optimizationSignals: {
          optimizedLatestQueryMaxReadsPerBabyPerPass: options.latestLimit,
          previousFlatCollectionReadWouldScaleWithTotalCareEvents:
            options.households * options.eventsPerBaby,
        },
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
