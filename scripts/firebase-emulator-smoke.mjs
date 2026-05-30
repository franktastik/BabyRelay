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
import http from 'node:http'
import https from 'node:https'

const readArg = (name, fallback) => {
  const prefix = `--${name}=`
  const arg = process.argv.find((value) => value.startsWith(prefix))
  return arg ? arg.slice(prefix.length) : fallback
}

const readPort = (name, fallback) => {
  const value = Number(readArg(name, fallback))
  if (!Number.isInteger(value) || value <= 0 || value > 65535) {
    throw new Error(`--${name} must be a valid TCP port`)
  }
  return value
}

const options = {
  host: readArg('host', process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1'),
  projectId: readArg(
    'projectId',
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'babyminimo-demo'
  ),
  storageBucket: readArg(
    'storageBucket',
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      'babyminimo-demo.appspot.com'
  ),
  authPort: readPort(
    'authPort',
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099'
  ),
  firestorePort: readPort(
    'firestorePort',
    process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080'
  ),
  storagePort: readPort(
    'storagePort',
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT || '9199'
  ),
  functionsPort: readPort(
    'functionsPort',
    process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || '5001'
  ),
  uiPort: readPort(
    'uiPort',
    process.env.EXPO_PUBLIC_FIREBASE_UI_EMULATOR_PORT || '4000'
  ),
}

const runId = `smoke-${Date.now()}`
const authBaseUrl = `http://${options.host}:${options.authPort}/identitytoolkit.googleapis.com/v1`
const firestoreBaseUrl = `http://${options.host}:${options.firestorePort}/v1/projects/${options.projectId}/databases/(default)/documents`
const smokeDocumentPath = `emulatorSmokeChecks/${runId}`

const state = {
  authUser: null,
  firestoreDocumentCreated: false,
  storageObjectPath: null,
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

const probeHttpStatus = (url) =>
  new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === 'https:' ? https : http
    const request = client.request(
      parsedUrl,
      {
        method: 'GET',
        timeout: 5_000,
      },
      (response) => {
        response.resume()
        response.on('end', () => resolve(response.statusCode || 0))
      }
    )

    request.on('timeout', () => {
      request.destroy(new Error(`${url} timed out after 5000ms`))
    })
    request.on('error', reject)
    request.end()
  })

