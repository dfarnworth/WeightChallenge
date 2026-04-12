import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'
import { formatDate, COMPETITION_END, COMPETITION_START } from '../utils/calculations'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      {d.label && <p className="text-slate-400 mb-0.5">{d.label}</p>}
      <p className="font-semibold text-white">{d.weight?.toFixed(1) ?? d.y?.toFixed(1)} lbs</p>
    </div>
  )
}

export default function RegressionChart({ regressionData, color, goal, startWeight }) {
  if (!regressionData) return null

  const { pts, slope, intercept, originMs, endDayX, windowLogs } = regressionData

  // Use Apr 1 as x=0 for the chart
  const chartOriginMs = COMPETITION_START.getTime()
  const totalDays = (COMPETITION_END.getTime() - chartOriginMs) / 86400000

  // Actual data points with labels — x relative to Apr 1
  const scatterData = pts.map((p, i) => ({
    x: (new Date(windowLogs[i].date).getTime() - chartOriginMs) / 86400000,
    y: p.y,
    weight: p.y,
    label: formatDate(windowLogs[i].date),
  }))

  // Regression line extended across full competition (x relative to Apr 1)
  // regression was fit with originMs as x=0, so convert back
  const regOffsetDays = (originMs - chartOriginMs) / 86400000
  const regLineStart = { x: 0,          y: intercept + slope * (0 - regOffsetDays) }
  const regLineEnd   = { x: totalDays,   y: intercept + slope * (totalDays - regOffsetDays) }
  const regressionLine = [regLineStart, regLineEnd]

  // Pace-to-goal line: from Apr 1 starting weight to goal at Jun 1
  const paceToGoalLine = [
    { x: 0,          y: startWeight },
    { x: totalDays,  y: goal },
  ]

  // Y axis bounds
  const weights = pts.map(p => p.y)
  const projEnd = intercept + slope * (totalDays - regOffsetDays)
  const allY = [...weights, projEnd, goal, startWeight]
  const minY = Math.floor(Math.min(...allY)) - 2
  const maxY = Math.ceil(Math.max(...allY)) + 2

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
          ticks={[0, Math.round(totalDays / 3), Math.round(totalDays * 2 / 3), Math.round(totalDays)]}
        />
        <YAxis domain={[minY, maxY]} tick={{ fill: '#64748b', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />

        {/* Goal weight line */}
        <ReferenceLine y={goal} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5}
          label={{ value: 'Goal', fill: color, fontSize: 10, position: 'insideTopRight' }} />

        {/* Pace-to-goal line */}
        <Line
          data={paceToGoalLine}
          dataKey="y"
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          legendType="none"
          name="Pace to goal"
        />

        {/* Regression trend line */}
        <Line
          data={regressionLine}
          dataKey="y"
          stroke={color}
          strokeWidth={2}
          dot={false}
          strokeDasharray="none"
          legendType="line"
          name="Trend"
        />

        {/* Actual weigh-ins */}
        <Scatter
          data={scatterData}
          dataKey="y"
          fill={color}
          name="Weigh-ins"
          r={4}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
