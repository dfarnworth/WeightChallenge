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

  // Pace: linear regression over rolling 21-day window, requires 7+ weigh-ins
  const ROLLING_DAYS = 21
  const MIN_WEIGH_INS = 7
  let pace = null
  let projectedFinish = null
  let projectedEndWeight = null

  if (weighIns >= MIN_WEIGH_INS) {
    const windowLast = new Date(myLogs[myLogs.length - 1].date)
    const cutoff = new Date(windowLast)
    cutoff.setDate(cutoff.getDate() - ROLLING_DAYS)
    const windowLogs = myLogs.filter(l => new Date(l.date) >= cutoff)

    // Least-squares linear regression: x = days elapsed, y = weight
    const origin = new Date(windowLogs[0].date).getTime()
    const pts = windowLogs.map(l => ({
      x: (new Date(l.date).getTime() - origin) / 86400000,
      y: l.weight,
    }))
    const n = pts.length
    const sumX  = pts.reduce((s, p) => s + p.x, 0)
    const sumY  = pts.reduce((s, p) => s + p.y, 0)
    const sumXY = pts.reduce((s, p) => s + p.x * p.y, 0)
    const sumX2 = pts.reduce((s, p) => s + p.x * p.x, 0)
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    pace = -slope  // negative slope = losing weight = positive pace

    // Projected weight at end of competition (June 1) — works for gain or loss
    const daysToEnd = Math.max(0, (COMPETITION_END - windowLast) / 86400000)
    projectedEndWeight = parseFloat((current - pace * daysToEnd).toFixed(1))

    // Projected date of hitting goal (only meaningful if actively losing)
    if (pace > 0 && remaining > 0) {
      const daysLeft = remaining / pace
      projectedFinish = new Date(windowLast.getTime() + daysLeft * 86400000)
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
