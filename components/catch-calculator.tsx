"use client"

import { useState, useEffect, useMemo } from "react"
import { Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import type { Pokemon, CatchRateResult } from "@/lib/pokemon-types"
import {
  calculateHP,
  calculateAllCatchRates,
  getPokeballModifiers,
  getStatusModifiers,
  formatPercent,
} from "@/lib/pokemon-utils"
import { useLanguage } from "@/contexts/language-context"

interface CatchCalculatorProps {
  pokemon: Pokemon | null
}

export function CatchCalculator({ pokemon }: CatchCalculatorProps) {
  const { t, language } = useLanguage()
  const [level, setLevel] = useState(50)
  const [currentHP, setCurrentHP] = useState(1)
  const [statusIndex, setStatusIndex] = useState(0)
  const [conditions, setConditions] = useState<{ [key: string]: boolean }>({})

  const pokeballs = getPokeballModifiers()
  const statuses = getStatusModifiers()

  // Calculate max HP based on level and base stats
  const maxHP = useMemo(() => {
    if (!pokemon) return 100
    return calculateHP(pokemon.stats.hp, level)
  }, [pokemon, level])

  // Auto-update currentHP when maxHP changes
  useEffect(() => {
    setCurrentHP(Math.min(currentHP, maxHP))
  }, [maxHP])

  // Calculate catch rates
  const catchRates = useMemo<CatchRateResult[]>(() => {
    if (!pokemon) return []
    return calculateAllCatchRates(
      pokemon.species.captureRate,
      maxHP,
      currentHP,
      statuses[statusIndex].modifier,
      conditions,
    )
  }, [pokemon, maxHP, currentHP, statusIndex, conditions])

  const toggleCondition = (ballName: string, condName: string) => {
    const key = `${ballName}-${condName}`
    setConditions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getStatusTextClass = (color: string) => {
    if (!color || color === "bg-muted") return "text-muted-foreground"
    if (color.includes("300") || color.includes("400")) return "text-gray-900 dark:text-gray-100"
    return "text-white"
  }

  if (!pokemon) {
    return (
      <Card className="pokedex-detail-card" data-slot="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            {t.catchCalculator}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">{t.selectPokemonFirst}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pokedex-detail-card" data-slot="card">
      <CardHeader className="pb-5">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Calculator className="h-5 w-5 text-muted-foreground" />
          {t.catchCalculator}
        </CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="w-14 h-14 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={pokemon.sprites.front || "/placeholder.svg"}
              alt={pokemon.name}
              className="w-12 h-12 pixelated object-contain"
              key={`${pokemon.id}-${pokemon.sprites.front}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.src !== "/placeholder.svg") target.src = "/placeholder.svg"
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground truncate">{pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{t.baseCaptureRate}: {pokemon.species.captureRate}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor="level" className="text-sm font-medium text-foreground">{t.level}</Label>
            <Input
              id="level"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              value={level}
              onChange={(e) => setLevel(Math.max(1, Math.min(100, Number.parseInt(e.target.value) || 1)))}
              className="bg-white/50 dark:bg-white/10 border-border text-foreground h-9"
              aria-label={t.level}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentHP" className="text-sm font-medium text-foreground">
              {t.currentHP} <span className="text-muted-foreground font-normal">({t.max}: {maxHP})</span>
            </Label>
            <Input
              id="currentHP"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxHP}
              value={currentHP}
              onChange={(e) => setCurrentHP(Math.max(1, Math.min(maxHP, Number.parseInt(e.target.value) || 1)))}
              className="bg-white/50 dark:bg-white/10 border-border text-foreground h-9"
              aria-label={`${t.currentHP} ${t.max} ${maxHP}`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">{t.statusCondition}</Label>
          <RadioGroup
            value={statusIndex.toString()}
            onValueChange={(v) => setStatusIndex(Number.parseInt(v))}
            className="flex flex-wrap gap-2.5"
          >
            {statuses.map((status, i) => {
              const isSelected = statusIndex === i
              const textClass = getStatusTextClass(status.color || "")
              return (
                <div key={status.name} className="flex items-center">
                  <RadioGroupItem value={i.toString()} id={`status-${i}`} className="sr-only" />
                  <Label
                    htmlFor={`status-${i}`}
                    className={`
                      cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                      transition-all duration-200
                      ${status.color || "bg-muted"}
                      ${textClass}
                      ${isSelected
                        ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/30 shadow-md scale-[1.02]"
                        : "ring-1 ring-black/10 dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/20"
                      }
                    `}
                  >
                    <span>{status.nameZh}</span>
                    {status.modifier !== 1 && (
                      <span className="opacity-90">&times;{status.modifier}</span>
                    )}
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">{t.specialConditions || "特殊条件"}</Label>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {pokeballs
              .filter((ball) => ball.conditions && ball.conditions.length > 0)
              .flatMap((ball) =>
                ball.conditions!.map((cond) => (
                  <div key={`${ball.name}-${cond.name}`} className="flex items-center gap-3">
                    <Checkbox
                      id={`${ball.name}-${cond.name}`}
                      checked={conditions[`${ball.name}-${cond.name}`] || false}
                      onCheckedChange={() => toggleCondition(ball.name, cond.name)}
                      className="flex-shrink-0"
                    />
                    <Label
                      htmlFor={`${ball.name}-${cond.name}`}
                      className="cursor-pointer text-sm text-foreground font-normal flex items-center gap-2 min-w-0 leading-tight"
                    >
                      {ball.spriteUrl && (
                        <img
                          src={ball.spriteUrl}
                          alt={ball.nameZh}
                          className="w-4 h-4 object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      )}
                      <span className="break-words">{ball.nameZh}: {cond.nameZh}</span>
                    </Label>
                  </div>
                )),
              )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">{t.catchRate}</Label>
          <div className="space-y-3">
            {catchRates.map((result) => (
              <div key={result.ballName} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {result.spriteUrl && (
                      <img
                        src={result.spriteUrl}
                        alt={result.ballNameZh}
                        className="w-5 h-5 flex-shrink-0 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    )}
                    <span className="font-medium text-foreground truncate">{result.ballNameZh}</span>
                  </div>
                  <span
                    className={
                      result.probability >= 0.5
                        ? "text-green-600 dark:text-green-400 font-semibold flex-shrink-0"
                        : result.probability >= 0.2
                          ? "text-amber-600 dark:text-amber-400 font-semibold flex-shrink-0"
                          : "text-red-600 dark:text-red-400 font-semibold flex-shrink-0"
                    }
                  >
                    {formatPercent(result.probability)}
                  </span>
                </div>
                <Progress
                  value={result.probability * 100}
                  className={`h-2.5 rounded-full bg-muted/80 ${
                    result.probability >= 0.5
                      ? "[&>div]:bg-green-500"
                      : result.probability >= 0.2
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-red-500"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
