"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Sparkles, ChevronRight, Zap, Shield, Swords } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Pokemon, Move, Location, EvolutionNode } from "@/lib/pokemon-types"
import { GENERATIONS, getTypeName } from "@/lib/pokemon-types"
import { getTypeEffectiveness } from "@/lib/pokemon-utils"
import { fetchPokemonMoves, fetchPokemonLocations, fetchPokemonDetail } from "@/lib/pokemon-api"
import { fetchPokemonFormData, fetchPokemonFormMoves } from "@/lib/pokemon-form-api"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { FavoriteButton } from "./favorite-button"
import { getEvolutionItemInfo } from "@/lib/evolution-items"
import { getFormName } from "@/lib/form-names"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PokemonDetailProps {
  pokemon: Pokemon
  selectedGeneration: number
  onClose: () => void
  onSelectPokemon: (id: number) => void
  onPokemonUpdate?: (pokemon: Pokemon) => void // 当形态切换时通知父组件更新
}

const STAT_COLORS: { [key: string]: string } = {
  hp: "[&>div]:bg-red-600 [&>div]:dark:bg-red-500",
  attack: "[&>div]:bg-orange-600 [&>div]:dark:bg-orange-500",
  defense: "[&>div]:bg-amber-500 [&>div]:dark:bg-amber-400",
  specialAttack: "[&>div]:bg-blue-600 [&>div]:dark:bg-blue-500",
  specialDefense: "[&>div]:bg-emerald-600 [&>div]:dark:bg-emerald-500",
  speed: "[&>div]:bg-purple-600 [&>div]:dark:bg-purple-500",
}

// 游戏名称翻译
const GAME_NAMES: { [key: string]: { zh: string; en: string; ja: string } } = {
  "red": { zh: "红", en: "Red", ja: "赤" },
  "blue": { zh: "蓝", en: "Blue", ja: "青" },
  "yellow": { zh: "黄", en: "Yellow", ja: "黄" },
  "gold": { zh: "金", en: "Gold", ja: "金" },
  "silver": { zh: "银", en: "Silver", ja: "銀" },
  "crystal": { zh: "水晶", en: "Crystal", ja: "クリスタル" },
  "ruby": { zh: "红宝石", en: "Ruby", ja: "ルビー" },
  "sapphire": { zh: "蓝宝石", en: "Sapphire", ja: "サファイア" },
  "emerald": { zh: "绿宝石", en: "Emerald", ja: "エメラルド" },
  "firered": { zh: "火红", en: "FireRed", ja: "ファイアレッド" },
  "leafgreen": { zh: "叶绿", en: "LeafGreen", ja: "リーフグリーン" },
  "diamond": { zh: "钻石", en: "Diamond", ja: "ダイヤモンド" },
  "pearl": { zh: "珍珠", en: "Pearl", ja: "パール" },
  "platinum": { zh: "白金", en: "Platinum", ja: "プラチナ" },
  "heartgold": { zh: "心金", en: "HeartGold", ja: "ハートゴールド" },
  "soulsilver": { zh: "魂银", en: "SoulSilver", ja: "ソウルシルバー" },
  "black": { zh: "黑", en: "Black", ja: "ブラック" },
  "white": { zh: "白", en: "White", ja: "ホワイト" },
  "black-2": { zh: "黑2", en: "Black 2", ja: "ブラック2" },
  "white-2": { zh: "白2", en: "White 2", ja: "ホワイト2" },
  "x": { zh: "X", en: "X", ja: "X" },
  "y": { zh: "Y", en: "Y", ja: "Y" },
  "omega-ruby": { zh: "欧米伽红宝石", en: "Omega Ruby", ja: "オメガルビー" },
  "alpha-sapphire": { zh: "阿尔法蓝宝石", en: "Alpha Sapphire", ja: "アルファサファイア" },
  "sun": { zh: "太阳", en: "Sun", ja: "サン" },
  "moon": { zh: "月亮", en: "Moon", ja: "ムーン" },
  "ultra-sun": { zh: "究极之日", en: "Ultra Sun", ja: "ウルトラサン" },
  "ultra-moon": { zh: "究极之月", en: "Ultra Moon", ja: "ウルトラムーン" },
  "sword": { zh: "剑", en: "Sword", ja: "ソード" },
  "shield": { zh: "盾", en: "Shield", ja: "シールド" },
  "brilliant-diamond": { zh: "晶灿钻石", en: "Brilliant Diamond", ja: "ブリリアントダイヤモンド" },
  "shining-pearl": { zh: "明亮珍珠", en: "Shining Pearl", ja: "シャイニングパール" },
  "legends-arceus": { zh: "传说 阿尔宙斯", en: "Legends: Arceus", ja: "レジェンズ アルセウス" },
  "scarlet": { zh: "朱", en: "Scarlet", ja: "スカーレット" },
  "violet": { zh: "紫", en: "Violet", ja: "バイオレット" },
}

