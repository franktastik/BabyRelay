import { deleteApp, initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  connectStorageEmulator,
  deleteObject,
  getBytes,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage'

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
  firestorePort: readPositiveInt(
    'firestorePort',
    Number(readArg('port', process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080))
  ),
  authPort: readPositiveInt('authPort', Number(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || 9099)),
  storagePort: readPositiveInt(
    'storagePort',
    Number(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT || 9199)
  ),
  storageBucket: readArg(
    'storageBucket',
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'babyminimo-demo.appspot.com'
  ),
  households: readPositiveInt('households', 10),
  eventsPerBaby: readPositiveInt('eventsPerBaby', 40),
  readPasses: readPositiveInt('readPasses', 5),
  latestLimit: readPositiveInt('latestLimit', 20),
  summaryReads: readBooleanArg('summaryReads', false),
  summaryWriteMode: readArg('summaryWriteMode', 'perEvent'),
  authUsers: readPositiveInt('authUsers', 0),
  loginPasses: readPositiveInt('loginPasses', 1),
  storageObjects: readPositiveInt('storageObjects', 0),
  authConcurrency: readPositiveInt('authConcurrency', 25),
  writeConcurrency: readPositiveInt('writeConcurrency', 25),
  readConcurrency: readPositiveInt('readConcurrency', 50),
  storageConcurrency: readPositiveInt('storageConcurrency', 25),
  deleteConcurrency: readPositiveInt('deleteConcurrency', 25),
  cleanup: readBooleanArg('cleanup', true),
}

const SUMMARY_WRITE_MODES = new Set(['perEvent', 'final', 'function'])
if (!SUMMARY_WRITE_MODES.has(options.summaryWriteMode)) {
  throw new Error(`--summaryWriteMode must be one of: ${Array.from(SUMMARY_WRITE_MODES).join(', ')}`)
}

const firestoreBaseUrl = `http://${options.host}:${options.firestorePort}/v1/projects/${options.projectId}/databases/(default)/documents`
const authBaseUrl = `http://${options.host}:${options.authPort}/identitytoolkit.googleapis.com/v1`
const runId = `load-${Date.now()}`
const counts = {
  authCreates: 0,
  authLogins: 0,
  authDeletes: 0,
  authFailures: 0,
  reads: 0,
  writes: 0,
  functionWrites: 0,
  deletes: 0,
  storageWrites: 0,
  storageReads: 0,
  storageDeletes: 0,
  storageFailures: 0,
}
const createdDocuments = []
const createdDocumentPaths = new Set()
const createdAuthUsers = []
const createdStorageObjects = []
const babyIds = []
const samples = {
  auth: {},
  writeInputs: {},
  writeOutputs: {},
  readInput: null,
  readOutput: null,
  summaryReadInput: null,
  summaryReadOutput: null,
  summaryWriteInput: null,
  summaryWriteOutput: null,
  storage: {},
  deleteInput: null,
  deleteOutput: null,
}

const estimateUsd = (operationCount, ratePer100k) => (operationCount / 100_000) * ratePer100k

const value = {
  string: (input) => ({ stringValue: input }),
  integer: (input) => ({ integerValue: String(input) }),
  boolean: (input) => ({ booleanValue: input }),
  timestamp: (input) => ({ timestampValue: input.toISOString() }),
  map: (fields) => ({ mapValue: { fields } }),
}

const summarizeError = (error) => (error instanceof Error ? error.message : String(error))

const summarizeErrorWithCause = (error) => {
  if (!(error instanceof Error)) return String(error)
  const cause = error.cause instanceof Error ? ` cause=${error.cause.message}` : ''
  return `${error.name}: ${error.message}${cause}`
}

const redactAuth = (payload) => {
  if (!payload || typeof payload !== 'object') return payload
  const output = { ...payload }
  for (const key of ['idToken', 'refreshToken']) {
    if (key in output) output[key] = '[redacted]'
  }
  return output
}

const requestJson = async (url, init = {}) => {
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

  if (response.status === 204) return {}
  return response.json()
}

const registerDocumentPath = (path, name = `${firestoreBaseUrl}/${path}`) => {
  if (!createdDocumentPaths.has(path)) {
    createdDocumentPaths.add(path)
    createdDocuments.push({ name, path })
  }
}

