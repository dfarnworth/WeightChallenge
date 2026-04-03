import { useState } from 'react'
import { formatDate } from '../utils/calculations'

export default function LogWeight({ participant, stats, onLog, todayStr }) {
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(todayStr)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const todayEntry = stats?.logs?.find(l => l.date === date)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!weight || isNaN(parseFloat(weight))) return
    setSaving(true)
    await onLog(participant.id, date, parseFloat(weight))
    setSaving(false)
    setSaved(true)
    setWeight('')
    setTimeout(() => setSaved(false), 2500)
  }

  const sortedLogs = [...(stats?.logs ?? [])].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="px-4 py-4 flex flex-col gap-6">
      {/* Log form */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: participant.color + '33', color: participant.color }}
          >
            {participant.name[0]}
          </span>
          <h2 className="font-semibold">Log Weight — {participant.name}</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setSaved(false) }}
              min="2026-04-01"
              max="2026-05-30"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Weight (lbs)
              {todayEntry && <span className="text-amber-400 ml-2">· Currently logged: {todayEntry.weight} lbs (will overwrite)</span>}
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={todayEntry ? todayEntry.weight.toString() : 'e.g. 195.4'}
              value={weight}
              onChange={e => { setWeight(e.target.value); setSaved(false) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-2xl font-bold focus:outline-none focus:border-sky-500"
              inputMode="decimal"
            />
          </div>

          <button
            type="submit"
            disabled={!weight || saving}
            className="w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: saved ? '#34d399' : participant.color }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Log Weight'}
          </button>
        </form>
      </div>

      {/* History */}
      {sortedLogs.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="font-semibold text-sm text-slate-300">My Weigh-in History</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {sortedLogs.map((log, i) => {
              const prev = sortedLogs[i + 1]
              const delta = prev ? log.weight - prev.weight : null
              return (
                <div key={log.id ?? log.date} className="flex items-center justify-between px-4 py-3">
                  <span className="text-slate-400 text-sm">{formatDate(log.date)}</span>
                  <div className="flex items-center gap-3">
                    {delta !== null && (
                      <span className={`text-xs font-medium ${delta > 0 ? 'text-red-400' : delta < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </span>
                    )}
                    <span className="font-bold">{log.weight.toFixed(1)} lbs</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
