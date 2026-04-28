import { dayOfCompetition, COMPETITION_DAYS, formatProjectedFinish, PARTICIPANTS, COMPETITORS } from '../utils/calculations'
import WeightChart from './WeightChart'
import PctLostChart from './PctLostChart'
import LbsLostChart from './LbsLostChart'
import RegressionChart from './RegressionChart'

const MEDALS = ['🥇', '🥈', '🥉']

function Verse({ reference, text }) {
  return (
    <div className="text-center px-4 py-1">
      <p className="text-xs text-slate-500 italic">"{text}"</p>
      <p className="text-xs text-slate-600 mt-0.5">{reference}</p>
    </div>
  )
}

function ProgressBar({ pct, color, target }) {
  const clamped = Math.min(1, Math.max(0, pct))
  const targetClamped = Math.min(1, Math.max(0, target))
  return (
    <div className="relative w-full bg-slate-800 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${clamped * 100}%`, backgroundColor: color }}
      />
      {/* Linear pace marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-white/60"
        style={{ left: `${targetClamped * 100}%` }}
      />
    </div>
  )
}

function StatCard({ stats, rank }) {
  const { participant: p, current, goal, lost, pctLost, remaining, pctToGoal, pace, projectedFinish, projectedEndWeight, weighIns } = stats
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

      {/* Goal progress bar — competitors only */}
      {!p.observer && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Goal progress</span>
            <span style={{ color: isGaining ? '#f87171' : p.color }}>
              {isGaining ? '▲' : '▼'} {Math.abs(pctLost * 100).toFixed(2)}% lost
            </span>
          </div>
          <ProgressBar pct={isGaining ? 0 : pctToGoal} color={p.color} target={linearTarget} />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{current?.toFixed(1)} lbs</span>
            <span>Goal: {goal?.toFixed(1)} lbs</span>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-800 rounded-xl p-2">
          <div className="text-xs text-slate-400">Lost</div>
          <div className={`font-bold text-sm ${isGaining ? 'text-red-400' : 'text-white'}`}>
            {isGaining ? '+' : ''}{Math.abs(lost).toFixed(1)} lbs
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-2">
          <div className="text-xs text-slate-400">{p.observer ? 'Current' : 'Remaining'}</div>
          <div className="font-bold text-sm">
            {p.observer ? `${current?.toFixed(1)} lbs` : remaining > 0 ? `${remaining.toFixed(1)} lbs` : '✓'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-2">
          <div className="text-xs text-slate-400">Weigh-ins</div>
          <div className="font-bold text-sm">{weighIns}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-2">
          <div className="text-xs text-slate-400">Pace</div>
          <div className="font-bold text-sm">{pace !== null ? `${pace.toFixed(2)}/day` : '—'}</div>
        </div>
        {!p.observer && <>
          <div className="bg-slate-800 rounded-xl p-2">
            <div className="text-xs text-slate-400">Goal by</div>
            <div className="font-bold text-sm">{formatProjectedFinish(projectedFinish)}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-2">
            <div className="text-xs text-slate-400">Jun 1 weight</div>
            <div className="font-bold text-sm">{projectedEndWeight !== null ? `${projectedEndWeight.toFixed(1)} lbs` : '—'}</div>
          </div>
        </>}
        {p.observer && <>
          <div className="bg-slate-800 rounded-xl p-2">
            <div className="text-xs text-slate-400">Jun 1 weight</div>
            <div className="font-bold text-sm">{projectedEndWeight !== null ? `${projectedEndWeight.toFixed(1)} lbs` : '—'}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-2">
            <div className="text-xs text-slate-400">% Change</div>
            <div className={`font-bold text-sm ${isGaining ? 'text-red-400' : 'text-emerald-400'}`}>
              {isGaining ? '+' : ''}{(pctLost * 100).toFixed(2)}%
            </div>
          </div>
        </>}
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
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-right px-2 py-2">Cur</th>
                <th className="text-right px-2 py-2">Goal</th>
                <th className="text-right px-2 py-2">Lost</th>
                <th className="text-right px-2 py-2">% Lost</th>
                <th className="text-right px-2 py-2">Prev</th>
                <th className="text-right px-3 py-2">Prev %</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s, i) => {
                const isGaining = s.lost < 0
                const prevLog = s.logs.length >= 2 ? s.logs[s.logs.length - 2] : null
                const prevDelta = prevLog ? s.current - prevLog.weight : null
                const prevPct = prevLog ? (prevLog.weight - s.current) / prevLog.weight * 100 : null
                const isFirstObserver = s.participant.observer && !ranked[i - 1]?.participant.observer
                return (
                  <>
                  {isFirstObserver && (
                    <tr key="divider">
                      <td colSpan={7} className="px-4 py-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-slate-800" />
                          <span className="text-xs text-slate-600 uppercase tracking-wider">Guest</span>
                          <div className="flex-1 h-px bg-slate-800" />
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr key={s.participant.id} className="border-t border-slate-800">
                    <td className="px-3 py-3 flex items-center gap-1">
                      <span>{s.participant.observer ? '👤' : (MEDALS[i] ?? `#${i + 1}`)}</span>
                      <span className="font-bold" style={{ color: s.participant.color }}>{s.participant.name[0]}</span>
                    </td>
                    <td className="text-right px-2 py-3 text-slate-300">{s.current?.toFixed(1)}</td>
                    <td className="text-right px-2 py-3 text-slate-400">{s.goal?.toFixed(1) ?? '—'}</td>
                    <td className={`text-right px-2 py-3 font-medium ${isGaining ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isGaining ? '+' : '-'}{Math.abs(s.lost).toFixed(1)}
                    </td>
                    <td className={`text-right px-2 py-3 font-bold ${isGaining ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isGaining ? '+' : ''}{(s.pctLost * 100).toFixed(2)}%
                    </td>
                    <td className={`text-right px-2 py-3 text-xs ${prevDelta === null ? 'text-slate-600' : prevDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {prevDelta === null ? '—' : `${prevDelta > 0 ? '+' : ''}${prevDelta.toFixed(1)}`}
                    </td>
                    <td className={`text-right px-3 py-3 text-xs ${prevPct === null ? 'text-slate-600' : prevPct < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {prevPct === null ? '—' : `${prevPct > 0 ? '+' : ''}${prevPct.toFixed(2)}%`}
                    </td>
                  </tr>
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {hasData && <Verse reference="Psalm 144:1" text="Praise be to the LORD my Rock, who trains my hands for war, my fingers for battle." />}

      {/* Weight trend chart */}
      {hasData && (
        <>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
            <h2 className="font-semibold text-sm text-slate-300 mb-4">Weight Over Time</h2>
            <WeightChart logs={logs} participants={PARTICIPANTS} />
          </div>
          <Verse reference="Ecclesiastes 4:9-10" text="Two are better than one... if either of them falls down, one can help the other up." />
        </>
      )}

      {/* Lbs lost chart */}
      {hasData && (
        <>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
            <h2 className="font-semibold text-sm text-slate-300 mb-4">Total Lbs Lost</h2>
            <LbsLostChart logs={logs} participants={PARTICIPANTS} />
          </div>
          <Verse reference="1 Thessalonians 5:11" text="Therefore encourage one another and build each other up." />
        </>
      )}

      {/* % Lost chart */}
      {hasData && (
        <>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
            <h2 className="font-semibold text-sm text-slate-300 mb-4">Cumulative % Lost</h2>
            <PctLostChart logs={logs} participants={PARTICIPANTS} />
          </div>
          <Verse reference="Colossians 3:23" text="Whatever you do, work at it with all your heart, as working for the Lord." />
        </>
      )}

      {/* Individual stat cards */}
      {hasData && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-slate-300">Individual Stats</h2>
          {ranked.map((stats, i) => {
            const isFirstObserver = stats.participant.observer && !ranked[i - 1]?.participant.observer
            return (
              <div key={stats.participant.id} className="flex flex-col gap-2">
                {isFirstObserver && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-xs text-slate-600 uppercase tracking-wider">Guest</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                )}
                <StatCard stats={stats} rank={i} />
                {stats.regressionData && (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                    <p className="text-xs text-slate-500 mb-3">21-day regression trend</p>
                    <RegressionChart
                      regressionData={stats.regressionData}
                      color={stats.participant.color}
                      goal={stats.goal}
                      startWeight={stats.effectiveStart}
                      observer={!!stats.participant.observer}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