const runPool = async (items, concurrency, worker) => {
  if (items.length === 0) return []
  const results = new Array(items.length)
  let nextIndex = 0
  const workerCount = Math.max(1, Math.min(concurrency || 1, items.length))

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex
        nextIndex += 1
        results[index] = await worker(items[index], index)
      }
    })
  )

  return results
}

const createAuthUser = async (_, index) => {
  const email = `${runId}-user-${index + 1}@example.test`
  const password = 'Password123!'
  try {
    const response = await requestJson(`${authBaseUrl}/accounts:signUp?key=fake-api-key`, {
      method: 'POST',
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    })
    counts.authCreates += 1
    const user = { email, password, localId: response.localId, idToken: response.idToken }
    createdAuthUsers.push(user)
    if (!samples.auth.signupInput) {
      samples.auth.signupInput = { email, password: '[redacted]', returnSecureToken: true }
      samples.auth.signupOutput = redactAuth(response)
    }
    return user
  } catch (error) {
    counts.authFailures += 1
    throw error
  }
}

const loginAuthUser = async (user) => {
  try {
    const response = await requestJson(`${authBaseUrl}/accounts:signInWithPassword?key=fake-api-key`, {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        returnSecureToken: true,
      }),
    })
    counts.authLogins += 1
    user.idToken = response.idToken
    if (!samples.auth.loginInput) {
      samples.auth.loginInput = {
        email: user.email,
        password: '[redacted]',
        returnSecureToken: true,
      }
      samples.auth.loginOutput = redactAuth(response)
    }
    return user
  } catch (error) {
    counts.authFailures += 1
    throw error
  }
}

const deleteAuthUser = async (user) => {
  if (!user.idToken) return
  try {
    const response = await requestJson(`${authBaseUrl}/accounts:delete?key=fake-api-key`, {
      method: 'POST',
      body: JSON.stringify({ idToken: user.idToken }),
    })
    counts.authDeletes += 1
    if (!samples.auth.deleteInput) {
      samples.auth.deleteInput = { localId: user.localId, idToken: '[redacted]' }
      samples.auth.deleteOutput = response
    }
  } catch (error) {
    counts.authFailures += 1
    throw error
  }
}

const createDocument = async (collectionName, fields) => {
  const document = await requestJson(`${firestoreBaseUrl}/${collectionName}`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  })
  const path = document.name.split('/documents/')[1]
  registerDocumentPath(path, document.name)
  counts.writes += 1
  return { ...document, id: path.split('/').at(-1) || path, path }
}

