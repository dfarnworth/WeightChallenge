import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const raw = await redis.hgetall('prs') || {}
  const prs = Object.entries(raw).map(([participant, val]) => {
    const data = typeof val === 'string' ? JSON.parse(val) : val
    return { participant, ...data }
  })
  res.json(prs)
}
