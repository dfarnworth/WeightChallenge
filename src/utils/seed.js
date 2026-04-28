import { postLog } from '../api'

const INITIAL_DATA = [
  { participant: 'javin', date: '2026-04-01', weight: 214.2 },
  { participant: 'dan',   date: '2026-04-01', weight: 198.3 },
  { participant: 'paul',  date: '2026-04-01', weight: 233.4 },
  { participant: 'javin', date: '2026-04-02', weight: 213.6 },
  { participant: 'dan',   date: '2026-04-02', weight: 196.5 },
  { participant: 'paul',  date: '2026-04-02', weight: 234.8 },
  { participant: 'javin', date: '2026-04-03', weight: 210.8 },
  { participant: 'dan',   date: '2026-04-03', weight: 196.2 },
  { participant: 'josh',  date: '2026-04-27', weight: 210 },
]

export async function seedInitialData() {
  for (const entry of INITIAL_DATA) {
    await postLog(entry.participant, entry.date, entry.weight)
  }
  return { added: INITIAL_DATA.length }
}