const setDocument = async (path, fields) => {
  const document = await requestJson(`${firestoreBaseUrl}/${path}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  })
  registerDocumentPath(path, document.name)
  counts.writes += 1
  return document
}

const eventPreviewFields = (careEventId, fields) =>
  value.map({
    eventId: value.string(careEventId),
    type: fields.type,
    occurredAt: fields.occurredAt,
    createdBy: fields.createdBy,
    metadataPreview: fields.metadata,
  })

const updateSummaryState = (summaryState, careEventId, careEventFields) => {
  const eventType = careEventFields.type.stringValue
  const eventOccurredAt = new Date(careEventFields.occurredAt.timestampValue)
  const lastEventAt = summaryState.lastEventAt ? new Date(summaryState.lastEventAt.timestampValue) : null
  const preview = eventPreviewFields(careEventId, careEventFields)

  if (!lastEventAt || eventOccurredAt >= lastEventAt) {
    summaryState.lastEventId = value.string(careEventId)
    summaryState.lastEventAt = careEventFields.occurredAt
    summaryState.lastActionBy = careEventFields.createdBy
  }

  if ((eventType === 'breastfeed' || eventType === 'bottle') && !summaryState.lastFeed) {
    summaryState.lastFeed = preview
  }
  if (eventType === 'diaper' && !summaryState.lastDiaper) {
    summaryState.lastDiaper = preview
  }
  if (eventType === 'sleep' && !summaryState.lastSleep) {
    summaryState.lastSleep = preview
  }
  if (eventType === 'medication' && !summaryState.lastMedication) {
    summaryState.lastMedication = preview
  }

  return summaryState
}

const writeBabyLatestState = async ({ baby, household, summaryState, now }) => {
  const summaryPath = `babyLatestStates/${baby.id}`
  const fields = {
    babyId: value.string(baby.id),
    householdId: value.string(household.id),
    babyName: value.string(baby.fields?.name?.stringValue || `Load Baby ${baby.id}`),
    schemaVersion: value.integer(1),
    runId: value.string(runId),
    updatedAt: value.timestamp(now),
    ...summaryState,
  }
  const document = await setDocument(summaryPath, fields)

  if (!samples.summaryWriteInput) {
    samples.summaryWriteInput = { path: summaryPath, fields }
    samples.summaryWriteOutput = { path: summaryPath, name: document.name }
  }
}

const deleteDocument = async (path) => {
  const response = await fetch(`${firestoreBaseUrl}/${path}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE ${path} failed with ${response.status}: ${await response.text()}`)
  }
  counts.deletes += 1
  if (!samples.deleteInput) {
    samples.deleteInput = { path }
    samples.deleteOutput = { status: response.status }
  }
}

const createSeedDataForHousehold = async (householdIndex) => {
  const now = new Date()
  const summaryState = {}
  const authUser = createdAuthUsers[householdIndex % Math.max(createdAuthUsers.length, 1)]
  const household = await createDocument('households', {
    name: value.string(`Load Household ${householdIndex + 1}`),
    runId: value.string(runId),
    createdAt: value.timestamp(now),
    updatedAt: value.timestamp(now),
  })
  if (householdIndex === 0) {
    samples.writeInputs.household = { collection: 'households', fields: household.fields }
    samples.writeOutputs.household = { id: household.id, path: household.path, name: household.name }
  }

  const baby = await createDocument('babies', {
    householdId: value.string(household.id),
    name: value.string(`Load Baby ${householdIndex + 1}`),
    birthDate: value.string(''),
    runId: value.string(runId),
    createdAt: value.timestamp(now),
    updatedAt: value.timestamp(now),
  })
  babyIds.push(baby.id)
  if (householdIndex === 0) {
    samples.writeInputs.baby = { collection: 'babies', fields: baby.fields }
    samples.writeOutputs.baby = { id: baby.id, path: baby.path, name: baby.name }
  }

  const userId = authUser?.localId || `${runId}-user-${householdIndex + 1}`
  const userPath = `users/${userId}`
  const userFields = {
    currentHouseholdId: value.string(household.id),
    selectedBabyId: value.string(baby.id),
    onboardingCompleted: value.boolean(true),
    runId: value.string(runId),
    updatedAt: value.timestamp(now),
  }
  const user = await setDocument(userPath, userFields)
  if (householdIndex === 0) {
    samples.writeInputs.user = { path: userPath, fields: userFields }
    samples.writeOutputs.user = { path: userPath, name: user.name }
  }

  for (let eventIndex = 0; eventIndex < options.eventsPerBaby; eventIndex += 1) {
    const isFeed = eventIndex % 2 === 0
    const careEventFields = {
      babyId: value.string(baby.id),
      babyName: value.string(baby.fields?.name?.stringValue || `Load Baby ${householdIndex + 1}`),
      householdId: value.string(household.id),
      type: value.string(isFeed ? 'breastfeed' : 'diaper'),
      occurredAt: value.timestamp(new Date(Date.now() - eventIndex * 60_000)),
      metadata: value.map(
        isFeed
          ? { side: value.string('left'), durationMin: value.integer(12) }
          : { kind: value.string(eventIndex % 3 === 0 ? 'dirty' : 'wet') }
      ),
      skipLatestStateSummary: value.boolean(options.summaryWriteMode !== 'function'),
      createdBy: value.string(userId),
      runId: value.string(runId),
      createdAt: value.timestamp(new Date()),
      updatedAt: value.timestamp(new Date()),
    }
    const careEvent = await createDocument('careEvents', careEventFields)
    updateSummaryState(summaryState, careEvent.id, careEventFields)
    if (options.summaryReads && options.summaryWriteMode === 'perEvent') {
      await writeBabyLatestState({ baby, household, summaryState, now: new Date() })
    }
    if (householdIndex === 0 && eventIndex === 0) {
      samples.writeInputs.careEvent = { collection: 'careEvents', fields: careEventFields }
      samples.writeOutputs.careEvent = {
        id: careEvent.id,
        path: careEvent.path,
        name: careEvent.name,
      }
    }
  }

  if (options.summaryReads && options.summaryWriteMode === 'final') {
    await writeBabyLatestState({ baby, household, summaryState, now: new Date() })
  }
}

const createSeedData = async () => {
  await runPool(
    Array.from({ length: options.households }, (_, index) => index),
    options.writeConcurrency,
    createSeedDataForHousehold
  )
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchDocumentOrNull = async (path) => {
  const response = await fetch(`${firestoreBaseUrl}/${path}`)
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

const waitForFunctionSummaries = async () => {
  if (!options.summaryReads || options.summaryWriteMode !== 'function') return 0

  const expectedSummaryWrites = options.households * options.eventsPerBaby
  const deadline = Date.now() + 30_000
  const pending = new Set(babyIds)
  let attempts = 0

  while (pending.size > 0 && Date.now() < deadline) {
    attempts += 1
    await runPool([...pending], options.readConcurrency, async (babyId) => {
      const path = `babyLatestStates/${babyId}`
      const document = await fetchDocumentOrNull(path)
      if (!document) return
      const hasExpectedRun = document.fields?.runId?.stringValue === runId
      const processedAllEvents =
        Number(document.fields?.eventCount?.integerValue || 0) >= options.eventsPerBaby
      if (!hasExpectedRun || !processedAllEvents) return
      registerDocumentPath(path, document.name)
      pending.delete(babyId)
      if (!samples.summaryWriteInput) {
        samples.summaryWriteInput = {
          mode: 'function-trigger',
          sourceCollection: 'careEvents',
          derivedPath: path,
        }
        samples.summaryWriteOutput = {
          path,
          name: document.name,
          fields: document.fields,
        }
      }
    })
    if (pending.size > 0) await sleep(250)
  }

  if (pending.size > 0) {
    throw new Error(
      `Functions summary maintenance timed out waiting for ${pending.size} babyLatestStates documents`
    )
  }

  counts.functionWrites += expectedSummaryWrites
  return attempts
}

const readLatestEventsForBaby = async (babyId) => {
  const queryInput = {
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
  }
  const response = await requestJson(`${firestoreBaseUrl}:runQuery`, {
    method: 'POST',
    body: JSON.stringify(queryInput),
  })

  const returnedDocuments = response.filter((item) => Boolean(item.document)).length
  counts.reads += Math.max(returnedDocuments, 1)
  if (!samples.readInput) {
    const firstDocument = response.find((item) => Boolean(item.document))?.document
    samples.readInput = queryInput
    samples.readOutput = {
      returnedDocuments,
      firstDocument: firstDocument
        ? {
            name: firstDocument.name,
            fields: firstDocument.fields,
          }
        : null,
    }
  }
}

const readBabyLatestState = async (babyId) => {
  const path = `babyLatestStates/${babyId}`
  const response = await requestJson(`${firestoreBaseUrl}/${path}`)
  counts.reads += 1
  if (!samples.summaryReadInput) {
    samples.summaryReadInput = { path }
    samples.summaryReadOutput = {
      name: response.name,
      fields: response.fields,
    }
  }
}

const runReadPasses = async () => {
  const startedAt = performance.now()
  const reader = options.summaryReads ? readBabyLatestState : readLatestEventsForBaby

  for (let pass = 0; pass < options.readPasses; pass += 1) {
    await runPool(babyIds, options.readConcurrency, reader)
  }

  return performance.now() - startedAt
}

const uploadStorageObject = async (_, index) => {
  const user = createdAuthUsers[index % createdAuthUsers.length]
  if (!user) return
  const objectPath = `emulator-dev/users/${user.localId}/${runId}-${index + 1}.json`
  const payload = {
    runId,
    userId: user.localId,
    index,
    note: 'Local emulator load artifact. Delete after test.',
  }
  const app = initializeApp(
    {
      apiKey: 'fake-api-key',
      projectId: options.projectId,
      storageBucket: options.storageBucket,
    },
    `${runId}-storage-${index}`
  )
  try {
    const auth = getAuth(app)
    connectAuthEmulator(auth, `http://${options.host}:${options.authPort}`, {
      disableWarnings: true,
    })
    await signInWithEmailAndPassword(auth, user.email, user.password)
    const storage = getStorage(app)
    connectStorageEmulator(storage, options.host, options.storagePort)
    const storageRef = ref(storage, objectPath)
    const uploadResponse = await uploadString(storageRef, JSON.stringify(payload), 'raw', {
      contentType: 'application/json',
    })
    counts.storageWrites += 1
    createdStorageObjects.push({ path: objectPath, user })

    const bytes = await getBytes(storageRef)
    counts.storageReads += 1
    if (!samples.storage.uploadInput) {
      samples.storage.uploadInput = {
        path: objectPath,
        contentType: 'application/json',
        bytes: Buffer.byteLength(JSON.stringify(payload)),
      }
      samples.storage.uploadOutput = {
        fullPath: uploadResponse.ref.fullPath,
        bucket: uploadResponse.ref.bucket,
        contentType: uploadResponse.metadata.contentType,
        size: uploadResponse.metadata.size,
      }
      samples.storage.readOutput = {
        bytes: bytes.byteLength,
      }
    }
  } catch (error) {
    counts.storageFailures += 1
    throw error
  } finally {
    await deleteApp(app)
  }
}

