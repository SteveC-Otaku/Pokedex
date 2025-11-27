"use client"

import { useState, useMemo, useEffect } from "react"
import { X, Plus, Trash2, Swords, Shield, Search, Save, FolderOpen, Edit2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Pokemon, Move } from "@/lib/pokemon-types"
import { POKEMON_TYPES, getTypeName } from "@/lib/pokemon-types"
import { getTypeEffectiveness } from "@/lib/pokemon-utils"
import { fetchPokemonDetail, fetchPokemonMoves } from "@/lib/pokemon-api"
import { fetchPokemonBasicList } from "@/lib/pokemon-api"
import { fetchPokemonFormData } from "@/lib/pokemon-form-api"
import { useLanguage } from "@/contexts/language-context"
import { useTeams, type SavedTeamMember } from "@/contexts/teams-context"
import { FavoriteButton } from "./favorite-button"
import { cn } from "@/lib/utils"

interface TeamMember {
  pokemon: Pokemon | null
  selectedForm: string | null // 选择的形态名称（null 表示默认形态）
  moves: (Move | null)[]
  ability: string | null // 选择的特性
  evs: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
}

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

export function TeamBuilder() {
  const { t, language } = useLanguage()
  const { teams, saveTeam, loadTeam, deleteTeam, updateTeamName } = useTeams()
  const [team, setTeam] = useState<TeamMember[]>([
    { pokemon: null, selectedForm: null, moves: [null, null, null, null], ability: null, evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } },
    { pokemon: null, selectedForm: null, moves: [null, null, null, null], ability: null, evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } },
    { pokemon: null, selectedForm: null, moves: [null, null, null, null], ability: null, evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } },
    { pokemon: null, selectedForm: null, moves: [null, null, null, null], ability: null, evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } },
    { pokemon: null, selectedForm: null, moves: [null, null, null, null], ability: null, evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } },
    { pokemon: null, selectedForm: null, moves: [null, null, null, null], ability: null, evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } },
  ])
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null)
  const [pokemonList, setPokemonList] = useState<any[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingForm, setLoadingForm] = useState<number | null>(null) // 正在加载形态的槽位索引
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)

  // Load pokemon list
  useEffect(() => {
    const loadList = async () => {
      setIsLoadingList(true)
      try {
        const list = await fetchPokemonBasicList()
        setPokemonList(list)
      } catch (error) {
        console.error("Failed to load pokemon list:", error)
      }
      setIsLoadingList(false)
    }
    loadList()
  }, [])

  const handleSelectPokemon = async (slotIndex: number, pokemonId: number) => {
    try {
      const pokemon = await fetchPokemonDetail(pokemonId)
      const newTeam = [...team]
      newTeam[slotIndex] = {
        pokemon,
        selectedForm: null, // 默认形态
        moves: [null, null, null, null],
        ability: pokemon.abilities[0]?.name || null, // 默认选择第一个特性
        evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
      }
      setTeam(newTeam)
      setSelectingSlot(null)
      setSearchQuery("") // 清空搜索
    } catch (error) {
      console.error("Failed to load pokemon:", error)
    }
  }

  const handleSelectForm = async (slotIndex: number, formName: string) => {
    const member = team[slotIndex]
    if (!member.pokemon) return

    // 如果选择的是默认形态，直接重置
    if (formName === "default") {
      try {
        setLoadingForm(slotIndex)
        const pokemon = await fetchPokemonDetail(member.pokemon.id)
        const newTeam = [...team]
        newTeam[slotIndex] = {
          pokemon,
          selectedForm: null,
          moves: [null, null, null, null],
          ability: pokemon.abilities[0]?.name || null,
          evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
        }
        setTeam(newTeam)
      } catch (error) {
        console.error("Failed to load default form:", error)
      } finally {
        setLoadingForm(null)
      }
      return
    }

    try {
      setLoadingForm(slotIndex)
      const formData = await fetchPokemonFormData(formName)
      const newTeam = [...team]
      
      // 更新宝可梦数据（保留原始数据，只更新形态相关的部分）
      const updatedPokemon: Pokemon = {
        ...member.pokemon,
        types: formData.types,
        stats: formData.stats,
        abilities: formData.abilities,
        sprites: formData.sprites,
        height: formData.height,
        weight: formData.weight,
      }

      newTeam[slotIndex] = {
        ...member,
        pokemon: updatedPokemon,
        selectedForm: formName,
        ability: formData.abilities[0]?.name || null, // 重新选择第一个特性
        moves: [null, null, null, null], // 清空招式，因为形态可能不同
        evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }, // 重置努力值
      }
      setTeam(newTeam)
    } catch (error) {
      console.error("Failed to load form data:", error)
      // 显示用户友好的错误提示，但不使用 alert（在浏览器中可能被阻止）
      const errorMessage = error instanceof Error ? error.message : "未知错误"
      console.warn(`无法加载形态数据: ${errorMessage}`)
      // 可以在这里添加 toast 通知或其他 UI 反馈
    } finally {
      setLoadingForm(null)
    }
  }

  const handleRemovePokemon = (slotIndex: number) => {
    const newTeam = [...team]
    newTeam[slotIndex] = { 
      pokemon: null,
      selectedForm: null,
      moves: [null, null, null, null],
      ability: null,
      evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
    }
    setTeam(newTeam)
  }

  const handleSelectAbility = (slotIndex: number, abilityName: string) => {
    const newTeam = [...team]
    newTeam[slotIndex].ability = abilityName
    setTeam(newTeam)
  }

  const handleChangeEV = (slotIndex: number, stat: keyof TeamMember['evs'], value: number) => {
    const newTeam = [...team]
    const currentEVs = newTeam[slotIndex].evs
    const currentValue = currentEVs[stat]
    const totalEVs = Object.values(currentEVs).reduce((sum, v) => sum + v, 0) - currentValue + value
    if (totalEVs <= 510 && value >= 0 && value <= 252) {
      newTeam[slotIndex].evs[stat] = value
      setTeam(newTeam)
    }
  }

  // 过滤宝可梦列表
  const filteredPokemonList = useMemo(() => {
    if (!searchQuery.trim()) {
      return pokemonList
    }

    const q = searchQuery.trim().toLowerCase()
    return pokemonList.filter((p) => {
      // 按编号搜索
      const idStr = p.id.toString()
      const idPadded = idStr.padStart(3, "0")
      if (idStr === q || idPadded === q) {
        return true
      }
      
      // 按名称搜索（支持中文、英文、日文）
      const nameZh = (p.names.zh || "").toLowerCase()
      const nameEn = (p.names.en || "").toLowerCase()
      const nameJa = (p.names.ja || "").toLowerCase()
      const name = (p.name || "").toLowerCase()
      
      return nameZh.includes(q) || nameEn.includes(q) || nameJa.includes(q) || name.includes(q)
    })
  }, [pokemonList, searchQuery])

  const handleSelectMove = async (slotIndex: number, moveIndex: number, moveId: number) => {
    const member = team[slotIndex]
    if (!member.pokemon) return

    try {
      const moves = await fetchPokemonMoves(member.pokemon.id)
      const move = moves.find((m) => m.id === moveId)
      if (!move) return

      const newTeam = [...team]
      newTeam[slotIndex].moves[moveIndex] = move
      setTeam(newTeam)
    } catch (error) {
      console.error("Failed to load moves:", error)
    }
  }

  const handleRemoveMove = (slotIndex: number, moveIndex: number) => {
    const newTeam = [...team]
    newTeam[slotIndex].moves[moveIndex] = null
    setTeam(newTeam)
  }

  // Calculate team coverage
  const teamCoverage = useMemo(() => {
    const allTypes = POKEMON_TYPES
    const offensiveTypes = new Set<string>()
    const defensiveTypes = new Set<string>()

    // Collect all move types from team
    team.forEach((member) => {
      if (member.pokemon) {
        // Add pokemon types for defensive coverage
        member.pokemon.types.forEach((type) => defensiveTypes.add(type))

        // Add move types for offensive coverage
        member.moves.forEach((move) => {
          if (move && move.type) {
            offensiveTypes.add(move.type)
          }
        })
      }
    })

    // Calculate offensive coverage (what types can be hit super effectively)
    const offensiveCoverage: { [type: string]: number } = {}
    offensiveTypes.forEach((moveType) => {
      allTypes.forEach((defType) => {
        const multiplier = TYPE_CHART[moveType]?.[defType] ?? 1
        if (multiplier > 1) {
          offensiveCoverage[defType] = Math.max(offensiveCoverage[defType] || 0, multiplier)
        }
      })
    })

    // Calculate defensive coverage (what types the team resists/weak to)
    const defensiveCoverage: { [type: string]: number } = {}
    const teamTypes = Array.from(defensiveTypes)
    allTypes.forEach((atkType) => {
      let multiplier = 1
      teamTypes.forEach((defType) => {
        multiplier *= TYPE_CHART[atkType]?.[defType] ?? 1
      })
      if (multiplier !== 1) {
        defensiveCoverage[atkType] = multiplier
      }
    })

    return { offensiveCoverage, defensiveCoverage }
  }, [team])

  // 保存队伍
  const handleSaveTeam = () => {
    if (!teamName.trim()) {
      alert(t.enterTeamName)
      return
    }
    
    const savedMembers: SavedTeamMember[] = team.map((member) => ({
      pokemonId: member.pokemon?.id || 0,
      selectedForm: member.selectedForm,
      moveIds: member.moves.map((move) => move?.id || null),
      ability: member.ability,
      evs: member.evs,
    }))
    
    saveTeam(teamName.trim(), savedMembers)
    setShowSaveDialog(false)
    setTeamName("")
    alert(t.teamSaved)
  }

  // 加载队伍
  const handleLoadTeam = async (teamId: string) => {
    const savedTeam = loadTeam(teamId)
    if (!savedTeam) return

    const loadedTeam: TeamMember[] = await Promise.all(
      savedTeam.members.map(async (savedMember) => {
        if (savedMember.pokemonId === 0) {
          return {
            pokemon: null,
            selectedForm: null,
            moves: [null, null, null, null],
            ability: null,
            evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
          }
        }

        try {
          let pokemon = await fetchPokemonDetail(savedMember.pokemonId)
          
          // 如果选择了形态，加载形态数据
          if (savedMember.selectedForm) {
            const formData = await fetchPokemonFormData(savedMember.selectedForm)
            pokemon = {
              ...pokemon,
              types: formData.types,
              stats: formData.stats,
              abilities: formData.abilities,
              sprites: formData.sprites,
              height: formData.height,
              weight: formData.weight,
            }
          }

          // 加载招式
          const moves = await Promise.all(
            savedMember.moveIds.map(async (moveId) => {
              if (!moveId) return null
              try {
                const allMoves = await fetchPokemonMoves(pokemon.id)
                return allMoves.find((m) => m.id === moveId) || null
              } catch {
                return null
              }
            })
          )

          return {
            pokemon,
            selectedForm: savedMember.selectedForm,
            moves,
            ability: savedMember.ability,
            evs: savedMember.evs,
          }
        } catch (error) {
          console.error("Failed to load pokemon:", error)
          return {
            pokemon: null,
            selectedForm: null,
            moves: [null, null, null, null],
            ability: null,
            evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
          }
        }
      })
    )

    setTeam(loadedTeam)
    setShowLoadDialog(false)
    alert(t.teamLoaded)
  }

  // 删除队伍
  const handleDeleteTeam = (teamId: string) => {
    if (confirm(t.confirmDeleteTeam)) {
      deleteTeam(teamId)
      alert(t.teamDeleted)
    }
  }

  // 重命名队伍
  const handleRenameTeam = (teamId: string, newName: string) => {
    if (!newName.trim()) return
    updateTeamName(teamId, newName.trim())
    setEditingTeamId(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            {t.teamBuilder}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLoadDialog(true)}
              disabled={teams.length === 0}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {t.loadTeam}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              {t.saveTeam}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Slots */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {team.map((member, slotIndex) => (
            <Card key={slotIndex} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t.teamSlot} {slotIndex + 1}
                  </span>
                  {member.pokemon && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemovePokemon(slotIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.pokemon ? (
                  <>
                    <div className="flex items-center gap-2">
                      <img
                        src={member.pokemon.sprites.front || "/placeholder.svg"}
                        alt={member.pokemon.name}
                        className="w-12 h-12 object-contain"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {member.pokemon.names[language] ||
                            member.pokemon.names.zh ||
                            member.pokemon.names.en ||
                            member.pokemon.name}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {member.pokemon.types.map((type) => (
                            <span
                              key={type}
                              className={`type-${type} text-[10px] px-1 py-0.5 rounded text-white`}
                            >
                              {getTypeName(type, language)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 形态选择 */}
                    {member.pokemon.forms && member.pokemon.forms.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs">{t.form}</Label>
                        <Select
                          value={member.selectedForm || "default"}
                          onValueChange={(value) => handleSelectForm(slotIndex, value)}
                          disabled={loadingForm === slotIndex}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder={t.selectForm} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              <div className="flex items-center gap-2">
                                <img
                                  src={member.pokemon.sprites.front || "/placeholder.svg"}
                                  alt="默认"
                                  className="w-6 h-6 object-contain"
                                />
                                <span>{t.defaultForm}</span>
                              </div>
                            </SelectItem>
                            {member.pokemon.forms.map((form) => (
                              <SelectItem key={form.name} value={form.name}>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={form.sprites.front || "/placeholder.svg"}
                                    alt={form.formName}
                                    className="w-6 h-6 object-contain"
                                  />
                                  <div className="flex flex-col">
                                    <span>{form.formName}</span>
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
                    )}
                    
                    {/* 特性选择 */}
                    <div className="space-y-1">
                      <Label className="text-xs">{t.ability}</Label>
                      <Select
                        value={member.ability || ""}
                        onValueChange={(value) => handleSelectAbility(slotIndex, value)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder={t.selectAbility} />
                        </SelectTrigger>
                        <SelectContent>
                          {member.pokemon.abilities.map((ability) => (
                            <SelectItem key={ability.name} value={ability.name}>
                              <div className="flex items-center gap-2">
                                <span>{ability.names[language] || ability.names.zh || ability.names.en || ability.name}</span>
                                {ability.isHidden && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    {t.hiddenAbility}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 努力值设置 */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{t.effortValues}</Label>
                        <span className="text-xs text-muted-foreground">
                          {t.totalEVs}: {Object.values(member.evs).reduce((sum, v) => sum + v, 0)}/510
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(["hp", "attack", "defense", "specialAttack", "specialDefense", "speed"] as const).map((stat) => {
                          const statName = t[stat as keyof typeof t] || stat
                          const value = member.evs[stat]
                          const totalEVs = Object.values(member.evs).reduce((sum, v) => sum + v, 0)
                          const remaining = 510 - totalEVs + value
                          const maxValue = Math.min(252, remaining)
                          return (
                            <div key={stat} className="flex items-center gap-1">
                              <Label className="text-[10px] w-12 truncate">{statName}</Label>
                              <Input
                                type="number"
                                min={0}
                                max={maxValue}
                                value={value}
                                onChange={(e) => {
                                  const newValue = Math.max(0, Math.min(maxValue, Number.parseInt(e.target.value) || 0))
                                  handleChangeEV(slotIndex, stat as keyof TeamMember['evs'], newValue)
                                }}
                                className="h-6 text-xs px-1"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* 招式选择 */}
                    <div className="space-y-1 pt-2 border-t border-border">
                      <Label className="text-xs">{t.selectMoves}</Label>
                      {member.moves.map((move, moveIndex) => (
                        <div key={moveIndex} className="flex items-center gap-1">
                          <Select
                            value={move?.id.toString() || ""}
                            onValueChange={(value) => {
                              handleSelectMove(slotIndex, moveIndex, Number.parseInt(value))
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder={`${t.selectMoves} ${moveIndex + 1}`} />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-60">
                                {member.pokemon && (
                                  <PokemonMoveList pokemonId={member.pokemon.id} />
                                )}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                          {move && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRemoveMove(slotIndex, moveIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Dialog open={selectingSlot === slotIndex} onOpenChange={(open) => setSelectingSlot(open ? slotIndex : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-20">
                        <Plus className="h-4 w-4 mr-2" />
                        {t.addToTeam}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{t.addToTeam}</DialogTitle>
                        <DialogDescription>{t.selectPokemonToCompare.replace("对比", "队伍")}</DialogDescription>
                      </DialogHeader>
                      
                      {/* 搜索框 */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder={t.searchPlaceholder}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <ScrollArea className="h-[60vh]">
                        {filteredPokemonList.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            {t.noResults}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {filteredPokemonList.map((pokemon) => (
                              <button
                                key={pokemon.id}
                                onClick={() => handleSelectPokemon(slotIndex, pokemon.id)}
                                className="flex flex-col items-center p-2 rounded-lg hover:bg-secondary transition-colors"
                              >
                                <img
                                  src={pokemon.sprite || "/placeholder.svg"}
                                  alt={pokemon.name}
                                  className="w-16 h-16 object-contain"
                                />
                                <span className="text-xs mt-1 text-center">
                                  {pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coverage Analysis */}
        {(team.some((m) => m.pokemon) || Object.keys(teamCoverage.offensiveCoverage).length > 0) && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Offensive Coverage */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Swords className="h-4 w-4" />
                {t.offensiveCoverage}
              </h4>
              <div className="flex flex-wrap gap-2">
                {POKEMON_TYPES.map((type) => {
                  const multiplier = teamCoverage.offensiveCoverage[type]
                  if (!multiplier) return null
                  return (
                    <Badge
                      key={type}
                      variant={multiplier >= 2 ? "default" : "secondary"}
                      className={`type-${type} text-white`}
                    >
                      {getTypeName(type, language)} ×{multiplier}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Defensive Coverage */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t.defensiveCoverage}
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">{t.weaknesses}:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(teamCoverage.defensiveCoverage)
                      .filter(([, mult]) => mult > 1)
                      .map(([type, mult]) => (
                        <Badge key={type} variant="destructive">
                          {getTypeName(type, language)} ×{mult}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t.resistances}:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(teamCoverage.defensiveCoverage)
                      .filter(([, mult]) => mult < 1 && mult > 0)
                      .map(([type, mult]) => (
                        <Badge key={type} variant="secondary" className="bg-green-500/20 text-green-400">
                          {getTypeName(type, language)} ×{mult}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 保存队伍对话框 */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.saveTeam}</DialogTitle>
              <DialogDescription>{t.enterTeamName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={t.teamName}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveTeam()
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  {t.close}
                </Button>
                <Button onClick={handleSaveTeam}>{t.saveTeam}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 加载队伍对话框 */}
        <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.savedTeams}</DialogTitle>
              <DialogDescription>{t.loadTeam}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px]">
              {teams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t.noSavedTeams}</div>
              ) : (
                <div className="space-y-2">
                  {teams.map((savedTeam) => (
                    <Card key={savedTeam.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {editingTeamId === savedTeam.id ? (
                            <Input
                              defaultValue={savedTeam.name}
                              onBlur={(e) => {
                                handleRenameTeam(savedTeam.id, e.target.value)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRenameTeam(savedTeam.id, e.currentTarget.value)
                                } else if (e.key === "Escape") {
                                  setEditingTeamId(null)
                                }
                              }}
                              autoFocus
                              className="mb-2"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{savedTeam.name}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setEditingTeamId(savedTeam.id)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {savedTeam.members.filter((m) => m.pokemonId > 0).length}/6 {t.teamSlot}
                            {" · "}
                            {new Date(savedTeam.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadTeam(savedTeam.id)}
                          >
                            {t.loadTeam}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTeam(savedTeam.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function PokemonMoveList({ pokemonId }: { pokemonId: number }) {
  const { t, language } = useLanguage()
  const [moves, setMoves] = useState<Move[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMoves = async () => {
      setIsLoading(true)
      try {
        // 不传 generation 参数，获取所有世代的招式（包括蛋招式、学习机等）
        const data = await fetchPokemonMoves(pokemonId)
        setMoves(data)
      } catch (error) {
        console.error("Failed to load moves:", error)
      }
      setIsLoading(false)
    }
    loadMoves()
  }, [pokemonId])

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">{t.loading}</div>
  }

  // 按学习方式分组
  const movesByMethod: { [key: string]: Move[] } = {
    "level-up": [],
    "machine": [],
    "tutor": [],
    "egg": [],
    "other": [],
  }

  moves.forEach((move) => {
    const method = move.learnMethod
    if (movesByMethod[method]) {
      movesByMethod[method].push(move)
    } else {
      movesByMethod.other.push(move)
    }
  })

  const methodLabels: { [key: string]: string } = {
    "level-up": t.levelUpMoves,
    "machine": t.tmMoves,
    "tutor": "教学",
    "egg": "蛋招式",
    "other": "其他",
  }

  return (
    <>
      {Object.entries(movesByMethod).map(([method, methodMoves]) => {
        if (methodMoves.length === 0) return null
        return (
          <div key={method}>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground sticky top-0 bg-popover">
              {methodLabels[method] || method}
            </div>
            {methodMoves.map((move) => (
              <SelectItem key={move.id} value={move.id.toString()}>
                <div className="flex items-center gap-2">
                  <span className={`type-${move.type} w-2 h-2 rounded-full`} />
                  <span className="flex-1">{move.names[language] || move.names.zh || move.names.en || move.name}</span>
                  {move.power && <span className="text-xs text-muted-foreground">{move.power}</span>}
                </div>
              </SelectItem>
            ))}
          </div>
        )
      })}
    </>
  )
}

