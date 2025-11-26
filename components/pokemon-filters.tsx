"use client"

import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { POKEMON_TYPES, getTypeName, GENERATIONS, REGION_NAMES_ZH } from "@/lib/pokemon-types"
import { useLanguage } from "@/contexts/language-context"

export interface FilterState {
  region: string | null // null 表示全部地区（全国图鉴）
  types: string[] // 多选属性
}

export type SortBy = 
  | "id" 
  | "name" 
  | "hp" 
  | "attack" 
  | "defense" 
  | "specialAttack" 
  | "specialDefense" 
  | "speed" 
  | "total"

export type SortOrder = "asc" | "desc"

interface PokemonFiltersProps {
  filters: FilterState
  sortBy: SortBy
  sortOrder: SortOrder
  onFiltersChange: (filters: FilterState) => void
  onSortByChange: (sortBy: SortBy) => void
  onSortOrderChange: (sortOrder: SortOrder) => void
}

export function PokemonFilters({ 
  filters, 
  sortBy, 
  sortOrder,
  onFiltersChange, 
  onSortByChange,
  onSortOrderChange 
}: PokemonFiltersProps) {
  const { t, language } = useLanguage()

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type) 
      ? filters.types.filter((t) => t !== type) 
      : [...filters.types, type]
    onFiltersChange({ ...filters, types: newTypes })
  }

  const setRegion = (region: string | null) => {
    onFiltersChange({ ...filters, region })
  }

  const clearFilters = () => {
    onFiltersChange({ types: [], region: null })
  }

  const hasActiveFilters = filters.types.length > 0 || filters.region !== null

  // 排序选项
  const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: "id", label: t.sortById },
    { value: "name", label: t.sortByName },
    { value: "hp", label: `${t.hp} (${t.stats})` },
    { value: "attack", label: `${t.attack} (${t.stats})` },
    { value: "defense", label: `${t.defense} (${t.stats})` },
    { value: "specialAttack", label: `${t.specialAttack} (${t.stats})` },
    { value: "specialDefense", label: `${t.specialDefense} (${t.stats})` },
    { value: "speed", label: `${t.speed} (${t.stats})` },
    { value: "total", label: `${t.total} (${t.stats})` },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* 世代/地区选择 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {filters.region === null 
                ? t.allGenerations 
                : REGION_NAMES_ZH[filters.region] || GENERATIONS.find(g => g.region === filters.region)?.names[language]
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>{t.selectRegion}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup 
              value={filters.region || "all"} 
              onValueChange={(value) => setRegion(value === "all" ? null : value)}
            >
              <DropdownMenuRadioItem value="all">
                {t.allGenerations}
              </DropdownMenuRadioItem>
              {GENERATIONS.map((gen) => (
                <DropdownMenuRadioItem key={gen.region} value={gen.region}>
                  {REGION_NAMES_ZH[gen.region]} ({gen.names[language] || gen.names.zh})
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 属性多选 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {t.type}
              {filters.types.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {filters.types.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-[70vh] overflow-y-auto p-3">
            <DropdownMenuLabel className="px-2 mb-2">{t.selectType}</DropdownMenuLabel>
            <div className="grid grid-cols-2 gap-2">
              {POKEMON_TYPES.map((type) => {
                const isSelected = filters.types.includes(type)
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
                    <span>
                      {getTypeName(type, language)}
                    </span>
                    {isSelected && (
                      <span className="absolute top-0.5 right-0.5 text-[10px] font-bold">✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 排序选择 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {t.sort}
              <span className="text-muted-foreground text-xs">
                ({SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || t.sortById})
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>{t.sort}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => onSortByChange(v as SortBy)}>
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t.sortOrder || "排序方向"}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => onSortOrderChange(v as SortOrder)}>
              <DropdownMenuRadioItem value="asc">
                ↑ {t.ascending || "升序"}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">
                ↓ {t.descending || "降序"}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-4 w-4" />
            {t.clear}
          </Button>
        )}
      </div>

      {/* 已选筛选条件显示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.region !== null && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => setRegion(null)}
            >
              {REGION_NAMES_ZH[filters.region]}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.types.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleType(type)}
            >
              <span className={`type-${type} w-2 h-2 rounded-full`} />
              {getTypeName(type, language)}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