const deleteStorageObject = async ({ path, user }) => {
  const app = initializeApp(
    {
      apiKey: 'fake-api-key',
      projectId: options.projectId,
      storageBucket: options.storageBucket,
    },
    `${runId}-storage-delete-${path.split('/').at(-1)}`
  )
  try {
    const auth = getAuth(app)
    connectAuthEmulator(auth, `http://${options.host}:${options.authPort}`, {
      disableWarnings: true,
    })
    await signInWithEmailAndPassword(auth, user.email, user.password)
    const storage = getStorage(app)
    connectStorageEmulator(storage, options.host, options.storagePort)
    await deleteObject(ref(storage, path))
    counts.storageDeletes += 1
    if (!samples.storage.deleteInput) {
      samples.storage.deleteInput = { path }
      samples.storage.deleteOutput = { deleted: true }
    }
  } catch (error) {
    counts.storageFailures += 1
    throw error
  } finally {
    await deleteApp(app)
  }
}

const cleanupSeedData = async () => {
  await runPool([...createdDocuments].reverse(), options.deleteConcurrency, (document) =>
    deleteDocument(document.path)
  )
}

const cleanupAuthUsers = async () => {
  await runPool([...createdAuthUsers], options.authConcurrency, deleteAuthUser)
}

const cleanupStorageObjects = async () => {
  await runPool([...createdStorageObjects], options.storageConcurrency, deleteStorageObject)
}

