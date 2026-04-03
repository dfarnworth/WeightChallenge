export const COMPETITION_START = new Date('2026-04-01')
export const COMPETITION_END = new Date('2026-05-30')
export const COMPETITION_DAYS = 60

export const PARTICIPANTS = [
  { id: 'javin', name: 'Javin', startWeight: 214.2, goalPercent: 0.08, color: '#0ea5e9' },
  { id: 'dan',   name: 'Dan',   startWeight: 198.3, goalPercent: 0.08, color: '#a78bfa' },
  { id: 'paul',  name: 'Paul',  startWeight: 233.4, goalPercent: 0.08, color: '#34d399' },
]

export function goalWeight(p) {
  return p.startWeight * (1 - p.goalPercent)
}

export function dayOfCompetition() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(COMPETITION_START)
  start.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((today - start) / 86400000) + 1)
}

export function toDateStr(date) {
  return date.toISOString().split('T')[0]
}

export function todayStr() {
  return toDateStr(new Date())
}

/**
 * Build per-participant stats from a list of log entries.
 * logs: [{ participant, date (YYYY-MM-DD), weight }]
 */
export function computeStats(participant, logs) {
  const myLogs = logs
    .filter(l => l.participant === participant.id)
    .sort((a, b) => a.date.localeCompare(b.date))

  const weighIns = myLogs.length
  const current = weighIns > 0 ? myLogs[myLogs.length - 1].weight : participant.startWeight
  const goal = goalWeight(participant)
  const lost = participant.startWeight - current
  const pctLost = lost / participant.startWeight
  const remaining = current - goal
  const pctToGoal = weighIns > 0 ? lost / (participant.startWeight - goal) : 0

  // Pace: total lost divided by number of days elapsed since first log
  let pace = null
  let projectedDaysLeft = null
  if (weighIns >= 2) {
    const firstDate = new Date(myLogs[0].date)
    const lastDate = new Date(myLogs[myLogs.length - 1].date)
    const daysSinceFirst = Math.max(1, (lastDate - firstDate) / 86400000)
    pace = lost / daysSinceFirst
    if (pace > 0) {
      projectedDaysLeft = remaining / pace
    }
  }

  let projectedFinish = null
  if (projectedDaysLeft !== null && weighIns >= 2) {
    const lastLogDate = new Date(myLogs[myLogs.length - 1].date)
    projectedFinish = new Date(lastLogDate.getTime() + projectedDaysLeft * 86400000)
  }

  return {
    participant,
    weighIns,
    current,
    goal,
    lost,
    pctLost,
    remaining,
    pctToGoal,
    pace,
    projectedFinish,
    logs: myLogs,
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatProjectedFinish(date) {
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function rankParticipants(allStats) {
  return [...allStats].sort((a, b) => b.pctLost - a.pctLost)
}
