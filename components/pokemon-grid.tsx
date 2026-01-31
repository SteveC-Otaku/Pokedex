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
      <div className="pokedex-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="pokedex-grid-item min-h-[160px] flex flex-col rounded-2xl animate-pulse overflow-hidden">
            <div className="h-6 mx-3 mt-3 w-12 rounded-full bg-muted/50" />
            <div className="flex-1 mx-3 my-2 rounded-xl bg-muted/40" />
            <div className="mx-3 mb-3 rounded-2xl h-12 bg-muted/50" />
          </div>
        ))}
      </div>
    )
  }

  if (filteredAndSorted.length === 0) {
    // 检查是否是第9世代筛选但没有数据
    const selectedGen = filters.region ? GENERATIONS.find((g) => g.region === filters.region) : null
    const isGen9 = selectedGen?.id === 9
    
    if (isGen9) {
      return (
        <div className="text-center py-12 space-y-2">
          <p className="text-muted-foreground">{t.waitingForDataSource || "等待数据源更新"}</p>
          <p className="text-sm text-muted-foreground">（数据源尚未包含第9世代的宝可梦数据）</p>
        </div>
      )
    }
    
    return <div className="text-center py-12 text-muted-foreground">{t.noPokemonFound}</div>
  }

  return (
    <div className="pokedex-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {filteredAndSorted.map((pokemon) => (
        <div
          key={pokemon.id}
          onClick={() => onSelect(pokemon)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onSelect(pokemon)
            }
          }}
          className={cn(
            "pokedex-grid-item group flex flex-col rounded-2xl overflow-hidden transition-[transform,box-shadow,border-color] duration-300 cursor-pointer min-w-0 min-h-[160px] relative",
            "hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
            selectedId === pokemon.id && "border-primary/60 shadow-xl shadow-primary/10 ring-2 ring-primary/20",
          )}
          data-selected={selectedId === pokemon.id ? "true" : undefined}
        >
          {selectedId === pokemon.id && (
            <div className="pokedex-grid-item-spotlight absolute inset-0 pointer-events-none rounded-2xl z-0" aria-hidden />
          )}
          <div className="flex items-center justify-between px-3 pt-3 pb-0 relative z-10">
            <span className="rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-mono font-medium text-muted-foreground px-2 py-0.5 tracking-wide">
              #{pokemon.id.toString().padStart(3, "0")}
            </span>
            <div onClick={(e) => e.stopPropagation()} className="-mr-0.5">
              <FavoriteButton pokemonId={pokemon.id} size="sm" />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center px-3 py-2 relative z-10">
            <div className="w-full h-full flex items-center justify-center rounded-xl bg-black/[0.02] dark:bg-white/[0.04] p-2">
              <img
                src={pokemon.sprite || "/placeholder.svg"}
                alt={pokemon.name}
                className="w-full max-h-[78px] sm:max-h-[92px] object-contain pixelated drop-shadow-sm"
                loading="lazy"
              />
            </div>
          </div>
          <div className="px-3 pb-3 pt-1 shrink-0 relative z-10">
            <div className="rounded-2xl bg-white/80 dark:bg-white/15 backdrop-blur-md border border-gray-200/80 dark:border-white/20 shadow-sm shadow-black/[0.03] dark:shadow-black/20 px-3 py-2">
              <div className="text-sm font-semibold text-center text-foreground tracking-tight break-words leading-tight line-clamp-2">
                {pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-1.5">
                {pokemon.types.map((type) => (
                  <span key={type} className={`type-${type} text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ring-1 ring-black/10 dark:ring-white/30 shadow-sm`}>
                    {getTypeName(type, language)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