function getGameName(game: string, language: "zh" | "en" | "ja" = "zh"): string {
  const gameKey = game.toLowerCase().replace(/\s+/g, "-")
  const gameInfo = GAME_NAMES[gameKey]
  if (gameInfo) {
    return gameInfo[language] || gameInfo.zh || game
  }
  return game
}

export function PokemonDetail({ pokemon: initialPokemon, selectedGeneration, onClose, onSelectPokemon, onPokemonUpdate }: PokemonDetailProps) {
  const { t, language } = useLanguage()
  const [pokemon, setPokemon] = useState<Pokemon>(initialPokemon)
  const [selectedForm, setSelectedForm] = useState<string | null>(null)
  const [isLoadingForm, setIsLoadingForm] = useState(false)
  const [moves, setMoves] = useState<Move[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoadingMoves, setIsLoadingMoves] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [showShiny, setShowShiny] = useState(false)
  
  // 当初始宝可梦改变时，重置状态
  useEffect(() => {
    setPokemon(initialPokemon)
    setSelectedForm(null)
  }, [initialPokemon.id])
  
  const STAT_NAMES: { [key: string]: string } = {
    hp: t.hp,
    attack: t.attack,
    defense: t.defense,
    specialAttack: t.specialAttack,
    specialDefense: t.specialDefense,
    speed: t.speed,
  }

  const handleFormChange = async (formName: string) => {
    if (formName === "default") {
      // 切换回默认形态
      try {
        setIsLoadingForm(true)
        const defaultPokemon = await fetchPokemonDetail(pokemon.id)
      setPokemon(defaultPokemon)
      setSelectedForm(null)
      // 通知父组件更新
      if (onPokemonUpdate) {
        onPokemonUpdate(defaultPokemon)
      }
      // 重新加载默认形态的招式
        setIsLoadingMoves(true)
        try {
          const defaultMoves = await fetchPokemonMoves(pokemon.id, selectedGeneration)
          setMoves(defaultMoves)
        } catch (error) {
          console.error("Failed to load default form moves:", error)
        } finally {
          setIsLoadingMoves(false)
        }
      } catch (error) {
        console.error("Failed to load default form:", error)
      } finally {
        setIsLoadingForm(false)
      }
      return
    }

    try {
      setIsLoadingForm(true)
      const formData = await fetchPokemonFormData(formName)
      const updatedPokemon: Pokemon = {
        ...pokemon,
        types: formData.types,
        stats: formData.stats,
        abilities: formData.abilities,
        sprites: formData.sprites,
        height: formData.height,
        weight: formData.weight,
      }
      setPokemon(updatedPokemon)
      setSelectedForm(formName)
      // 通知父组件更新
      if (onPokemonUpdate) {
        onPokemonUpdate(updatedPokemon)
      }
      
      // 加载该形态的招式
      setIsLoadingMoves(true)
      try {
        const formMoves = await fetchPokemonFormMoves(formName, selectedGeneration)
        setMoves(formMoves)
      } catch (error) {
        console.error("Failed to load form moves:", error)
        // 如果形态招式加载失败，尝试使用默认形态的招式
        const defaultMoves = await fetchPokemonMoves(pokemon.id, selectedGeneration)
        setMoves(defaultMoves)
      } finally {
        setIsLoadingMoves(false)
      }
    } catch (error) {
      console.error("Failed to load form data:", error)
    } finally {
      setIsLoadingForm(false)
    }
  }

  useEffect(() => {
    if (!pokemon) return

    const loadMoves = async () => {
      setIsLoadingMoves(true)
      try {
        const data = await fetchPokemonMoves(pokemon.id, selectedGeneration)
        setMoves(data)
      } catch (error) {
        console.error("Failed to load moves:", error)
      }
      setIsLoadingMoves(false)
    }

    const loadLocations = async () => {
      setIsLoadingLocations(true)
      try {
        // 优先从本地数据加载（如果存在）
        const fullData = await import("@/lib/pokemon-data-loader").then(m => m.loadPokemonFullDataFromFile())
        if (fullData && fullData[pokemon.id]) {
          // 保存 locationsChecked 到 pokemon 对象（用于显示判断）
          if (fullData[pokemon.id].locationsChecked !== undefined) {
            (pokemon as any).locationsChecked = fullData[pokemon.id].locationsChecked
          }
          if (fullData[pokemon.id].locations && fullData[pokemon.id].locations.length > 0) {
            setLocations(fullData[pokemon.id].locations)
          } else {
            // 本地数据存在但 locations 为空，说明已检查过
            setLocations([])
          }
        } else {
          // 如果本地数据没有，从 API 获取
          const data = await fetchPokemonLocations(pokemon.id)
          setLocations(data)
        }
      } catch (error) {
        console.error("Failed to load locations:", error)
      }
      setIsLoadingLocations(false)
    }

    loadMoves()
    loadLocations()
  }, [pokemon?.id, selectedGeneration])

  if (!pokemon) {
    return null
  }

  const typeEffectiveness = getTypeEffectiveness(pokemon.types)

  const levelUpMoves = moves.filter((m) => m.learnMethod === "level-up")
  const tmMoves = moves.filter((m) => m.learnMethod === "machine")

  const renderEvolutionChain = (node: EvolutionNode, isFirst = true): React.ReactNode => {
    const evolutionDetails = node.evolutionDetails?.[0]
    const hasEvolutionInfo = evolutionDetails && (
      evolutionDetails.minLevel || 
      evolutionDetails.item || 
      evolutionDetails.timeOfDay || 
      evolutionDetails.location
    )

    return (
      <div key={node.id} className="flex items-center gap-3">
        {!isFirst && (
          <div className="flex flex-col items-center justify-center gap-2 min-w-[80px]">
            {/* 箭头 */}
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            
            {/* 进化条件信息 */}
            {hasEvolutionInfo && (
              <div className="flex flex-col items-center gap-1.5 px-2 py-1.5 rounded-lg bg-secondary/30 border border-border/50">
                {evolutionDetails.minLevel && (
                  <span className="text-[11px] font-medium text-center text-foreground">
                    Lv.{evolutionDetails.minLevel}
                  </span>
                )}
                {evolutionDetails.item && (() => {
                  const itemInfo = getEvolutionItemInfo(evolutionDetails.item)
                  if (!itemInfo) return null
                  return (
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src={itemInfo.spriteUrl}
                        alt={itemInfo.nameZh}
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                      <span className="text-[10px] text-center leading-tight text-foreground font-medium max-w-[70px]">
                        {itemInfo.nameZh}
                      </span>
                    </div>
                  )
                })()}
                {evolutionDetails.timeOfDay && (
                  <span className="text-[10px] text-center text-muted-foreground">
                    {evolutionDetails.timeOfDay === "day" ? "白天" : 
                     evolutionDetails.timeOfDay === "night" ? "夜晚" : 
                     evolutionDetails.timeOfDay}
                  </span>
                )}
                {evolutionDetails.location && (
                  <span className="text-[10px] text-center text-muted-foreground">
                    {evolutionDetails.location}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => onSelectPokemon(node.id)}
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            node.id === pokemon.id ? "bg-primary/20 ring-2 ring-primary/30" : "hover:bg-secondary",
          )}
        >
          <img src={node.sprite || "/placeholder.svg"} alt={node.name} className="w-12 h-12 pixelated" />
          <span className="text-xs mt-1 text-center max-w-[80px]">{node.names[language] || node.names.zh || node.names.en || node.name}</span>
        </button>
        {node.evolvesTo.length > 0 && (
          <div className="flex flex-col gap-3">{node.evolvesTo.map((evo) => renderEvolutionChain(evo, false))}</div>
        )}
      </div>
    )
  }

  return (
    <Card className="relative overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <CardHeader className="pb-4">
        <div className="flex items-start gap-6">
          {/* Pokemon Image */}
          <div className="relative flex-shrink-0">
            <div className="relative w-40 h-40 rounded-2xl bg-gradient-to-br from-secondary to-background p-4">
              <img
                src={
                  showShiny
                    ? pokemon.sprites.artworkShiny || pokemon.sprites.frontShiny
                    : pokemon.sprites.artwork || pokemon.sprites.front
                }
                alt={pokemon.name}
                className="w-full h-full object-contain drop-shadow-lg"
              />
              <button
                onClick={() => setShowShiny(!showShiny)}
                className={cn(
                  "absolute bottom-2 right-2 p-1.5 rounded-full transition-colors",
                  showShiny ? "bg-yellow-500/30 text-yellow-400" : "bg-secondary hover:bg-secondary/80",
                )}
                title={showShiny ? t.showNormal : t.showShiny}
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground font-mono">#{pokemon.id.toString().padStart(3, "0")}</span>
              <CardTitle className="text-2xl">{pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}</CardTitle>
              <FavoriteButton pokemonId={pokemon.id} size="sm" />
            </div>
            <div className="text-muted-foreground text-sm mb-3 capitalize">
              {pokemon.name} · {pokemon.species.genera}
            </div>

            <div className="flex gap-2 mb-4">
              {pokemon.types.map((type) => (
                <span key={type} className={`type-${type} px-3 py-1 rounded-full text-white text-sm font-medium`}>
                  {getTypeName(type, language)}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t.height}: </span>
                <span>{(pokemon.height / 10).toFixed(1)} m</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.weight}: </span>
                <span>{(pokemon.weight / 10).toFixed(1)} kg</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.captureRate}: </span>
                <span>{pokemon.species.captureRate}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.generation}: </span>
                <span>{GENERATIONS.find((g) => g.id === pokemon.species.generation)?.names[language] || GENERATIONS.find((g) => g.id === pokemon.species.generation)?.names.zh}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="stats">{t.stats}</TabsTrigger>
            <TabsTrigger value="abilities">{t.abilities}</TabsTrigger>
            <TabsTrigger value="evolution">{t.evolution}</TabsTrigger>
            <TabsTrigger value="type">{t.typeEffectiveness}</TabsTrigger>
            <TabsTrigger value="moves">{t.moves}</TabsTrigger>
            <TabsTrigger value="locations">{t.locations}</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-3">
            {Object.entries(pokemon.stats)
              .filter(([key]) => key !== "total")
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-muted-foreground">{STAT_NAMES[key]}</span>
                  <span className="w-10 text-sm font-mono text-right">{value}</span>
                  <Progress value={(value / 255) * 100} className={cn("flex-1 h-3 bg-secondary/50", STAT_COLORS[key])} />
                </div>
              ))}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <span className="w-16 text-sm font-medium">{t.total}</span>
              <span className="w-10 text-sm font-mono font-bold text-right">{pokemon.stats.total}</span>
            </div>
          </TabsContent>

          <TabsContent value="abilities" className="space-y-3">
            {pokemon.abilities.map((ability) => (
              <div key={ability.name} className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{ability.names[language] || ability.names.zh || ability.names.en || ability.name}</span>
                  {ability.isHidden && (
                    <Badge variant="secondary" className="text-xs">
                      {t.hiddenAbility}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{ability.description}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="evolution">
            <div className="flex items-center justify-center py-4 overflow-x-auto">
              {pokemon.species.evolutionChain.map((node) => renderEvolutionChain(node))}
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div>
              <h4 className="flex items-center gap-2 font-medium mb-3">
                <Swords className="h-4 w-4 text-red-400" />
                {t.attackEffectiveness}
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(typeEffectiveness.attacking)
                  .filter(([, mult]) => mult > 1)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, mult]) => (
                    <Badge key={type} variant="secondary" className={`type-${type} text-white gap-1`}>
                      {getTypeName(type, language)} ×{mult}
                    </Badge>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="flex items-center gap-2 font-medium mb-3">
                <Shield className="h-4 w-4 text-blue-400" />
                {t.defenseEffectiveness}
              </h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground w-20">{t.weaknesses}:</span>
                  {Object.entries(typeEffectiveness.defending)
                    .filter(([, mult]) => mult > 1)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, mult]) => (
                      <Badge key={type} variant="destructive" className={`gap-1`}>
                        <span className={`type-${type} w-2 h-2 rounded-full`} />
                        {getTypeName(type, language)} ×{mult}
                      </Badge>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground w-20">{t.resistances}:</span>
                  {Object.entries(typeEffectiveness.defending)
                    .filter(([, mult]) => mult < 1 && mult > 0)
                    .sort(([, a], [, b]) => a - b)
                    .map(([type, mult]) => (
                      <Badge key={type} variant="secondary" className="gap-1 bg-green-500/20 text-green-400">
                        <span className={`type-${type} w-2 h-2 rounded-full`} />
                        {getTypeName(type, language)} ×{mult}
                      </Badge>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground w-20">{t.immunities}:</span>
                  {Object.entries(typeEffectiveness.defending)
                    .filter(([, mult]) => mult === 0)
                    .map(([type]) => (
                      <Badge key={type} variant="secondary" className="gap-1 bg-gray-500/20">
                        <span className={`type-${type} w-2 h-2 rounded-full`} />
                        {getTypeName(type, language)} ×0
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="moves">
            <ScrollArea className="h-80">
              {isLoadingMoves ? (
                <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
              ) : (
                <div className="space-y-4">
                  {levelUpMoves.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {t.levelUpMoves}
                      </h4>
                      <div className="space-y-1">
                        {levelUpMoves.map((move) => (
                          <div
                            key={`${move.id}-${move.levelLearnedAt}`}
                            className="flex items-center gap-2 p-2 rounded bg-secondary/30 text-sm"
                          >
                            <span className="w-12 text-muted-foreground">Lv.{move.levelLearnedAt}</span>
                            <span className={`type-${move.type} w-2 h-2 rounded-full`} />
                            <span className="flex-1">{move.names[language] || move.names.zh || move.names.en || move.name}</span>
                            <span className="text-muted-foreground">{move.power || "-"}</span>
                            <span className="text-muted-foreground">{move.accuracy || "-"}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tmMoves.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">{t.tmMoves}</h4>
                      <div className="space-y-1">
                        {tmMoves.slice(0, 20).map((move) => (
                          <div key={move.id} className="flex items-center gap-2 p-2 rounded bg-secondary/30 text-sm">
                            <span className={`type-${move.type} w-2 h-2 rounded-full`} />
                            <span className="flex-1">{move.names[language] || move.names.zh || move.names.en || move.name}</span>
                            <span className="text-muted-foreground">{move.power || "-"}</span>
                            <span className="text-muted-foreground">{move.accuracy || "-"}%</span>
                          </div>
                        ))}
                        {tmMoves.length > 20 && (
                          <div className="text-center text-muted-foreground text-sm py-2">
                            {t.moreMoves.replace("{count}", (tmMoves.length - 20).toString())}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="locations">
            <ScrollArea className="h-80">
              {isLoadingLocations ? (
                <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
              ) : locations.length === 0 ? (
                <div className="text-center py-8">
                  {(() => {
                    // 检查是否已检查过出现地点
                    const isChecked = (pokemon as any).locationsChecked === true
                    
                    if (isChecked) {
                      return (
                        <div className="space-y-2">
                          <p className="text-muted-foreground">{t.noWildLocations || "该宝可梦在野外无出现地点"}</p>
                          <p className="text-xs text-muted-foreground">（可能是传说/神话宝可梦或特殊获得方式）</p>
                        </div>
                      )
                    } else {
                      return (
                        <div className="space-y-2">
                          <p className="text-muted-foreground">{t.locationsNotLoaded || "出现地点数据未加载"}</p>
                          <p className="text-xs text-muted-foreground">（正在从 API 获取数据...）</p>
                        </div>
                      )
                    }
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    // 按世代分组
                    const groupedByGeneration = locations.reduce((acc, loc) => {
                      const gen = loc.generation || 1
                      if (!acc[gen]) acc[gen] = []
                      acc[gen].push(loc)
                      return acc
                    }, {} as Record<number, typeof locations>)

                    // 按世代排序
                    const sortedGenerations = Object.keys(groupedByGeneration)
                      .map(Number)
                      .sort((a, b) => a - b)

                    return sortedGenerations.map((gen) => {
                      const genLocations = groupedByGeneration[gen]
                      const genInfo = GENERATIONS.find((g) => g.id === gen)
                      return (
                        <div key={gen} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            {genInfo?.names[language] || genInfo?.names.zh || `第${gen}世代`}
                          </h4>
                          <div className="space-y-1">
                            {genLocations.map((loc, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm"
                              >
                                <div>
                                  <span>{loc.names.zh || loc.names[language] || loc.names.en || loc.name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    ({getGameName(loc.game, language)})
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  Lv.{loc.minLevel}-{loc.maxLevel} · {loc.chance}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* 形态切换 */}
        {pokemon.forms && pokemon.forms.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">{t.form}</h4>
              <Select
                value={selectedForm || "default"}
                onValueChange={handleFormChange}
                disabled={isLoadingForm}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t.selectForm} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex items-center gap-2">
                      <img
                        src={initialPokemon.sprites.front || "/placeholder.svg"}
                        alt="默认"
                        className="w-6 h-6 object-contain"
                      />
                      <span>{t.defaultForm}</span>
                    </div>
                  </SelectItem>
                  {pokemon.forms.map((form) => (
                    <SelectItem key={form.name} value={form.name}>
                      <div className="flex items-center gap-2">
                        <img
                          src={form.sprites.front || "/placeholder.svg"}
                          alt={form.formName}
                          className="w-6 h-6 object-contain"
                        />
                        <div className="flex flex-col">
                          <span>{getFormName(form.formName, language)}</span>
                          <div className="flex gap-1 mt-0.5">
                            {form.types.map((type) => (
                              <span
                                key={type}
                                className={`type-${type} text-[8px] px-1 py-0.5 rounded text-white`}
                              >
                                {getTypeName(type, language)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* All Sprites */}
        {(pokemon.sprites.frontFemale || pokemon.forms.length > 0) && (
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="font-medium mb-3">{t.allForms}</h4>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <img src={pokemon.sprites.front || "/placeholder.svg"} alt="Normal" className="w-16 h-16 pixelated" />
                <span className="text-xs text-muted-foreground">{t.normal}</span>
              </div>
              <div className="text-center">
                <img
                  src={pokemon.sprites.frontShiny || "/placeholder.svg"}
                  alt="Shiny"
                  className="w-16 h-16 pixelated"
                />
                <span className="text-xs text-muted-foreground">{t.shiny}</span>
              </div>
              {pokemon.sprites.frontFemale && (
                <>
                  <div className="text-center">
                    <img
                      src={pokemon.sprites.frontFemale || "/placeholder.svg"}
                      alt="Female"
                      className="w-16 h-16 pixelated"
                    />
                    <span className="text-xs text-muted-foreground">{t.female}</span>
                  </div>
                  {pokemon.sprites.frontShinyFemale && (
                    <div className="text-center">
                      <img
                        src={pokemon.sprites.frontShinyFemale || "/placeholder.svg"}
                        alt="Shiny Female"
                        className="w-16 h-16 pixelated"
                      />
                      <span className="text-xs text-muted-foreground">{t.shinyFemale}</span>
                    </div>
                  )}
                </>
              )}
              {pokemon.forms.map((form) => (
                <div key={form.name} className="text-center">
                  <img
                    src={form.sprites.front || "/placeholder.svg"}
                    alt={form.formName}
                    className="w-16 h-16 pixelated"
                  />
                  <span className="text-xs text-muted-foreground">{getFormName(form.formName, language)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
