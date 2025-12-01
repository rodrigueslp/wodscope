"use client"

import { cn } from "@/lib/utils"

interface BarbellWeightsProps {
  weightKg: number
  className?: string
}

// Pesos padrão de anilhas em kg e suas cores
const PLATE_CONFIG = [
  { weight: 25, color: "bg-red-500", height: "h-20", label: "25" },
  { weight: 20, color: "bg-blue-500", height: "h-18", label: "20" },
  { weight: 15, color: "bg-yellow-400", height: "h-16", label: "15" },
  { weight: 10, color: "bg-green-500", height: "h-14", label: "10" },
  { weight: 5, color: "bg-white", height: "h-12", label: "5" },
  { weight: 2.5, color: "bg-red-300", height: "h-10", label: "2.5" },
  { weight: 2, color: "bg-blue-300", height: "h-9", label: "2" },
  { weight: 1.5, color: "bg-yellow-300", height: "h-8", label: "1.5" },
  { weight: 1, color: "bg-green-300", height: "h-7", label: "1" },
  { weight: 0.5, color: "bg-gray-300", height: "h-6", label: "0.5" },
]

const BAR_WEIGHT = 20 // Barra olímpica padrão

function calculatePlates(totalWeight: number): { weight: number; color: string; height: string; label: string }[] {
  const weightPerSide = (totalWeight - BAR_WEIGHT) / 2
  if (weightPerSide <= 0) return []
  
  const plates: typeof PLATE_CONFIG = []
  let remaining = weightPerSide

  for (const plate of PLATE_CONFIG) {
    while (remaining >= plate.weight) {
      plates.push(plate)
      remaining -= plate.weight
    }
  }

  return plates
}

export function BarbellWeights({ weightKg, className }: BarbellWeightsProps) {
  const plates = calculatePlates(weightKg)
  const plateWeight = weightKg - BAR_WEIGHT

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Total Weight Display */}
      <div className="text-center">
        <span className="text-4xl font-bold text-primary">{weightKg}</span>
        <span className="text-lg text-muted-foreground ml-1">kg</span>
      </div>

      {/* Barbell Visualization */}
      <div className="flex items-center justify-center gap-0.5 py-4">
        {/* Left sleeve */}
        <div className="w-8 h-3 bg-zinc-400 rounded-l-full" />
        
        {/* Left plates (reversed for visual) */}
        <div className="flex items-center">
          {[...plates].reverse().map((plate, idx) => (
            <div
              key={`left-${idx}`}
              className={cn(
                "w-3 rounded-sm flex items-center justify-center transition-all",
                plate.color,
                plate.height
              )}
              title={`${plate.label}kg`}
            >
              <span className="text-[6px] font-bold text-black/50 rotate-90">
                {plate.label}
              </span>
            </div>
          ))}
        </div>

        {/* Left collar */}
        <div className="w-2 h-6 bg-zinc-600 rounded-sm" />

        {/* Bar */}
        <div className="w-20 h-3 bg-gradient-to-b from-zinc-300 to-zinc-500 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-zinc-200/50" />
          {/* Knurling pattern */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 w-px bg-zinc-600" style={{ left: `${i * 10}%` }} />
            ))}
          </div>
        </div>

        {/* Right collar */}
        <div className="w-2 h-6 bg-zinc-600 rounded-sm" />

        {/* Right plates */}
        <div className="flex items-center">
          {plates.map((plate, idx) => (
            <div
              key={`right-${idx}`}
              className={cn(
                "w-3 rounded-sm flex items-center justify-center transition-all",
                plate.color,
                plate.height
              )}
              title={`${plate.label}kg`}
            >
              <span className="text-[6px] font-bold text-black/50 rotate-90">
                {plate.label}
              </span>
            </div>
          ))}
        </div>

        {/* Right sleeve */}
        <div className="w-8 h-3 bg-zinc-400 rounded-r-full" />
      </div>

      {/* Breakdown */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Barra: {BAR_WEIGHT}kg</span>
        <span>•</span>
        <span>Anilhas: {plateWeight > 0 ? plateWeight : 0}kg ({plateWeight > 0 ? plateWeight/2 : 0}kg/lado)</span>
      </div>

      {/* Plate Legend */}
      {plates.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {Array.from(new Set(plates.map(p => p.weight))).map((weight) => {
            const plate = PLATE_CONFIG.find(p => p.weight === weight)!
            const count = plates.filter(p => p.weight === weight).length
            return (
              <div 
                key={weight}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium flex items-center gap-1",
                  plate.color,
                  plate.color === "bg-white" ? "text-black" : "text-white"
                )}
              >
                <span>{count}x</span>
                <span>{weight}kg</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Versão compacta para usar em cards
export function BarbellWeightsCompact({ weightKg }: { weightKg: number }) {
  const plates = calculatePlates(weightKg)

  return (
    <div className="flex items-center gap-1">
      <div className="w-4 h-1.5 bg-zinc-400 rounded-l-full" />
      {[...plates].reverse().slice(0, 4).map((plate, idx) => (
        <div
          key={`left-${idx}`}
          className={cn("w-1.5 rounded-[1px]", plate.color)}
          style={{ height: `${8 + idx * 2}px` }}
        />
      ))}
      <div className="w-8 h-1.5 bg-zinc-400" />
      {plates.slice(0, 4).map((plate, idx) => (
        <div
          key={`right-${idx}`}
          className={cn("w-1.5 rounded-[1px]", plate.color)}
          style={{ height: `${8 + (3 - idx) * 2}px` }}
        />
      ))}
      <div className="w-4 h-1.5 bg-zinc-400 rounded-r-full" />
      <span className="text-sm font-bold ml-2">{weightKg}kg</span>
    </div>
  )
}