const requireReachable = async (label, url, allowedStatuses = [200]) => {
  let status
  try {
    status = await probeHttpStatus(url)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${label} smoke failed: ${url} was not reachable. ${message}`)
  }
  if (!allowedStatuses.includes(status)) {
    throw new Error(`${label} smoke failed: ${url} returned HTTP ${status}`)
  }
  return {
    url,
    status,
  }
}

const redactAuth = (payload) => {
  if (!payload || typeof payload !== 'object') return payload
  const output = { ...payload }
  for (const key of ['idToken', 'refreshToken']) {
    if (key in output) output[key] = '[redacted]'
  }
  return output
}

const createAuthUser = async () => {
  const email = `${runId}@example.test`
  const password = 'Password123!'
  const response = await requestJson(`${authBaseUrl}/accounts:signUp?key=smoke-key`, {
    method: 'POST',
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })

  state.authUser = {
    email,
    password,
    localId: response.localId,
    idToken: response.idToken,
  }

  return {
    input: { email, password: '[redacted]', returnSecureToken: true },
    output: redactAuth(response),
  }
}

const loginAuthUser = async () => {
  const response = await requestJson(
    `${authBaseUrl}/accounts:signInWithPassword?key=smoke-key`,
    {
      method: 'POST',
      body: JSON.stringify({
        email: state.authUser.email,
        password: state.authUser.password,
        returnSecureToken: true,
      }),
    }
  )

  state.authUser.idToken = response.idToken

  return {
    input: {
      email: state.authUser.email,
      password: '[redacted]',
      returnSecureToken: true,
    },
    output: redactAuth(response),
  }
}

const deleteAuthUser = async () => {
  if (!state.authUser?.idToken) return null

  const response = await requestJson(`${authBaseUrl}/accounts:delete?key=smoke-key`, {
    method: 'POST',
    body: JSON.stringify({ idToken: state.authUser.idToken }),
  })

  const output = {
    input: { localId: state.authUser.localId, idToken: '[redacted]' },
    output: response,
  }
  state.authUser = null
  return output
}

const writeFirestoreDocument = async () => {
  const input = {
    fields: {
      runId: { stringValue: runId },
      service: { stringValue: 'firestore' },
      createdAt: { timestampValue: new Date().toISOString() },
      cleanupRequired: { booleanValue: true },
    },
  }

  const output = await requestJson(`${firestoreBaseUrl}/${smokeDocumentPath}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  state.firestoreDocumentCreated = true

  return {
    input: {
      path: smokeDocumentPath,
      fields: input.fields,
    },
    output: {
      name: output.name,
      updateTime: output.updateTime,
    },
  }
}

const readFirestoreDocument = async () => {
  const output = await requestJson(`${firestoreBaseUrl}/${smokeDocumentPath}`)

  return {
    input: { path: smokeDocumentPath },
    output: {
      name: output.name,
      runId: output.fields?.runId?.stringValue,
    },
  }
}

const deleteFirestoreDocument = async () => {
  if (!state.firestoreDocumentCreated) return null

  await requestJson(`${firestoreBaseUrl}/${smokeDocumentPath}`, {
    method: 'DELETE',
  })
  state.firestoreDocumentCreated = false

  return {
    input: { path: smokeDocumentPath },
    output: { deleted: true },
  }
}

const withStorageApp = async (name, worker) => {
  const app = initializeApp(
    {
      apiKey: 'smoke-api-key',
      projectId: options.projectId,
      storageBucket: options.storageBucket,
    },
    name
  )

  try {
    const auth = getAuth(app)
    connectAuthEmulator(auth, `http://${options.host}:${options.authPort}`, {
      disableWarnings: true,
    })
    await signInWithEmailAndPassword(
      auth,
      state.authUser.email,
      state.authUser.password
    )

    const storage = getStorage(app)
    connectStorageEmulator(storage, options.host, options.storagePort)

    return await worker(storage)
  } finally {
    await deleteApp(app)
  }
}

const uploadAndReadStorageObject = async () => {
  const objectPath = `emulator-dev/users/${state.authUser.localId}/${runId}.json`
  const payload = {
    runId,
    service: 'storage',
    userId: state.authUser.localId,
    cleanupRequired: true,
  }
  const body = JSON.stringify(payload)

  return withStorageApp(`${runId}-storage`, async (storage) => {
    const storageRef = ref(storage, objectPath)
    const upload = await uploadString(storageRef, body, 'raw', {
      contentType: 'application/json',
    })
    state.storageObjectPath = objectPath

    const bytes = await getBytes(storageRef)

    return {
      uploadInput: {
        path: objectPath,
        contentType: 'application/json',
        bytes: Buffer.byteLength(body),
      },
      uploadOutput: {
        fullPath: upload.ref.fullPath,
        bucket: upload.ref.bucket,
        contentType: upload.metadata.contentType,
        size: upload.metadata.size,
      },
      readOutput: {
        bytes: bytes.byteLength,
      },
    }
  })
}

const deleteStorageObject = async () => {
  if (!state.storageObjectPath || !state.authUser) return null

  return withStorageApp(`${runId}-storage-delete`, async (storage) => {
    await deleteObject(ref(storage, state.storageObjectPath))
    const output = {
      input: { path: state.storageObjectPath },
      output: { deleted: true },
    }
    state.storageObjectPath = null
    return output
  })
}

const cleanup = async () => {
  const cleanupResults = {}

  try {
    cleanupResults.storage = await deleteStorageObject()
  } catch (error) {
    cleanupResults.storageError = error instanceof Error ? error.message : String(error)
  }

  try {
    cleanupResults.firestore = await deleteFirestoreDocument()
  } catch (error) {
    cleanupResults.firestoreError =
      error instanceof Error ? error.message : String(error)
  }

  try {
    cleanupResults.auth = await deleteAuthUser()
  } catch (error) {
    cleanupResults.authError = error instanceof Error ? error.message : String(error)
  }

  return cleanupResults
}

const main = async () => {
  const startedAt = performance.now()

  const endpoints = {
    ui: await requireReachable('Firebase Emulator UI', `http://${options.host}:${options.uiPort}/`),
    authUi: await requireReachable(
      'Firebase Auth UI',
      `http://${options.host}:${options.uiPort}/auth`
    ),
    storageUi: await requireReachable(
      'Firebase Storage UI',
      `http://${options.host}:${options.uiPort}/storage`
    ),
    functionsRoot: await requireReachable(
      'Firebase Functions emulator',
      `http://${options.host}:${options.functionsPort}/`,
      [200, 404]
    ),
  }

  const authCreate = await createAuthUser()
  const authLogin = await loginAuthUser()
  const firestoreWrite = await writeFirestoreDocument()
  const firestoreRead = await readFirestoreDocument()
  const storage = await uploadAndReadStorageObject()
  const cleanupResults = await cleanup()

  const summary = {
    runId,
    projectId: options.projectId,
    emulatorEndpoints: endpoints,
    auth: {
      create: authCreate,
      login: authLogin,
      delete: cleanupResults.auth,
    },
    firestore: {
      write: firestoreWrite,
      read: firestoreRead,
      delete: cleanupResults.firestore,
    },
    storage: {
      upload: storage.uploadInput,
      uploadResult: storage.uploadOutput,
      read: storage.readOutput,
      delete: cleanupResults.storage,
    },
    durationMs: Math.round(performance.now() - startedAt),
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch(async (error) => {
  const cleanupResults = await cleanup()
  console.error(
    JSON.stringify(
      {
        runId,
        error: error instanceof Error ? error.message : String(error),
        cleanup: cleanupResults,
      },
      null,
      2
    )
  )
  process.exitCode = 1
})
