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

  if (!pokemon) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t.catchCalculator}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">{t.selectPokemonFirst}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t.catchCalculator}
        </CardTitle>
        <div className="flex items-center gap-3 mt-2">
          <img 
            src={pokemon.sprites.front || "/placeholder.svg"} 
            alt={pokemon.name} 
            className="w-12 h-12 pixelated" 
            key={`${pokemon.id}-${pokemon.sprites.front}`} // 使用组合 key 确保图片更新
            onError={(e) => {
              // 如果图片加载失败，回退到默认图片
              const target = e.target as HTMLImageElement
              if (target.src !== "/placeholder.svg") {
                target.src = "/placeholder.svg"
              }
            }}
          />
          <div>
            <div className="font-medium">{pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}</div>
            <div className="text-sm text-muted-foreground">{t.baseCaptureRate}: {pokemon.species.captureRate}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level and HP inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="level">{t.level}</Label>
            <Input
              id="level"
              type="number"
              min={1}
              max={100}
              value={level}
              onChange={(e) => setLevel(Math.max(1, Math.min(100, Number.parseInt(e.target.value) || 1)))}
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentHP">{t.currentHP} ({t.max}: {maxHP})</Label>
            <Input
              id="currentHP"
              type="number"
              min={1}
              max={maxHP}
              value={currentHP}
              onChange={(e) => setCurrentHP(Math.max(1, Math.min(maxHP, Number.parseInt(e.target.value) || 1)))}
              className="bg-secondary/50"
            />
          </div>
        </div>

        {/* Status conditions */}
        <div className="space-y-2">
          <Label>{t.statusCondition}</Label>
          <RadioGroup
            value={statusIndex.toString()}
            onValueChange={(v) => setStatusIndex(Number.parseInt(v))}
            className="flex flex-wrap gap-2"
          >
            {statuses.map((status, i) => {
              const isSelected = statusIndex === i
              return (
                <div key={status.name} className="flex items-center">
                  <RadioGroupItem value={i.toString()} id={`status-${i}`} className="sr-only" />
                  <Label 
                    htmlFor={`status-${i}`} 
                    className={`
                      cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                      transition-all duration-200 font-medium text-xs text-white
                      ${status.color || 'bg-muted'}
                      ${isSelected 
                        ? 'ring-2 ring-white/50 shadow-md scale-105' 
                        : 'ring-2 ring-white/20 hover:ring-white/40'
                      }
                    `}
                  >
                    <span>{status.nameZh}</span>
                    {status.modifier !== 1 && (
                      <span className="text-[10px] opacity-90">×{status.modifier}</span>
                    )}
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        {/* Special ball conditions */}
        <div className="space-y-2">
          <Label>{t.specialConditions || "特殊条件"}</Label>
          <div className="grid grid-cols-2 gap-2">
            {pokeballs
              .filter((ball) => ball.conditions && ball.conditions.length > 0)
              .flatMap((ball) =>
                ball.conditions!.map((cond) => (
                  <div key={`${ball.name}-${cond.name}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${ball.name}-${cond.name}`}
                      checked={conditions[`${ball.name}-${cond.name}`] || false}
                      onCheckedChange={() => toggleCondition(ball.name, cond.name)}
                    />
                    <Label htmlFor={`${ball.name}-${cond.name}`} className="cursor-pointer text-sm flex items-center gap-2">
                      {ball.spriteUrl && (
                        <img 
                          src={ball.spriteUrl} 
                          alt={ball.nameZh}
                          className="w-4 h-4 object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                      <span>
                        {ball.nameZh}: {cond.nameZh}
                      </span>
                    </Label>
                  </div>
                )),
              )}
          </div>
        </div>

        {/* Catch rate results */}
        <div className="space-y-2">
          <Label>{t.catchRate}</Label>
          <div className="space-y-2">
            {catchRates.map((result) => (
              <div key={result.ballName} className="space-y-1">
                <div className="flex items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {result.spriteUrl && (
                      <img 
                        src={result.spriteUrl} 
                        alt={result.ballNameZh}
                        className="w-5 h-5 flex-shrink-0 object-contain"
                        onError={(e) => {
                          // 如果图片加载失败，隐藏图片
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    <span className="truncate">{result.ballNameZh}</span>
                  </div>
                  <span
                    className={
                      result.probability >= 0.5
                        ? "text-green-400 flex-shrink-0"
                        : result.probability >= 0.2
                          ? "text-yellow-400 flex-shrink-0"
                          : "text-red-400 flex-shrink-0"
                    }
                  >
                    {formatPercent(result.probability)}
                  </span>
                </div>
                <Progress
                  value={result.probability * 100}
                  className={`h-2 ${
                    result.probability >= 0.5
                      ? "[&>div]:bg-green-500"
                      : result.probability >= 0.2
                        ? "[&>div]:bg-yellow-500"
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
