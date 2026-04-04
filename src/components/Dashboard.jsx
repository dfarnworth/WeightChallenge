import { dayOfCompetition, COMPETITION_DAYS, formatProjectedFinish, PARTICIPANTS } from '../utils/calculations'
import WeightChart from './WeightChart'
import PctLostChart from './PctLostChart'
import LbsLostChart from './LbsLostChart'

const MEDALS = ['🥇', '🥈', '🥉']

function ProgressBar({ pct, color, target, goalMarker }) {
  const clamped = Math.min(1, Math.max(0, pct))
  const targetClamped = Math.min(1, Math.max(0, target))
  const goalClamped = Math.min(1, Math.max(0, goalMarker))
  return (
    <div className="relative w-full bg-slate-800 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${clamped * 100}%`, backgroundColor: color }}
      />
      {/* 8% goal marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
        style={{ left: `${goalClamped * 100}%`, backgroundColor: color, opacity: 0.9 }}
        title="8% goal"
      />
      {/* Linear pace marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-white/60"
        style={{ left: `${targetClamped * 100}%` }}
        title="On-pace target"
      />
    </div>
  )
}

function StatCard({ stats, rank }) {
  const { participant: p, current, goal, lost, pctLost, remaining, pctToGoal, pctToStretch, goalMarkerPct, pace, projectedFinish, weighIns } = stats
  const isGaining = lost < 0
  const linearTarget = dayOfCompetition() / COMPETITION_DAYS

  return (
    <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900">
      {/* Name + rank */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: p.color + '33', color: p.color }}
          >
            {p.name[0]}
          </span>
          <span className="font-semibold">{p.name}</span>
        </div>
        <span className="text-xl">{MEDALS[rank] ?? `#${rank + 1}`}</span>
      </div>

      {/* Goal progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Goal progress</span>
          <span style={{ color: isGaining ? '#f87171' : p.color }}>
            {isGaining ? '▲' : '▼'} {Math.abs(pctLost * 100).toFixed(2)}% lost
          </span>
        </div>
        <ProgressBar pct={isGaining ? 0 : pctToStretch} color={p.color} target={linearTarget} goalMarker={goalMarkerPct} />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{current.toFixed(1)} lbs</span>
          <span>Stretch: {p.stretchWeight} lbs</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-800 rounded-xl p-2">
          <div className="text-xs text-slate-400">Lost</div>
          <div className={`font-bold text-sm ${isGaining ? 'text-red-400' : 'text-white'}`}>
            {isGaining ? '+' : ''}{Math.abs(lost).toFixed(1)} lbs
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-2">
          <div className="text-xs text-slate-400">Remaining</div>
          <div className="font-bold text-sm">{remaining > 0 ? remaining.toFixed(1) : '✓'} {remaining > 0 ? 'lbs' : ''}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-2">
          <div className="text-xs text-slate-400">Weigh-ins</div>
          <div className="font-bold text-sm">{weighIns}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-2">
          <div className="text-xs text-slate-400">Pace</div>
          <div className="font-bold text-sm">{pace !== null ? `${pace.toFixed(2)}/day` : '—'}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-2 col-span-2">
          <div className="text-xs text-slate-400">Proj. finish</div>
          <div className="font-bold text-sm">{formatProjectedFinish(projectedFinish)}</div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ ranked, allStats, logs, activeUser, onSeed, seeded }) {
  const day = dayOfCompetition()
  const hasData = logs.length > 0

  return (
    <div className="px-4 py-4 flex flex-col gap-6">
      {/* Competition progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Competition progress</span>
          <span>Day {day} / {COMPETITION_DAYS}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-sky-500 transition-all"
            style={{ width: `${Math.min(100, (day / COMPETITION_DAYS) * 100)}%` }}
          />
        </div>
      </div>

      {/* Seed button (only shown if no data yet) */}
      {!hasData && !seeded && (
        <div className="bg-amber-950 border border-amber-800 rounded-xl p-4 text-center">
          <p className="text-amber-300 text-sm mb-3">No data yet. Import the starting data from the Excel file?</p>
          <button
            onClick={onSeed}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Import Starting Data
          </button>
        </div>
      )}

      {/* Standings table */}
      {hasData && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="font-semibold text-sm text-slate-300">Standings</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase">
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-right px-4 py-2">Current</th>
                <th className="text-right px-4 py-2">Lost</th>
                <th className="text-right px-4 py-2">% Lost</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s, i) => {
                const isGaining = s.lost < 0
                return (
                  <tr key={s.participant.id} className="border-t border-slate-800">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span>{MEDALS[i] ?? `#${i + 1}`}</span>
                      <span className="font-medium" style={{ color: s.participant.color }}>{s.participant.name}</span>
                    </td>
                    <td className="text-right px-4 py-3 text-slate-300">{s.current.toFixed(1)}</td>
                    <td className={`text-right px-4 py-3 font-medium ${isGaining ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isGaining ? '+' : '-'}{Math.abs(s.lost).toFixed(1)}
                    </td>
                    <td className={`text-right px-4 py-3 font-bold ${isGaining ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isGaining ? '+' : ''}{(s.pctLost * 100).toFixed(2)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Weight trend chart */}
      {hasData && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
          <h2 className="font-semibold text-sm text-slate-300 mb-4">Weight Over Time</h2>
          <WeightChart logs={logs} participants={PARTICIPANTS} />
        </div>
      )}

      {/* Lbs lost chart */}
      {hasData && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
          <h2 className="font-semibold text-sm text-slate-300 mb-4">Total Lbs Lost</h2>
          <LbsLostChart logs={logs} participants={PARTICIPANTS} />
        </div>
      )}

      {/* % Lost chart */}
      {hasData && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
          <h2 className="font-semibold text-sm text-slate-300 mb-4">Cumulative % Lost</h2>
          <PctLostChart logs={logs} participants={PARTICIPANTS} />
        </div>
      )}

      {/* Individual stat cards */}
      {hasData && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-slate-300">Individual Stats</h2>
          {ranked.map((stats, i) => (
            <StatCard key={stats.participant.id} stats={stats} rank={i} />
          ))}
        </div>
      )}
    </div>
  )
}
