import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const data = await redis.hgetall('weightlogs')
  if (!data) return res.json([])

  const logs = Object.entries(data).map(([key, weight]) => {
    const [participant, date] = key.split(':')
    return { participant, date, weight: parseFloat(weight) }
  })

  res.json(logs)
}
