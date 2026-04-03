import { PARTICIPANTS, dayOfCompetition, COMPETITION_DAYS } from '../utils/calculations'

export default function NameSelector({ onSelect }) {
  const day = dayOfCompetition()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-3xl font-bold">Weight Loss Challenge</h1>
        <p className="text-slate-400 mt-2">April 1 – May 30, 2026</p>
        <p className="text-slate-500 text-sm mt-1">Day {day} of {COMPETITION_DAYS}</p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <p className="text-center text-slate-400 text-sm font-medium">Who are you?</p>
        {PARTICIPANTS.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="w-full py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95 hover:brightness-110"
            style={{ backgroundColor: p.color + '22', border: `2px solid ${p.color}`, color: p.color }}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
