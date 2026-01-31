"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { POKEMON_TYPES, getTypeName } from "@/lib/pokemon-types"
import { getTypeEffectiveness } from "@/lib/pokemon-utils"
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

export function TypeEffectivenessCalculator() {
  const { t, language } = useLanguage()
  const [type1, setType1] = useState<string | null>(null)
  const [type2, setType2] = useState<string | null>(null)

  // 计算受到的伤害
  const damageTaken = useMemo(() => {
    if (!type1) return null

    const types = type2 ? [type1, type2] : [type1]
    const effectiveness = getTypeEffectiveness(types)

    // 分类伤害倍数
    const damage4x: string[] = []  // 4倍伤害（双倍克制）
    const damage2x: string[] = []  // 2倍伤害
    const damage1x: string[] = []  // 1倍伤害
    const damageHalf: string[] = []  // 1/2倍伤害
    const damageQuarter: string[] = []  // 1/4倍伤害（双倍抵抗）
    const damage0x: string[] = []  // 0倍伤害（免疫）

    POKEMON_TYPES.forEach((attackerType) => {
      const multiplier = effectiveness.defending[attackerType] ?? 1
      if (multiplier === 0) {
        damage0x.push(attackerType)
      } else if (multiplier === 4) {
        damage4x.push(attackerType)
      } else if (multiplier === 2) {
        damage2x.push(attackerType)
      } else if (multiplier === 1) {
        damage1x.push(attackerType)
      } else if (multiplier === 0.5) {
        damageHalf.push(attackerType)
      } else if (multiplier === 0.25) {
        damageQuarter.push(attackerType)
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
  }, [type1, type2])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：属性选择 */}
      <Card>
        <CardHeader>
          <CardTitle>{t.typeEffectivenessCalculator || "属性克制计算器"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 第一个属性 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              {t.selectType || "选择属性"}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {POKEMON_TYPES.map((type) => {
                const isSelected = type1 === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setType1(isSelected ? null : type)}
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
          </div>

          {/* 第二个属性（可选） */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              {t.addSecondType || "添加第二个属性（可选）"}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {POKEMON_TYPES.map((type) => {
                const isSelected = type2 === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setType2(isSelected ? null : type)}
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
          </div>
        </CardContent>
      </Card>

      {/* 右侧：伤害结果 */}
      <Card>
        <CardHeader>
          <CardTitle>{t.damageTaken || "受到的伤害"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!type1 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t.selectTypeFirst || "请先选择一个属性"}
            </div>
          ) : (
            <>
              {/* 4倍伤害（双倍克制） */}
              {damageTaken && damageTaken.damage4x.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 dark:text-red-400">
                    {t.takes4xDamage || "受到 4× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {damageTaken.damage4x.map((type) => (
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
              {damageTaken && damageTaken.damage2x.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-500">
                    {t.takes2xDamage || "受到 2× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {damageTaken.damage2x.map((type) => (
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
              {damageTaken && damageTaken.damage1x.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-muted-foreground">
                    {t.takes1xDamage || "受到 1× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {damageTaken.damage1x.map((type) => (
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
              {damageTaken && damageTaken.damageHalf.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-500">
                    {t.takesHalfDamage || "受到 1/2× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {damageTaken.damageHalf.map((type) => (
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

              {/* 0.25倍伤害（双倍抵抗） */}
              {damageTaken && damageTaken.damageQuarter.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600 dark:text-green-400">
                    {t.takesQuarterDamage || "受到 1/4× 伤害"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {damageTaken.damageQuarter.map((type) => (
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

              {/* 0倍伤害（免疫） */}
              {damageTaken && damageTaken.damage0x.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-500">
                    {t.takes0xDamage || "受到 0× 伤害（免疫）"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {damageTaken.damage0x.map((type) => (
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

import { CoverageCalculator } from "./coverage-calculator"

export function TypeEffectivenessAndCoverage() {
  return (
    <div className="space-y-8">
      <TypeEffectivenessCalculator />
      <CoverageCalculator />
    </div>
  )
}

