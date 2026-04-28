import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { formatDate, COMPETITION_END, COMPETITION_START } from '../utils/calculations'

const CustomTooltip = ({ active, payload, startWeight, goal, chartOriginMs, totalDays }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d || d.weight == null) return null
  const paceWeight = startWeight + (goal - startWeight) * (d.x / totalDays)
  const diff = d.weight - paceWeight
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      {d.label && <p className="text-slate-400 mb-1">{d.label}</p>}
      <p className="font-semibold text-white">Actual: {d.weight.toFixed(1)} lbs</p>
      {goal != null && (
        <>
          <p className="text-slate-400">Target: {paceWeight.toFixed(1)} lbs</p>
          <p className={`font-semibold mt-0.5 ${diff <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {diff <= 0 ? '▼' : '▲'} {Math.abs(diff).toFixed(1)} lbs {diff <= 0 ? 'ahead' : 'behind'}
          </p>
        </>
      )}
    </div>
  )
}

export default function RegressionChart({ regressionData, color, goal, startWeight, observer }) {
  if (!regressionData) return null

  const { pts, slope, intercept, originMs, windowLogs } = regressionData

  // Chart bounds: competition participants use Apr 1→Jun 1; observers use first log→ +3 months
  let chartOriginMs, totalDays
  if (observer) {
    const firstLogMs = new Date(windowLogs[0].date).getTime()
    const threeMonthsOut = new Date()
    threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3)
    chartOriginMs = firstLogMs
    totalDays = (threeMonthsOut.getTime() - firstLogMs) / 86400000
  } else {
    chartOriginMs = COMPETITION_START.getTime()
    totalDays = (COMPETITION_END.getTime() - chartOriginMs) / 86400000
  }

  // Actual data points — x relative to chartOrigin
  const scatterData = pts.map((p, i) => ({
    x: (new Date(windowLogs[i].date).getTime() - chartOriginMs) / 86400000,
    y: p.y,
    weight: p.y,
    label: formatDate(windowLogs[i].date),
  }))

  // Regression line across full chart range
  const regOffsetDays = (originMs - chartOriginMs) / 86400000
  const regressionLine = [
    { x: 0,         y: intercept + slope * (0 - regOffsetDays) },
    { x: totalDays, y: intercept + slope * (totalDays - regOffsetDays) },
  ]

  // Pace-to-goal line: from chart start (startWeight) to goal at chart end
  const paceToGoalLine = goal != null ? [
    { x: 0,         y: startWeight },
    { x: totalDays, y: goal },
  ] : null

  // Y axis bounds
  const weights = pts.map(p => p.y)
  const projEnd = intercept + slope * (totalDays - regOffsetDays)
  const allY = [...weights, projEnd, ...(goal != null ? [goal] : []), startWeight].filter(Boolean)
  const minY = Math.floor(Math.min(...allY)) - 2
  const maxY = Math.ceil(Math.max(...allY)) + 2

  // X axis ticks
  const ticks = observer
    ? [0, Math.round(totalDays / 3), Math.round(totalDays * 2 / 3), Math.round(totalDays)]
    : [0, Math.round(totalDays / 3), Math.round(totalDays * 2 / 3), Math.round(totalDays)]

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

        {/* Goal weight reference line */}
        {goal != null && (
          <ReferenceLine y={goal} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5}
            label={{ value: 'Goal', fill: color, fontSize: 10, position: 'insideTopRight' }} />
        )}

        {/* Pace-to-goal line */}
        {paceToGoalLine && (
          <Line
            data={paceToGoalLine}
            dataKey="y"
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
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
          strokeDasharray="none"
          legendType="line"
        />

        {/* Actual weigh-ins */}
        <Scatter
          data={scatterData}
          dataKey="y"
          fill={color}
          r={4}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
