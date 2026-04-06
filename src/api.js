const BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

export async function fetchLogs() {
  const res = await fetch(`${BASE}/api/logs`)
  if (!res.ok) throw new Error('Failed to fetch logs')
  return res.json()
}

export async function postLog(participant, date, weight) {
  const res = await fetch(`${BASE}/api/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participant, date, weight }),
  })
  if (!res.ok) throw new Error('Failed to save log')
  return res.json()
}

export async function deleteLog(participant, date) {
  const res = await fetch(`${BASE}/api/log`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participant, date }),
  })
  if (!res.ok) throw new Error('Failed to delete log')
  return res.json()
}
