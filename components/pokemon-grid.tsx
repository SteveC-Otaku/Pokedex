"use client"

import { useMemo } from "react"
import type { PokemonListItem } from "@/lib/pokemon-types"
import { GENERATIONS, getTypeName } from "@/lib/pokemon-types"
import type { FilterState, SortBy } from "./pokemon-filters"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { FavoriteButton } from "./favorite-button"

interface PokemonGridProps {
  pokemonList: PokemonListItem[]
  filters: FilterState
  sortBy: SortBy
  sortOrder: "asc" | "desc"
  onSelect: (pokemon: PokemonListItem) => void
  selectedId?: number
  isLoading?: boolean
  statsMap?: Record<number, { [key: string]: number }> // 可选的种族值映射
}

export function PokemonGrid({
  pokemonList,
  filters,
  sortBy,
  sortOrder,
  onSelect,
  selectedId,
  isLoading,
  statsMap,
}: PokemonGridProps) {
  const { t, language } = useLanguage()
  
  const filteredAndSorted = useMemo(() => {
    let result = [...pokemonList]

    // 按地区筛选（如果选择了地区）
    if (filters.region !== null) {
      const selectedGen = GENERATIONS.find((g) => g.region === filters.region)
      if (selectedGen) {
        const [minId, maxId] = selectedGen.pokemonRange
        result = result.filter((p) => p.id >= minId && p.id <= maxId)
      }
    }

    // 按属性筛选（多选，必须同时包含所有选择的属性）
    if (filters.types.length > 0) {
      result = result.filter((p) => filters.types.every((t) => p.types.includes(t)))
    }

    // 排序
    result.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === "id") {
        comparison = a.id - b.id
      } else if (sortBy === "name") {
        const nameA = a.names[language] || a.names.zh || a.names.en || a.name
        const nameB = b.names[language] || b.names.zh || b.names.en || b.name
        const locale = language === "zh" ? "zh" : language === "ja" ? "ja" : "en"
        comparison = nameA.localeCompare(nameB, locale)
      } else if (statsMap) {
        // 按种族值排序（需要 statsMap）
        const statsA = statsMap[a.id]
        const statsB = statsMap[b.id]
        
        if (statsA && statsB) {
          if (sortBy === "total") {
            const totalA = statsA.hp + statsA.attack + statsA.defense + 
                          statsA.specialAttack + statsA.specialDefense + statsA.speed
            const totalB = statsB.hp + statsB.attack + statsB.defense + 
                          statsB.specialAttack + statsB.specialDefense + statsB.speed
            comparison = totalA - totalB
          } else if (sortBy in statsA && sortBy in statsB) {
            comparison = statsA[sortBy] - statsB[sortBy]
          }
        } else if (statsA && !statsB) {
          comparison = -1 // A 有数据，B 没有，A 排在前面
        } else if (!statsA && statsB) {
          comparison = 1 // B 有数据，A 没有，B 排在前面
        }
        // 如果都没有数据，保持原顺序（comparison = 0）
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })

    return result
  }, [pokemonList, filters, sortBy, sortOrder, language, statsMap])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    )
  }
  
  if (filteredAndSorted.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{t.noPokemonFound}</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {filteredAndSorted.map((pokemon) => (
        <button
          key={pokemon.id}
          onClick={() => onSelect(pokemon)}
          className={cn(
            "group relative aspect-square rounded-xl bg-card border border-border/50 p-2 transition-all duration-200",
            "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-105",
            selectedId === pokemon.id && "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30",
          )}
        >
          <div className="absolute top-2 left-2 text-xs font-mono text-muted-foreground">
            #{pokemon.id.toString().padStart(3, "0")}
          </div>
          <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
            <FavoriteButton pokemonId={pokemon.id} size="sm" />
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 pb-16">
            <img
              src={pokemon.sprite || "/placeholder.svg"}
              alt={pokemon.name}
              className="w-full h-full max-h-full object-contain pixelated"
              loading="lazy"
            />
          </div>
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <div className="bg-card/95 backdrop-blur-sm rounded-md px-1 py-0.5">
              <div className="text-sm font-medium truncate text-center">
                {pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}
              </div>
              <div className="flex justify-center gap-1 mt-1">
                {pokemon.types.map((type) => (
                  <span key={type} className={`type-${type} text-[10px] px-1.5 py-0.5 rounded text-white`}>
                    {getTypeName(type, language)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