const countRemainingRunDocuments = async () => {
  const collections = ['households', 'babies', 'users', 'careEvents', 'babyLatestStates']
  const totals = {}
  await runPool(collections, 4, async (collectionId) => {
    const response = await requestJson(`${firestoreBaseUrl}:runQuery`, {
      method: 'POST',
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'runId' },
              op: 'EQUAL',
              value: value.string(runId),
            },
          },
          limit: 1000,
        },
      }),
    })
    totals[collectionId] = response.filter((item) => Boolean(item.document)).length
  })
  return totals
}

const verifySampleAuthDeletion = async () => {
  const sampleUser = createdAuthUsers[0]
  if (!sampleUser) return { skipped: true }
  const response = await fetch(`${authBaseUrl}/accounts:signInWithPassword?key=fake-api-key`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: sampleUser.email,
      password: sampleUser.password,
      returnSecureToken: true,
    }),
  })
  return {
    sampleEmail: sampleUser.email,
    signInAfterDeleteStatus: response.status,
    deleted: !response.ok,
  }
}

const main = async () => {
  const startedAt = performance.now()
  const timings = {
    auth: 0,
    writes: 0,
    functions: 0,
    reads: 0,
    storage: 0,
    cleanup: 0,
  }
  let functionSummaryPolls = 0
  let failed = null

  try {
    const authStartedAt = performance.now()
    await runPool(Array.from({ length: options.authUsers }), options.authConcurrency, createAuthUser)
    for (let pass = 0; pass < options.loginPasses; pass += 1) {
      await runPool(createdAuthUsers, options.authConcurrency, loginAuthUser)
    }
    timings.auth = performance.now() - authStartedAt

    const writeStartedAt = performance.now()
    await createSeedData()
    timings.writes = performance.now() - writeStartedAt

    const functionStartedAt = performance.now()
    functionSummaryPolls = await waitForFunctionSummaries()
    timings.functions = performance.now() - functionStartedAt

    timings.reads = await runReadPasses()

    const storageStartedAt = performance.now()
    await runPool(Array.from({ length: options.storageObjects }), options.storageConcurrency, uploadStorageObject)
    timings.storage = performance.now() - storageStartedAt
  } catch (error) {
    failed = summarizeErrorWithCause(error)
  }

  const deleteStartedAt = performance.now()
  if (options.cleanup) {
    try {
      await cleanupStorageObjects()
      await cleanupSeedData()
      await cleanupAuthUsers()
    } catch (error) {
      failed = failed
        ? `${failed}; cleanup=${summarizeErrorWithCause(error)}`
        : `cleanup=${summarizeErrorWithCause(error)}`
    }
  }
  timings.cleanup = performance.now() - deleteStartedAt

  let cleanupVerification = options.cleanup
    ? {
        remainingRunDocuments: null,
        authDeletionProbe: null,
        createdStorageObjects: createdStorageObjects.length,
        deletedStorageObjects: counts.storageDeletes,
      }
    : {
        skipped: true,
      }
  if (options.cleanup) {
    try {
      cleanupVerification = {
        ...cleanupVerification,
        remainingRunDocuments: await countRemainingRunDocuments(),
        authDeletionProbe: await verifySampleAuthDeletion(),
      }
    } catch (error) {
      failed = failed
        ? `${failed}; cleanupVerification=${summarizeErrorWithCause(error)}`
        : `cleanupVerification=${summarizeErrorWithCause(error)}`
    }
  }

  const totalMs = performance.now() - startedAt
  const cost = {
    readsUsd: estimateUsd(counts.reads, DEFAULT_RATES.readsPer100kUsd),
    clientWritesUsd: estimateUsd(counts.writes, DEFAULT_RATES.writesPer100kUsd),
    functionWritesUsd: estimateUsd(counts.functionWrites, DEFAULT_RATES.writesPer100kUsd),
    deletesUsd: estimateUsd(counts.deletes, DEFAULT_RATES.deletesPer100kUsd),
  }
  const totalUsd = cost.readsUsd + cost.clientWritesUsd + cost.functionWritesUsd + cost.deletesUsd

  console.log(
    JSON.stringify(
      {
        runId,
        options,
        counts,
        cleanupVerification,
        estimatedFirestoreOperationCostUsd: {
          ...cost,
          totalUsd,
          note:
            'Operation-only estimate using default US-style rates. Confirm current location-specific Firebase prices before production budgeting.',
        },
        timingsMs: {
          auth: Math.round(timings.auth),
          writes: Math.round(timings.writes),
          functions: Math.round(timings.functions),
          reads: Math.round(timings.reads),
          storage: Math.round(timings.storage),
          cleanup: Math.round(timings.cleanup),
          total: Math.round(totalMs),
        },
        failed,
        representativeInputOutput: samples,
        optimizationSignals: {
          readModel: options.summaryReads ? 'babyLatestStates one-doc summary' : 'careEvents latest-event query',
          optimizedLatestQueryMaxReadsPerBabyPerPass: options.summaryReads ? 1 : options.latestLimit,
          previousFlatCollectionReadWouldScaleWithTotalCareEvents:
            options.households * options.eventsPerBaby,
          summaryReadSavingsPerPassComparedWithLatestLimit: options.summaryReads
            ? Math.max(0, options.households * options.latestLimit - options.households)
            : 0,
          summaryWriteMode: options.summaryReads
            ? `${options.summaryWriteMode}; ${
                options.summaryWriteMode === 'function'
                  ? `verified ${counts.functionWrites} derived summary writes after ${functionSummaryPolls} polling passes`
                  : 'production target is Functions-emulator maintenance before deploy'
              }`
            : 'not enabled',
          authAndStorageEmulatorOnly:
            'Auth and Storage emulator timings validate local behavior and cleanup paths, not production capacity or quota guarantees.',
        },
      },
      null,
      2
    )
  )

  if (failed) {
    process.exit(1)
  }

  process.exit(0)
}

main().catch((error) => {
  console.error(summarizeErrorWithCause(error))
  process.exit(1)
})
