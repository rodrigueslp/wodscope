"use client"

import { cn } from "@/lib/utils"

// Tipos de equipamento
type EquipmentType = "barbell" | "kettlebell" | "dumbbell" | "none"

interface WeightDisplayProps {
  weightKg: number
  suggestedWeightsText?: string
  className?: string
}

// Detecta o tipo de equipamento baseado no texto
function detectEquipmentType(text?: string): EquipmentType {
  if (!text) return "none"
  
  const lowerText = text.toLowerCase()
  
  // Kettlebell
  if (lowerText.includes("kettlebell") || lowerText.includes("kb") || lowerText.includes("swing")) {
    return "kettlebell"
  }
  
  // Dumbbell
  if (lowerText.includes("dumbbell") || lowerText.includes("db") || lowerText.includes("haltere")) {
    return "dumbbell"
  }
  
  // Barbell - verifica palavras específicas
  if (
    lowerText.includes("barra") || 
    lowerText.includes("barbell") ||
    lowerText.includes("anilha") ||
    lowerText.includes("thruster") ||
    lowerText.includes("clean") ||
    lowerText.includes("snatch") ||
    lowerText.includes("deadlift") ||
    lowerText.includes("squat") ||
    lowerText.includes("front squat") ||
    lowerText.includes("back squat") ||
    lowerText.includes("overhead") ||
    lowerText.includes("press") ||
    lowerText.includes("jerk")
  ) {
    return "barbell"
  }
  
  // Se menciona kg mas não é nenhum dos acima, pode ser outro tipo
  // Verifica se tem um peso sugerido
  const hasWeight = /\d+\s*kg/i.test(text)
  if (!hasWeight) {
    return "none"
  }
  
  // Default para barbell se tem peso mas não identificou o equipamento
  return "barbell"
}

// Extrai o peso do texto
function extractWeight(text?: string): number | null {
  if (!text) return null
  
  // Procura por padrões como "24kg", "24 kg", "use 24kg"
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*kg/i)
  if (match) {
    return parseFloat(match[1].replace(",", "."))
  }
  
  return null
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

// Componente Kettlebell
function KettlebellVisualization({ weightKg }: { weightKg: number }) {
  // Tamanho baseado no peso
  const size = weightKg <= 12 ? "small" : weightKg <= 24 ? "medium" : "large"
  const sizeClasses = {
    small: "w-16 h-20",
    medium: "w-20 h-24",
    large: "w-24 h-28"
  }
  
  // Cor baseada no peso (padrão competition)
  const getKBColor = (weight: number) => {
    if (weight <= 8) return "from-pink-400 to-pink-600"
    if (weight <= 12) return "from-blue-400 to-blue-600"
    if (weight <= 16) return "from-yellow-400 to-yellow-600"
    if (weight <= 20) return "from-purple-400 to-purple-600"
    if (weight <= 24) return "from-green-400 to-green-600"
    if (weight <= 28) return "from-orange-400 to-orange-600"
    if (weight <= 32) return "from-red-400 to-red-600"
    return "from-zinc-400 to-zinc-600"
  }

  return (
    <div className="flex flex-col items-center">
      {/* Kettlebell shape */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* Handle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-6">
          <div className="absolute inset-x-0 top-0 h-3 border-4 border-zinc-600 rounded-t-full bg-transparent" />
        </div>
        
        {/* Body */}
        <div className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br shadow-lg flex items-center justify-center",
          getKBColor(weightKg),
          size === "small" ? "w-14 h-14" : size === "medium" ? "w-16 h-16" : "w-20 h-20"
        )}>
          {/* Weight number */}
          <span className="text-white font-bold text-lg drop-shadow-md">{weightKg}</span>
        </div>
        
        {/* Shine effect */}
        <div className={cn(
          "absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/20",
          size === "small" ? "w-10 h-4" : size === "medium" ? "w-12 h-5" : "w-14 h-6"
        )} style={{ transform: "translateX(-50%) rotate(-20deg)" }} />
      </div>
    </div>
  )
}

// Componente Dumbbell
function DumbbellVisualization({ weightKg }: { weightKg: number }) {
  // Cor baseada no peso
  const getDBColor = (weight: number) => {
    if (weight <= 10) return "bg-zinc-500"
    if (weight <= 20) return "bg-zinc-600"
    if (weight <= 30) return "bg-zinc-700"
    return "bg-zinc-800"
  }

  const plateSize = weightKg <= 15 ? "h-10 w-4" : weightKg <= 25 ? "h-12 w-5" : "h-14 w-6"

  return (
    <div className="flex items-center justify-center gap-0">
      {/* Left plates */}
      <div className={cn("rounded-sm", getDBColor(weightKg), plateSize)} />
      <div className={cn("rounded-sm -ml-0.5", getDBColor(weightKg), plateSize)} />
      
      {/* Handle */}
      <div className="w-12 h-3 bg-gradient-to-b from-zinc-300 to-zinc-400 mx-0.5 rounded-sm">
        {/* Grip texture */}
        <div className="h-full flex items-center justify-center gap-px">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-px h-2 bg-zinc-500" />
          ))}
        </div>
      </div>
      
      {/* Right plates */}
      <div className={cn("rounded-sm -mr-0.5", getDBColor(weightKg), plateSize)} />
      <div className={cn("rounded-sm", getDBColor(weightKg), plateSize)} />
    </div>
  )
}

// Componente Barbell (original)
function BarbellVisualization({ weightKg }: { weightKg: number }) {
  const plates = calculatePlates(weightKg)

  return (
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
  )
}

// Componente principal que detecta o equipamento e renderiza a visualização correta
export function EquipmentWeights({ weightKg, suggestedWeightsText, className }: WeightDisplayProps) {
  const equipmentType = detectEquipmentType(suggestedWeightsText)
  const extractedWeight = extractWeight(suggestedWeightsText)
  const displayWeight = extractedWeight || weightKg
  
  // Se não há equipamento de peso, não renderiza nada
  if (equipmentType === "none") {
    return null
  }
  
  const plates = equipmentType === "barbell" ? calculatePlates(displayWeight) : []
  const plateWeight = displayWeight - BAR_WEIGHT

  const equipmentLabels: Record<EquipmentType, string> = {
    barbell: "Montagem da Barra",
    kettlebell: "Kettlebell Sugerido",
    dumbbell: "Dumbbell Sugerido",
    none: ""
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Title */}
      <h3 className="text-sm font-medium text-muted-foreground">{equipmentLabels[equipmentType]}</h3>
      
      {/* Total Weight Display */}
      <div className="text-center">
        <span className="text-4xl font-bold text-primary">{displayWeight}</span>
        <span className="text-lg text-muted-foreground ml-1">kg</span>
      </div>

      {/* Equipment Visualization */}
      {equipmentType === "kettlebell" && (
        <KettlebellVisualization weightKg={displayWeight} />
      )}
      
      {equipmentType === "dumbbell" && (
        <DumbbellVisualization weightKg={displayWeight} />
      )}
      
      {equipmentType === "barbell" && (
        <>
          <BarbellVisualization weightKg={displayWeight} />
          
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
        </>
      )}
    </div>
  )
}

// Mantém o componente original para retrocompatibilidade
export function BarbellWeights({ weightKg, className }: { weightKg: number; className?: string }) {
  return <EquipmentWeights weightKg={weightKg} className={className} />
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

