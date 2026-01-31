"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { POKEMON_TYPES, getTypeName } from "@/lib/pokemon-types"
import { useLanguage } from "@/contexts/language-context"
import { Label } from "@/components/ui/label"

const TYPE_CHART: { [attacker: string]: { [defender: string]: number } } = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

export function CoverageCalculator() {
  const { t, language } = useLanguage()
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  // 计算打击面
  const coverage = useMemo(() => {
    if (selectedTypes.length === 0) return null

    // 对每个防御属性，计算所有攻击属性中的最大伤害倍数
    const coverageMap: { [defenderType: string]: number } = {}

    POKEMON_TYPES.forEach((defenderType) => {
      let maxMultiplier = 1  // 默认1倍，如果没有特殊效果
      
      selectedTypes.forEach((attackerType) => {
        const multiplier = TYPE_CHART[attackerType]?.[defenderType] ?? 1
        maxMultiplier = Math.max(maxMultiplier, multiplier)
      })

      // 如果所有攻击属性都无效（0倍），则标记为0
      const allZero = selectedTypes.every((attackerType) => {
        const multiplier = TYPE_CHART[attackerType]?.[defenderType] ?? 1
        return multiplier === 0
      })

      if (allZero) {
        coverageMap[defenderType] = 0
      } else {
        coverageMap[defenderType] = maxMultiplier
      }
    })

    // 分类伤害倍数
    const damage4x: string[] = []
    const damage2x: string[] = []
    const damage1x: string[] = []
    const damageHalf: string[] = []
    const damageQuarter: string[] = []
    const damage0x: string[] = []

    POKEMON_TYPES.forEach((defenderType) => {
      const multiplier = coverageMap[defenderType] ?? 1
      if (multiplier === 0) {
        damage0x.push(defenderType)
      } else if (multiplier === 4) {
        damage4x.push(defenderType)
      } else if (multiplier === 2) {
        damage2x.push(defenderType)
      } else if (multiplier === 1) {
        damage1x.push(defenderType)
      } else if (multiplier === 0.5) {
        damageHalf.push(defenderType)
      } else if (multiplier === 0.25) {
        damageQuarter.push(defenderType)
      }
    })

    return {
      damage4x,
      damage2x,
      damage1x,
      damageHalf,
      damageQuarter,
      damage0x,
    }
  }, [selectedTypes])

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：技能属性选择 */}
      <Card>
        <CardHeader>
          <CardTitle>{t.coverageCalculator || "打击面计算器"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="text-base font-medium">
            {t.selectMoveTypes || "选择技能属性（可多选）"}
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {POKEMON_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`
                    relative flex items-center justify-center px-2 py-1.5 rounded-lg
                    transition-all duration-200 font-medium text-xs text-white
                    type-${type}
                    ${isSelected 
                      ? 'shadow-md scale-105 ring-2 ring-white/50' 
                      : 'ring-2 ring-white/20 hover:ring-white/40'
                    }
                  `}
                >
                  <span>{getTypeName(type, language)}</span>
                  {isSelected && (
                    <span className="absolute top-0.5 right-0.5 text-[10px] font-bold">✓</span>
                  )}
                </button>
              )
            })}
          </div>
          {selectedTypes.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm text-muted-foreground">
                {t.selectedTypes || "已选择"} ({selectedTypes.length})
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTypes.map((type) => (
                  <div
                    key={type}
                    className={`
                      relative flex items-center justify-center px-2 py-1.5 rounded-lg
                      font-medium text-xs text-white
                      type-${type}
                      ring-2 ring-white/20
                    `}
                  >
                    <span>{getTypeName(type, language)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 右侧：打击面结果 */}
      <Card>
        <CardHeader>
          <CardTitle>{t.coverageResult || "打击面结果"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedTypes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t.selectMoveTypesFirst || "请先选择技能属性"}
            </div>
          ) : (
            <>
              {/* 4倍伤害 */}
              {coverage && coverage.damage4x.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 dark:text-red-400">
                    {t.deals4xDamage || "造成 4× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {coverage.damage4x.map((type) => (
                      <div
                        key={type}
                        className={`
                          relative flex items-center justify-center px-2 py-1.5 rounded-lg
                          font-medium text-xs text-white
                          type-${type}
                          ring-2 ring-white/20
                        `}
                      >
                        <span>{getTypeName(type, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2倍伤害 */}
              {coverage && coverage.damage2x.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-500">
                    {t.deals2xDamage || "造成 2× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {coverage.damage2x.map((type) => (
                      <div
                        key={type}
                        className={`
                          relative flex items-center justify-center px-2 py-1.5 rounded-lg
                          font-medium text-xs text-white
                          type-${type}
                          ring-2 ring-white/20
                        `}
                      >
                        <span>{getTypeName(type, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1倍伤害 */}
              {coverage && coverage.damage1x.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-muted-foreground">
                    {t.deals1xDamage || "造成 1× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {coverage.damage1x.map((type) => (
                      <div
                        key={type}
                        className={`
                          relative flex items-center justify-center px-2 py-1.5 rounded-lg
                          font-medium text-xs text-white
                          type-${type}
                          ring-2 ring-white/20
                        `}
                      >
                        <span>{getTypeName(type, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 0.5倍伤害 */}
              {coverage && coverage.damageHalf.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-500">
                    {t.dealsHalfDamage || "造成 1/2× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {coverage.damageHalf.map((type) => (
                      <div
                        key={type}
                        className={`
                          relative flex items-center justify-center px-2 py-1.5 rounded-lg
                          font-medium text-xs text-white
                          type-${type}
                          ring-2 ring-white/20
                        `}
                      >
                        <span>{getTypeName(type, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 0.25倍伤害 */}
              {coverage && coverage.damageQuarter.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600 dark:text-green-400">
                    {t.dealsQuarterDamage || "造成 1/4× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {coverage.damageQuarter.map((type) => (
                      <div
                        key={type}
                        className={`
                          relative flex items-center justify-center px-2 py-1.5 rounded-lg
                          font-medium text-xs text-white
                          type-${type}
                          ring-2 ring-white/20
                        `}
                      >
                        <span>{getTypeName(type, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 0倍伤害（无效） */}
              {coverage && coverage.damage0x.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-500">
                    {t.deals0xDamage || "造成 0× 伤害（无效）"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {coverage.damage0x.map((type) => (
                      <div
                        key={type}
                        className={`
                          relative flex items-center justify-center px-2 py-1.5 rounded-lg
                          font-medium text-xs text-white
                          type-${type}
                          ring-2 ring-white/20
                        `}
                      >
                        <span>{getTypeName(type, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

