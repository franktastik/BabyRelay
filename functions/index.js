const admin = require('firebase-admin')
const { FieldValue } = require('firebase-admin/firestore')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')

admin.initializeApp()

const db = admin.firestore()

const toMillis = (value) => {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  return new Date(value).getTime()
}

const previewForEvent = (eventId, event) => ({
  eventId,
  type: event.type || 'unknown',
  occurredAt: event.occurredAt || FieldValue.serverTimestamp(),
  createdBy: event.createdBy || '',
  metadataPreview: event.metadata || {},
})

const shouldReplaceSlot = (existingSlot, eventOccurredAtMs) => {
  if (!existingSlot) return true
  const existingSlotMs = toMillis(existingSlot.occurredAt)
  return !existingSlotMs || eventOccurredAtMs >= existingSlotMs
}

exports.maintainBabyLatestState = onDocumentCreated('careEvents/{eventId}', async (event) => {
  const snapshot = event.data
  if (!snapshot) return

  const careEvent = snapshot.data()
  if (careEvent.skipLatestStateSummary === true) return

  const babyId = careEvent.babyId
  if (!babyId) return

  const eventId = event.params.eventId
  const latestStateRef = db.collection('babyLatestStates').doc(babyId)

  await db.runTransaction(async (transaction) => {
    const latestStateSnapshot = await transaction.get(latestStateRef)
    const existing = latestStateSnapshot.exists ? latestStateSnapshot.data() || {} : {}
    const eventOccurredAtMs = toMillis(careEvent.occurredAt)
    const existingLastEventAtMs = toMillis(existing.lastEventAt)
    const eventPreview = previewForEvent(eventId, careEvent)

    const summary = {
      babyId,
      householdId: careEvent.householdId || existing.householdId || '',
      babyName: careEvent.babyName || existing.babyName || '',
      schemaVersion: 1,
      runId: careEvent.runId || existing.runId || '',
      eventCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (!existingLastEventAtMs || eventOccurredAtMs >= existingLastEventAtMs) {
      summary.lastEventId = eventId
      summary.lastEventAt = careEvent.occurredAt || FieldValue.serverTimestamp()
      summary.lastActionBy = careEvent.createdBy || ''
    }

    if (
      (careEvent.type === 'breastfeed' || careEvent.type === 'bottle') &&
      shouldReplaceSlot(existing.lastFeed, eventOccurredAtMs)
    ) {
      summary.lastFeed = eventPreview
    }
    if (careEvent.type === 'diaper' && shouldReplaceSlot(existing.lastDiaper, eventOccurredAtMs)) {
      summary.lastDiaper = eventPreview
    }
    if (careEvent.type === 'sleep' && shouldReplaceSlot(existing.lastSleep, eventOccurredAtMs)) {
      summary.lastSleep = eventPreview
    }
    if (
      careEvent.type === 'medication' &&
      shouldReplaceSlot(existing.lastMedication, eventOccurredAtMs)
    ) {
      summary.lastMedication = eventPreview
    }

    transaction.set(latestStateRef, summary, { merge: true })
  })
})
