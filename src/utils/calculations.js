export const COMPETITION_START = new Date('2026-04-01')
export const COMPETITION_END = new Date('2026-06-01')
export const COMPETITION_DAYS = 62

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
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' })
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

  // Pace: 7-day rolling average (last 7 logs), requires 7+ weigh-ins
  const PACE_WINDOW = 7
  const MIN_WEIGH_INS = 7
  let pace = null
  let projectedFinish = null
  let projectedEndWeight = null

  if (weighIns >= MIN_WEIGH_INS) {
    const window = myLogs.slice(-PACE_WINDOW)
    const windowFirst = new Date(window[0].date)
    const windowLast = new Date(window[window.length - 1].date)
    const windowDays = Math.max(1, (windowLast - windowFirst) / 86400000)
    const windowLost = window[0].weight - window[window.length - 1].weight
    pace = windowLost / windowDays

    if (pace > 0) {
      // Projected date of hitting goal
      if (remaining > 0) {
        const daysLeft = remaining / pace
        projectedFinish = new Date(windowLast.getTime() + daysLeft * 86400000)
      }

      // Projected weight at end of competition (June 1)
      const daysToEnd = Math.max(0, (COMPETITION_END - windowLast) / 86400000)
      projectedEndWeight = Math.max(0, current - pace * daysToEnd)
    }
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
    projectedEndWeight,
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
