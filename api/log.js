import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'DELETE') {
    const { participant, date } = req.body
    if (!participant || !date) return res.status(400).json({ error: 'Missing fields' })
    await redis.hdel('weightlogs', `${participant}:${date}`)
    return res.json({ ok: true })
  }

  if (req.method !== 'POST') return res.status(405).end()

  const { participant, date, weight } = req.body
  if (!participant || !date || weight == null) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  // Check for new all-time low BEFORE saving (exclude same-date entry to handle overwrites)
  const allLogs = await redis.hgetall('weightlogs') || {}
  const priorWeights = Object.entries(allLogs)
    .filter(([k]) => k.startsWith(`${participant}:`) && k !== `${participant}:${date}`)
    .map(([, v]) => parseFloat(v))
  const isPR = priorWeights.length > 0 && weight < Math.min(...priorWeights)

  // Save the log
  await redis.hset('weightlogs', { [`${participant}:${date}`]: weight })

  // Persist PR record so the dashboard banner survives page reloads / other users
  if (isPR) {
    await redis.hset('prs', { [participant]: JSON.stringify({ weight, date, setAt: Date.now() }) })
  }

  res.json({ ok: true, isPR })
}
