import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'
import { formatDate, COMPETITION_END } from '../utils/calculations'

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

  // Actual data points with labels
  const scatterData = pts.map((p, i) => ({
    x: p.x,
    y: p.y,
    weight: p.y,
    label: formatDate(windowLogs[i].date),
  }))

  // Regression line: from x=0 to end of competition
  const lineStart = { x: 0,      y: intercept }
  const lineEnd   = { x: endDayX, y: intercept + slope * endDayX }
  const regressionLine = [lineStart, lineEnd]

  // Y axis bounds
  const weights = pts.map(p => p.y)
  const projEnd = intercept + slope * endDayX
  const allY = [...weights, projEnd, goal]
  const minY = Math.floor(Math.min(...allY)) - 2
  const maxY = Math.ceil(Math.max(...allY)) + 2

  // Goal reference line x position
  const goalX = goal > projEnd
    ? null  // won't reach goal by end
    : (goal - intercept) / slope

  return (
    <ResponsiveContainer width="100%" height={180}>
      <ComposedChart margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="x"
          type="number"
          domain={[0, endDayX]}
          tickFormatter={x => {
            const d = new Date(originMs + x * 86400000)
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }}
          tick={{ fill: '#64748b', fontSize: 10 }}
          ticks={[0, Math.round(endDayX / 2), Math.round(endDayX)]}
        />
        <YAxis domain={[minY, maxY]} tick={{ fill: '#64748b', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />

        {/* Goal weight line */}
        <ReferenceLine y={goal} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5}
          label={{ value: 'Goal', fill: color, fontSize: 10, position: 'insideTopRight' }} />

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
