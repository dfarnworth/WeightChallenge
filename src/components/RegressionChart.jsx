import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { formatDate, COMPETITION_END, COMPETITION_START } from '../utils/calculations'

const CustomTooltip = ({ active, payload, startWeight, goal, chartOriginMs, totalDays }) => {
  if (!active || !payload?.length) return null

  // x comes from whichever series is hovered (pace line or scatter dot)
  const firstPayload = payload[0]?.payload
  if (firstPayload == null) return null
  const x = firstPayload.x
  if (x == null) return null

  // Build date label from x if not already on the payload
  const label = firstPayload.label ??
    new Date(chartOriginMs + x * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  // Actual weigh-in data comes from the scatter series (has a weight field)
  const actual = payload.find(p => p.payload?.weight != null)?.payload?.weight ?? null

  // Linear pace-to-goal target at this x
  const paceWeight = goal != null ? startWeight + (goal - startWeight) * (x / totalDays) : null

  if (actual == null && paceWeight == null) return null

  const diff = actual != null && paceWeight != null ? actual - paceWeight : null
  const isFuture = actual == null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}{isFuture ? ' · projected' : ''}</p>
      {actual != null && <p className="font-semibold text-white">Actual: {actual.toFixed(1)} lbs</p>}
      {paceWeight != null && (
        <p className={isFuture ? 'font-semibold text-white' : 'text-slate-400'}>
          Target: {paceWeight.toFixed(1)} lbs
        </p>
      )}
      {diff != null && (
        <p className={`font-semibold mt-0.5 ${diff <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {diff <= 0 ? '▼' : '▲'} {Math.abs(diff).toFixed(1)} lbs {diff <= 0 ? 'ahead' : 'behind'}
        </p>
      )}
    </div>
  )
}

export default function RegressionChart({ regressionData, color, goal, startWeight, observer, projectedFinish }) {
  if (!regressionData) return null

  const { pts, slope, intercept, originMs, windowLogs, allLogs } = regressionData

  // Chart bounds: competition participants use Apr 1→Jun 1; observers use first log→ +3 months
  let chartOriginMs, totalDays
  if (observer) {
    const firstLogMs = new Date((allLogs ?? windowLogs)[0].date).getTime()
    const threeMonthsOut = new Date()
    threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3)
    chartOriginMs = firstLogMs
    totalDays = (threeMonthsOut.getTime() - firstLogMs) / 86400000
  } else {
    chartOriginMs = COMPETITION_START.getTime()
    totalDays = (COMPETITION_END.getTime() - chartOriginMs) / 86400000
  }

  // Scatter data — older points (dimmed) vs 21-day window points (full color)
  const windowDateSet = new Set(windowLogs.map(l => l.date))
  const toPoint = l => ({
    x: (new Date(l.date).getTime() - chartOriginMs) / 86400000,
    y: l.weight,
    weight: l.weight,
    label: formatDate(l.date),
  })
  const historicalScatter = (allLogs ?? windowLogs).filter(l => !windowDateSet.has(l.date)).map(toPoint)
  const windowScatter     = windowLogs.map(toPoint)

  // Regression line — 2 points is enough (no tooltip needed on it)
  const regOffsetDays = (originMs - chartOriginMs) / 86400000
  const regressionLine = [
    { x: 0,         y: intercept + slope * (0 - regOffsetDays) },
    { x: totalDays, y: intercept + slope * (totalDays - regOffsetDays) },
  ]

  // Pace-to-goal line — one point per day so every date is hoverable
  const days = Math.ceil(totalDays)
  const paceToGoalLine = goal != null
    ? Array.from({ length: days + 1 }, (_, i) => ({
        x: i,
        y: parseFloat((startWeight + (goal - startWeight) * (i / totalDays)).toFixed(1)),
        label: new Date(chartOriginMs + i * 86400000)
          .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
    : null

  // Y axis bounds — cover all logs + projections
  const allWeights = (allLogs ?? windowLogs).map(l => l.weight)
  const projEnd = intercept + slope * (totalDays - regOffsetDays)
  const allY = [...allWeights, projEnd, ...(goal != null ? [goal] : []), startWeight].filter(Boolean)
  const minY = Math.floor(Math.min(...allY)) - 2
  const maxY = Math.ceil(Math.max(...allY)) + 2

  // Projected goal date — x position on chart (null if outside range or not available)
  const projectedFinishX = projectedFinish
    ? (projectedFinish.getTime() - chartOriginMs) / 86400000
    : null
  const showProjectedLine = projectedFinishX != null && projectedFinishX > 0 && projectedFinishX <= totalDays
  const projectedLabel = projectedFinish
    ? projectedFinish.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  // X axis ticks
  const ticks = [0, Math.round(totalDays / 3), Math.round(totalDays * 2 / 3), Math.round(totalDays)]

  return (
    <ResponsiveContainer width="100%" height={180}>
      <ComposedChart margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="x"
          type="number"
          domain={[0, totalDays]}
          tickFormatter={x => {
            const d = new Date(chartOriginMs + x * 86400000)
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }}
          tick={{ fill: '#64748b', fontSize: 10 }}
          ticks={ticks}
        />
        <YAxis domain={[minY, maxY]} tick={{ fill: '#64748b', fontSize: 10 }} />
        <Tooltip content={
          <CustomTooltip
            startWeight={startWeight}
            goal={goal}
            chartOriginMs={chartOriginMs}
            totalDays={totalDays}
          />
        } />

        {/* Horizontal goal weight line */}
        {goal != null && (
          <ReferenceLine y={goal} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5}
            label={{ value: 'Goal', fill: color, fontSize: 10, position: 'insideTopRight' }} />
        )}

        {/* Vertical projected goal date — where regression trend hits goal weight */}
        {showProjectedLine && (
          <ReferenceLine
            x={projectedFinishX}
            stroke={color}
            strokeDasharray="3 3"
            strokeOpacity={0.7}
            label={{
              value: `🎯 ${projectedLabel}`,
              fill: color,
              fontSize: 9,
              position: 'insideTopLeft',
            }}
          />
        )}

        {/* Pace-to-goal line — daily points make every date hoverable */}
        {paceToGoalLine && (
          <Line
            data={paceToGoalLine}
            dataKey="y"
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }}
            legendType="none"
          />
        )}

        {/* Regression trend line */}
        <Line
          data={regressionLine}
          dataKey="y"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={false}
          strokeDasharray="none"
          legendType="line"
        />

        {/* Older weigh-ins (outside 21-day window) — dimmed */}
        {historicalScatter.length > 0 && (
          <Scatter
            data={historicalScatter}
            dataKey="y"
            fill={color}
            fillOpacity={0.3}
            r={3}
          />
        )}

        {/* 21-day window weigh-ins — full color, driving the regression */}
        <Scatter
          data={windowScatter}
          dataKey="y"
          fill={color}
          r={4}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
