import { useState } from 'react'
import { formatDate } from '../utils/calculations'
import { deleteLog, postLog } from '../api'

export default function LogWeight({ participant, stats, onLog, onRefresh, todayStr }) {
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(todayStr)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingDate, setEditingDate] = useState(null)
  const [editWeight, setEditWeight] = useState('')
  const [deletingDate, setDeletingDate] = useState(null)

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

  async function handleEditSave(log) {
    if (!editWeight || isNaN(parseFloat(editWeight))) return
    await postLog(participant.id, log.date, parseFloat(editWeight))
    await onLog(participant.id, log.date, parseFloat(editWeight))
    setEditingDate(null)
    setEditWeight('')
  }

  async function handleDelete(log) {
    setDeletingDate(log.date)
    await deleteLog(participant.id, log.date)
    await onRefresh()
    setDeletingDate(null)
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
              const isEditing = editingDate === log.date
              const isDeleting = deletingDate === log.date

              return (
                <div key={log.date} className="px-4 py-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm w-16 shrink-0">{formatDate(log.date)}</span>
                      <input
                        type="number"
                        step="0.1"
                        value={editWeight}
                        onChange={e => setEditWeight(e.target.value)}
                        className="flex-1 bg-slate-800 border border-sky-500 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                        inputMode="decimal"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSave(log)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingDate(null); setEditWeight('') }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">{formatDate(log.date)}</span>
                      <div className="flex items-center gap-3">
                        {delta !== null && (
                          <span className={`text-xs font-medium ${delta > 0 ? 'text-red-400' : delta < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                          </span>
                        )}
                        <span className="font-bold">{log.weight.toFixed(1)} lbs</span>
                        <button
                          onClick={() => { setEditingDate(log.date); setEditWeight(log.weight.toString()) }}
                          className="text-slate-500 hover:text-sky-400 transition-colors p-1"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(log)}
                          disabled={isDeleting}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
