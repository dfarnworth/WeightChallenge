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

  await redis.hset('weightlogs', { [`${participant}:${date}`]: weight })
  res.json({ ok: true })
}
