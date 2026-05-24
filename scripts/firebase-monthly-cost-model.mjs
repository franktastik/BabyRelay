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

const readNumberArg = (name, fallback) => {
  const value = Number(readArg(name, String(fallback)))
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`--${name} must be a non-negative number`)
  }
  return value
}

const model = {
  users: readNumberArg('users', 10_000),
  householdSize: readNumberArg('householdSize', 2),
  daysPerMonth: readNumberArg('daysPerMonth', 30),
  appOpensPerUserPerDay: readNumberArg('appOpensPerUserPerDay', 6),
  homeReadsPerOpen: readNumberArg('homeReadsPerOpen', 6),
  handoffViewsPerUserPerDay: readNumberArg('handoffViewsPerUserPerDay', 2),
  handoffReadsPerView: readNumberArg('handoffReadsPerView', 6),
  timelineViewsPerUserPerDay: readNumberArg('timelineViewsPerUserPerDay', 1),
  timelineReadsPerView: readNumberArg('timelineReadsPerView', 20),
  remindersReadsPerUserPerDay: readNumberArg('remindersReadsPerUserPerDay', 4),
  featureFlagReadsPerUserPerDay: readNumberArg('featureFlagReadsPerUserPerDay', 1),
  careEventsPerHouseholdPerDay: readNumberArg('careEventsPerHouseholdPerDay', 14),
  writesPerCareEvent: readNumberArg('writesPerCareEvent', 2),
  reminderWritesPerHouseholdPerDay: readNumberArg('reminderWritesPerHouseholdPerDay', 0.2),
  widgetRefreshesPerUserPerDay: readNumberArg('widgetRefreshesPerUserPerDay', 8),
  widgetReadsPerRefresh: readNumberArg('widgetReadsPerRefresh', 1),
  notificationWritesPerHouseholdPerDay: readNumberArg('notificationWritesPerHouseholdPerDay', 1),
  monthlyDeleteRatePerHousehold: readNumberArg('monthlyDeleteRatePerHousehold', 2),
}

const households = model.users / model.householdSize

const monthlyReads =
  model.users *
  model.daysPerMonth *
  (model.appOpensPerUserPerDay * model.homeReadsPerOpen +
    model.handoffViewsPerUserPerDay * model.handoffReadsPerView +
    model.timelineViewsPerUserPerDay * model.timelineReadsPerView +
    model.remindersReadsPerUserPerDay +
    model.featureFlagReadsPerUserPerDay +
    model.widgetRefreshesPerUserPerDay * model.widgetReadsPerRefresh)

const monthlyWrites =
  households *
  model.daysPerMonth *
  (model.careEventsPerHouseholdPerDay * model.writesPerCareEvent +
    model.reminderWritesPerHouseholdPerDay +
    model.notificationWritesPerHouseholdPerDay)

const monthlyDeletes = households * model.monthlyDeleteRatePerHousehold

const cost = {
  readsUsd: (monthlyReads / 100_000) * DEFAULT_RATES.readsPer100kUsd,
  writesUsd: (monthlyWrites / 100_000) * DEFAULT_RATES.writesPer100kUsd,
  deletesUsd: (monthlyDeletes / 100_000) * DEFAULT_RATES.deletesPer100kUsd,
}

const sensitivity = {
  oneExtraReadPerUserPerDayUsd:
    ((model.users * model.daysPerMonth) / 100_000) * DEFAULT_RATES.readsPer100kUsd,
  oneExtraWritePerHouseholdPerDayUsd:
    ((households * model.daysPerMonth) / 100_000) * DEFAULT_RATES.writesPer100kUsd,
  oneExtraWidgetRefreshPerUserPerDayUsd:
    ((model.users * model.daysPerMonth * model.widgetReadsPerRefresh) / 100_000) *
    DEFAULT_RATES.readsPer100kUsd,
}

console.log(
  JSON.stringify(
    {
      model,
      derived: {
        households,
        monthlyReads,
        monthlyWrites,
        monthlyDeletes,
      },
      estimatedFirestoreOperationCostUsd: {
        ...cost,
        totalUsd: cost.readsUsd + cost.writesUsd + cost.deletesUsd,
        note:
          'Operation-only estimate using default US-style Firestore operation rates. Confirm current region-specific Firebase prices before production budgeting.',
      },
      sensitivity,
      excludedFromEstimate: [
        'Firestore storage and index storage',
        'network egress',
        'Firebase Auth',
        'Cloud Functions invocations and compute',
        'Cloud Messaging and notification provider costs',
        'logs, monitoring, backups, PITR, and TTL costs',
        'App Store and Play Store fees',
      ],
    },
    null,
    2
  )
)
